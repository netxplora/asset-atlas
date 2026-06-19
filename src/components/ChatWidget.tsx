import { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageCircle, X, Send, ShieldCheck, UserCircle,
  Paperclip, FileText, Check, CheckCheck, Loader2, ChevronUp, Circle
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
  open: { label: "Open", color: "bg-emerald-500" },
  pending: { label: "Pending", color: "bg-amber-500" },
  resolved: { label: "Resolved", color: "bg-sky-500" },
  closed: { label: "Closed", color: "bg-zinc-400" },
};

function Attachment({ url, type, sender }: { url: string; type: string; sender: string }) {
  const isUser = sender === "user";
  if (type === "image") {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block mt-1.5">
        <img src={url} alt="Attachment" className="rounded-lg object-cover max-w-[200px] max-h-[140px] border border-white/10" />
      </a>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className={`flex items-center gap-2 mt-1.5 px-3 py-2 rounded-lg text-xs transition-colors ${isUser ? "bg-white/10 hover:bg-white/20" : "bg-background/50 hover:bg-background/80"}`}>
      <FileText className="h-4 w-4 shrink-0" />
      <span className="truncate">View attachment</span>
    </a>
  );
}

function DeliveryStatus({ msg }: { msg: any }) {
  if (msg.sender_type !== "user") return null;
  if (msg.is_read) return <CheckCheck className="h-3 w-3 text-sky-400" />;
  if (msg.is_delivered) return <CheckCheck className="h-3 w-3 text-muted-foreground/40" />;
  return <Check className="h-3 w-3 text-muted-foreground/40" />;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(0);
  const [allMsgs, setAllMsgs] = useState<any[]>([]);
  const [adminTyping, setAdminTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [isBottom, setIsBottom] = useState(true);
  const typingTimeout = useRef<any>(null);
  const [showFaqs, setShowFaqs] = useState(true); // new

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

    // Also listen for conversation status changes
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
    
    // Instantly send user question
    await supabase.from("chat_messages").insert({
      conversation_id: convId,
      sender_id: user.id,
      sender_type: "user",
      message: faq.question,
    });

    // Update conversation timestamp so it appears at top of admin list
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
      }, 1000);
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

  // Group by date
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
        <div className="bg-card w-[calc(100vw-2rem)] sm:w-[400px] h-[78vh] sm:h-[540px] mb-3 rounded-2xl shadow-2xl border flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* ─── Header ─── */}
          <div className="bg-primary px-4 py-3 text-primary-foreground flex justify-between items-center shrink-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm">Live Support</h3>
                {status && (
                  <Badge className={`text-[9px] px-1.5 py-0 h-4 ${status.color} text-white border-0`}>
                    {status.label}
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-primary-foreground/60 mt-0.5">We typically reply in a few minutes</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-primary-foreground hover:bg-primary/80 h-8 w-8 shrink-0">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* ─── Messages ─── */}
          <div ref={scrollRef} onScroll={onScroll} className="flex-1 px-3 py-2 sm:px-4 sm:py-3 overflow-y-auto">
            {msgData?.hasMore && (
              <div className="flex justify-center mb-3">
                <Button variant="ghost" size="sm" onClick={() => setPage(p => p + 1)} className="text-xs text-muted-foreground h-7 gap-1">
                  <ChevronUp className="h-3 w-3" /> Load older messages
                </Button>
              </div>
            )}

            {allMsgs.length === 0 && (
              <div className="flex justify-start gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1">
                  <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide block mb-0.5">Admin</span>
                  <div className="bg-muted p-3 rounded-2xl rounded-tl-sm text-sm mb-2">Hi there! 👋 How can we help you today?</div>
                  
                  {/* FAQs Quick Responses */}
                  {showFaqs && faqs.length > 0 && (
                    <div className="flex flex-col gap-1.5 mt-2 max-w-[85%] animate-in fade-in-50 duration-500">
                      <p className="text-[10px] text-muted-foreground ml-1 uppercase tracking-wider font-semibold">Suggested Topics</p>
                      {faqs.map((faq) => (
                        <button
                          key={faq.id}
                          onClick={() => handleFaqClick(faq)}
                          className="bg-primary/5 hover:bg-primary/10 border border-primary/20 text-primary text-xs text-left px-3 py-2 rounded-xl transition-colors"
                        >
                          {faq.question}
                        </button>
                      ))}
                      <button
                        onClick={() => setShowFaqs(false)}
                        className="bg-muted/50 hover:bg-muted border border-border text-xs text-left px-3 py-2 rounded-xl transition-colors text-muted-foreground mt-1"
                      >
                        Others / Skip
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {dateGroups.map(([dk, msgs]) => (
              <div key={dk}>
                <div className="flex items-center justify-center my-3">
                  <div className="h-px bg-border flex-1" />
                  <span className="text-[9px] text-muted-foreground/60 px-2 font-medium uppercase tracking-wider">{formatDate(msgs[0].created_at)}</span>
                  <div className="h-px bg-border flex-1" />
                </div>
                <div className="space-y-2.5">
                  {msgs.map((msg: any) => {
                    const isSender = msg.sender_type === "user";
                    return (
                      <div key={msg.id} className={`flex w-full gap-2 ${isSender ? "justify-end" : "justify-start"}`}>
                        {!isSender && (
                          <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0 mt-0.5">
                            <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                          </div>
                        )}
                        <div className={`max-w-[80%] flex flex-col ${isSender ? "items-end" : "items-start"}`}>
                          <div className={`flex items-center gap-1.5 mb-1 ${isSender ? "flex-row-reverse" : "flex-row"}`}>
                            <span className="text-[9px] text-muted-foreground/50">{formatTime(msg.created_at)}</span>
                          </div>
                          <div className={`px-3 py-2 text-[13px] leading-relaxed ${
                            isSender
                              ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                              : "bg-muted text-foreground rounded-2xl rounded-tl-sm"
                          }`}>
                            {msg.attachment_url ? (
                              <>
                                {msg.message && <p className="mb-1">{msg.message}</p>}
                                <Attachment url={msg.attachment_url} type={msg.attachment_type || "file"} sender={msg.sender_type} />
                              </>
                            ) : msg.message}
                          </div>
                          {isSender && (
                            <div className="mt-0.5"><DeliveryStatus msg={msg} /></div>
                          )}
                        </div>
                        {isSender && (
                          <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                            <UserCircle className="h-3 w-3 text-primary" />
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
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="bg-muted px-3 py-2 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1">
                    <Circle className="h-1.5 w-1.5 fill-muted-foreground/50 text-transparent animate-bounce" style={{ animationDelay: "0ms" }} />
                    <Circle className="h-1.5 w-1.5 fill-muted-foreground/50 text-transparent animate-bounce" style={{ animationDelay: "150ms" }} />
                    <Circle className="h-1.5 w-1.5 fill-muted-foreground/50 text-transparent animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ─── Input ─── */}
          <div className="p-2.5 border-t bg-background flex items-center gap-1.5 shrink-0">
            <input ref={fileRef} type="file" accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.csv" className="hidden" onChange={handleFile} />
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground" onClick={() => fileRef.current?.click()} disabled={uploadFile.isPending}>
              {uploadFile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
            </Button>
            <Input
              placeholder={showFaqs && allMsgs.length === 0 ? "Select an option or type a message..." : "Write a message..."}
              value={message}
              onChange={e => handleInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              onClick={() => setShowFaqs(false)}
              className="bg-muted border-none text-sm h-9"
            />
            <Button size="icon" onClick={handleSend} disabled={!message.trim() || sendMsg.isPending} className="shrink-0 h-8 w-8">
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* ─── FAB ─── */}
      <Button onClick={() => setIsOpen(!isOpen)} size="icon" className="h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-xl relative">
        {isOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />}
        {!isOpen && unread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">{unread}</span>
        )}
      </Button>
    </div>
  );
}
