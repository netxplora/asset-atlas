import { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageCircle, X, Send, ShieldCheck, UserCircle,
  Paperclip, FileText, Check, CheckCheck, Loader2, ChevronUp, Circle,
  Maximize2, Minimize2, Sparkles, HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  useUserConversation,
  useConversationMessages,
  useSendChatMessage,
  useChatFileUpload,
  useMarkMessagesRead,
  useTypingIndicator,
  useActiveChatFaqs,
  useIncrementFaqUsage,
  type ChatFaq,
} from "@/hooks/useSupportChat";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// ─── Helpers ──────────────────────────────────────────────
function formatTime(d: string) {
  return new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(d: string) {
  const date = new Date(d);
  const today = new Date();
  const yest = new Date(today);
  yest.setDate(yest.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yest.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  open: { label: "Active", color: "bg-emerald-500" },
  pending: { label: "Awaiting Reply", color: "bg-amber-500" },
  resolved: { label: "Resolved", color: "bg-blue-500" },
  closed: { label: "Closed", color: "bg-muted-foreground" },
};

function Attachment({ url, type, sender }: { url: string; type: string; sender: string }) {
  const isUser = sender === "user";
  if (type === "image") {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block mt-1.5 overflow-hidden rounded-lg border border-border/40">
        <img src={url} alt="Attachment" className="rounded-lg object-cover max-w-[220px] max-h-[150px] transition-transform hover:scale-105" />
      </a>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2 mt-1.5 px-3 py-2 rounded-lg text-xs transition-colors ${
        isUser ? "bg-white/10 hover:bg-white/20" : "bg-card hover:bg-muted"
      }`}
    >
      <FileText className="h-4 w-4 shrink-0" />
      <span className="truncate font-medium">View Attachment</span>
    </a>
  );
}

function DeliveryStatus({ msg }: { msg: any }) {
  if (msg.sender_type !== "user") return null;
  if (msg.is_read) return <CheckCheck className="h-3 w-3 text-primary" />;
  if (msg.is_delivered) return <CheckCheck className="h-3 w-3 text-muted-foreground/60" />;
  return <Check className="h-3 w-3 text-muted-foreground/60" />;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(0);
  const [allMsgs, setAllMsgs] = useState<any[]>([]);
  const [adminTyping, setAdminTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [isBottom, setIsBottom] = useState(true);
  const typingTimeout = useRef<any>(null);
  const [showFaqs, setShowFaqs] = useState(true);

  const { user } = useAuth();
  const { data: conversation, refetch: refetchConv } = useUserConversation();
  const convId = conversation?.id || null;
  const { data: msgData, refetch: refetchMsgs } = useConversationMessages(convId, page);
  const sendMsg = useSendChatMessage();
  const uploadFile = useChatFileUpload();
  const markRead = useMarkMessagesRead();
  const typing = useTypingIndicator(convId);
  const { data: faqs = [] } = useActiveChatFaqs();
  const incUsage = useIncrementFaqUsage();

  // Merge pagination
  useEffect(() => {
    if (msgData?.messages) {
      if (page === 0) setAllMsgs(msgData.messages);
      else setAllMsgs(prev => {
        const ids = new Set(prev.map(m => m.id));
        return [...msgData.messages.filter((m: any) => !ids.has(m.id)), ...prev];
      });
    }
  }, [msgData, page]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current && isBottom) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allMsgs, isOpen, adminTyping]);

  // Scroll tracking
  const onScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setIsBottom(scrollHeight - scrollTop - clientHeight < 40);
  }, []);

  // Mark admin messages as read when chat is open
  useEffect(() => {
    if (isOpen && convId) {
      markRead.mutate({ conversationId: convId, senderType: "admin" });
    }
  }, [isOpen, allMsgs, convId]);

  // Realtime: messages + typing
  useEffect(() => {
    if (!convId) return;
    const msgChannel = supabase
      .channel(`chat_msgs_user_${convId}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "chat_messages",
        filter: `conversation_id=eq.${convId}`,
      }, () => { setPage(0); refetchMsgs(); })
      .subscribe();

    const typingChannel = supabase
      .channel(`typing:${convId}`)
      .on("broadcast", { event: "typing" }, (payload: any) => {
        if (payload?.payload?.senderType === "admin") {
          setAdminTyping(payload.payload.isTyping);
          if (typingTimeout.current) clearTimeout(typingTimeout.current);
          if (payload.payload.isTyping) {
            typingTimeout.current = setTimeout(() => setAdminTyping(false), 4000);
          }
        }
      })
      .subscribe();

    const convChannel = supabase
      .channel(`conv_user_${convId}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "conversations",
        filter: `id=eq.${convId}`,
      }, () => refetchConv())
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(typingChannel);
      supabase.removeChannel(convChannel);
    };
  }, [convId]);

  const handleSend = () => {
    if (!message.trim() || !convId) return;
    setShowFaqs(false);
    sendMsg.mutate({ conversationId: convId, message: message.trim(), senderType: "user" });
    setMessage("");
    setIsBottom(true);
    typing.sendTyping(false, "user");
  };

  const handleFaqClick = async (faq: ChatFaq) => {
    if (!convId || !user) return;
    setShowFaqs(false);
    incUsage.mutate(faq.id);
    
    await supabase.from("chat_messages").insert({
      conversation_id: convId,
      sender_id: user.id,
      sender_type: "user",
      message: faq.question,
    });

    await supabase.from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", convId);
    
    setIsBottom(true);

    if (faq.answer) {
      setAdminTyping(true);
      setTimeout(async () => {
        await supabase.from("chat_messages").insert({
          conversation_id: convId,
          sender_id: user.id,
          sender_type: "admin",
          message: faq.answer,
        });
        setAdminTyping(false);
        setIsBottom(true);
      }, 900);
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !convId) return;
    try {
      const res = await uploadFile.mutateAsync(f);
      sendMsg.mutate({
        conversationId: convId, message: f.name, senderType: "user",
        attachment_url: res.url, attachment_type: res.type,
      });
      setIsBottom(true);
    } catch { /* handled */ }
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleInput = (val: string) => {
    setMessage(val);
    typing.sendTyping(val.length > 0, "user");
  };

  const unread = allMsgs.filter(m => m.sender_type === "admin" && !m.is_read).length;
  const status = STATUS_MAP[conversation?.status || "open"];

  const dateGroups: [string, any[]][] = [];
  const gm: Record<string, any[]> = {};
  allMsgs.forEach(m => {
    const k = new Date(m.created_at).toDateString();
    if (!gm[k]) { gm[k] = []; dateGroups.push([k, gm[k]]); }
    gm[k].push(m);
  });

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div
          className={`bg-card shadow-elevation-xl flex flex-col overflow-hidden transition-all duration-300 z-[60] ${
            isMaximized
              ? "fixed inset-0 sm:inset-10 w-full sm:w-auto h-full sm:h-auto max-w-4xl mx-auto sm:rounded-2xl border-0 sm:border border-border"
              : "fixed bottom-[76px] sm:bottom-[84px] right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[380px] h-[75vh] max-h-[600px] rounded-2xl border border-border animate-fade-in-up"
          }`}
        >
          {/* Header */}
          <div className="bg-primary px-4 py-3.5 text-primary-foreground flex justify-between items-center shrink-0 border-b border-primary/20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-9 w-9 rounded-full bg-white/15 flex items-center justify-center backdrop-blur-sm">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-semibold text-sm">AssetVault Support</h3>
                  {status && (
                    <Badge className={`text-[9px] px-1.5 py-0 h-4 ${status.color} text-white border-0 font-medium`}>
                      {status.label}
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-primary-foreground/75">Official Client Support Team</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMaximized(!isMaximized)}
                className="text-primary-foreground hover:bg-white/15 h-8 w-8 shrink-0 hidden sm:inline-flex"
                aria-label={isMaximized ? "Restore size" : "Maximize chat"}
              >
                {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground hover:bg-white/15 h-8 w-8 shrink-0"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages Feed */}
          <div ref={scrollRef} onScroll={onScroll} className="flex-1 px-4 py-3 overflow-y-auto space-y-3 bg-background/50">
            {msgData?.hasMore && (
              <div className="flex justify-center mb-2">
                <Button variant="ghost" size="sm" onClick={() => setPage(p => p + 1)} className="text-xs text-muted-foreground h-7 gap-1">
                  <ChevronUp className="h-3 w-3" /> Load previous messages
                </Button>
              </div>
            )}

            {allMsgs.length === 0 && (
              <div className="flex flex-col gap-3 py-2 animate-fade-in">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="bg-card border border-border/70 p-3.5 rounded-2xl rounded-tl-sm text-sm text-foreground shadow-sm">
                      <p className="font-semibold text-foreground mb-1">Hello and welcome to AssetVault.</p>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        Our verified client team is ready to assist you with accounts, deposits, copy trading, or platform questions.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Suggested Topics */}
                {showFaqs && faqs.length > 0 && (
                  <div className="pl-9 space-y-2">
                    <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1">
                      <HelpCircle className="h-3 w-3" /> Quick Inquiries
                    </p>
                    <div className="space-y-1.5">
                      {faqs.slice(0, 4).map((faq) => (
                        <button
                          key={faq.id}
                          onClick={() => handleFaqClick(faq)}
                          className="w-full text-left bg-muted/60 hover:bg-primary/10 hover:border-primary/30 border border-border/60 text-xs px-3 py-2 rounded-lg transition-colors font-medium text-foreground"
                        >
                          {faq.question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {dateGroups.map(([dk, msgs]) => (
              <div key={dk} className="space-y-3">
                <div className="flex items-center justify-center my-3">
                  <div className="h-px bg-border/60 flex-1" />
                  <span className="text-[10px] text-muted-foreground px-2 font-medium uppercase tracking-wider">
                    {formatDate(msgs[0].created_at)}
                  </span>
                  <div className="h-px bg-border/60 flex-1" />
                </div>
                <div className="space-y-2.5">
                  {msgs.map((msg: any) => {
                    const isSender = msg.sender_type === "user";
                    return (
                      <div key={msg.id} className={`flex w-full gap-2 ${isSender ? "justify-end" : "justify-start"}`}>
                        {!isSender && (
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                          </div>
                        )}
                        <div className={`max-w-[82%] flex flex-col ${isSender ? "items-end" : "items-start"}`}>
                          <div className={`px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                            isSender
                              ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                              : "bg-card border border-border text-foreground rounded-2xl rounded-tl-sm"
                          }`}>
                            {msg.attachment_url ? (
                              <>
                                {msg.message && <p className="mb-1">{msg.message}</p>}
                                <Attachment url={msg.attachment_url} type={msg.attachment_type || "file"} sender={msg.sender_type} />
                              </>
                            ) : (
                              msg.message
                            )}
                          </div>
                          <div className={`flex items-center gap-1 mt-1 text-[10px] text-muted-foreground ${isSender ? "justify-end" : "justify-start"}`}>
                            <span>{formatTime(msg.created_at)}</span>
                            {isSender && <DeliveryStatus msg={msg} />}
                          </div>
                        </div>
                        {isSender && (
                          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5 text-xs font-semibold text-primary">
                            <UserCircle className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {adminTyping && (
              <div className="flex items-center gap-2 mt-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="bg-card border border-border px-3 py-2 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1 items-center">
                    <Circle className="h-1.5 w-1.5 fill-muted-foreground text-transparent animate-bounce" style={{ animationDelay: "0ms" }} />
                    <Circle className="h-1.5 w-1.5 fill-muted-foreground text-transparent animate-bounce" style={{ animationDelay: "150ms" }} />
                    <Circle className="h-1.5 w-1.5 fill-muted-foreground text-transparent animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t bg-card flex items-center gap-2 shrink-0">
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.csv"
              className="hidden"
              onChange={handleFile}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => fileRef.current?.click()}
              disabled={uploadFile.isPending}
              aria-label="Attach file"
            >
              {uploadFile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
            </Button>
            <Input
              placeholder={showFaqs && allMsgs.length === 0 ? "Select a topic or type your message..." : "Type your message here..."}
              value={message}
              onChange={e => handleInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              onClick={() => setShowFaqs(false)}
              className="bg-muted/50 border border-border text-xs h-9 focus-visible:ring-primary"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!message.trim() || sendMsg.isPending}
              className="shrink-0 h-9 w-9 shadow-sm"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className="h-14 w-14 rounded-full shadow-elevation-xl relative transition-transform hover:scale-105 active:scale-95 bg-primary text-primary-foreground"
        aria-label={isOpen ? "Close live support" : "Open live support"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!isOpen && unread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse">
            {unread}
          </span>
        )}
      </Button>
    </div>
  );
}
