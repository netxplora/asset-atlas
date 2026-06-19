import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Search, Send, ShieldCheck, UserCircle, MessageSquare, Paperclip,
  FileText, Check, CheckCheck, Loader2, ArrowLeft, ChevronUp,
  Circle, Archive, StickyNote, Shield, Clock,
  AlertCircle, User, Wallet, CalendarDays, Trash2, RotateCcw,
  XCircle, Eraser, MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useAdminConversations,
  useConversationMessages,
  useSendChatMessage,
  useChatFileUpload,
  useMarkMessagesRead,
  useUpdateConversation,
  useAddConversationNote,
  useConversationNotes,
  useTypingIndicator,
  useClearChat,
  useCloseAndArchive,
  useReopenConversation,
  useDeleteConversation,
  useChatFaqs,
  useUpsertFaq,
  useDeleteFaq,
  type Conversation,
  type ChatFaq,
} from "@/hooks/useSupportChat";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// ─── Helpers ──────────────────────────────────────────────────
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
  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}
function fullDate(d: string) {
  return new Date(d).toLocaleDateString([], { year: "numeric", month: "long", day: "numeric" });
}

const STATUS_OPTS = [
  { value: "open", label: "Open", color: "bg-emerald-500", text: "text-emerald-600" },
  { value: "pending", label: "Pending", color: "bg-amber-500", text: "text-amber-600" },
  { value: "resolved", label: "Resolved", color: "bg-sky-500", text: "text-sky-600" },
  { value: "closed", label: "Closed", color: "bg-zinc-400", text: "text-zinc-500" },
];
const PRIORITY_OPTS = [
  { value: "low", label: "Low", color: "text-zinc-500" },
  { value: "normal", label: "Normal", color: "text-blue-500" },
  { value: "high", label: "High", color: "text-amber-500" },
  { value: "urgent", label: "Urgent", color: "text-red-500" },
];
function statusMeta(s: string) { return STATUS_OPTS.find(o => o.value === s) || STATUS_OPTS[0]; }
function priorityMeta(p: string) { return PRIORITY_OPTS.find(o => o.value === p) || PRIORITY_OPTS[1]; }

function AttachmentBubble({ url, type }: { url: string; type: string }) {
  if (type === "image") {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block mt-1.5">
        <img src={url} alt="Attachment" className="rounded-lg object-cover max-w-[260px] max-h-[200px] border border-white/10" />
      </a>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-2 mt-1.5 px-3 py-2 rounded-lg bg-background/20 hover:bg-background/30 transition text-xs">
      <FileText className="h-4 w-4 shrink-0" />
      <span className="truncate">View attachment</span>
    </a>
  );
}

function ReadIndicator({ msg }: { msg: any }) {
  if (msg.sender_type !== "admin") return null;
  if (msg.is_read) return <CheckCheck className="h-3 w-3 text-sky-400" />;
  if (msg.is_delivered) return <CheckCheck className="h-3 w-3 text-muted-foreground/40" />;
  return <Check className="h-3 w-3 text-muted-foreground/40" />;
}

export default function AdminSupport() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [page, setPage] = useState(0);
  const [allMsgs, setAllMsgs] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newNote, setNewNote] = useState("");
  const [showContacts, setShowContacts] = useState(true);
  const [showInfo, setShowInfo] = useState(true);
  const [userTyping, setUserTyping] = useState(false);
  
  // FAQ Management State
  const [showFaqDialog, setShowFaqDialog] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Partial<ChatFaq> | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [isBottom, setIsBottom] = useState(true);
  const typingTimeout = useRef<any>(null);

  const { data: conversations = [], refetch: refetchConvs } = useAdminConversations({
    status: statusFilter, priority: priorityFilter, search, archived: showArchived,
  });
  const { data: msgData, refetch: refetchMsgs } = useConversationMessages(selectedConv?.id || null, page);
  const sendMsg = useSendChatMessage();
  const uploadFile = useChatFileUpload();
  const markRead = useMarkMessagesRead();
  const updateConv = useUpdateConversation();
  const addNote = useAddConversationNote();
  const { data: notes = [] } = useConversationNotes(selectedConv?.id || null);
  const typing = useTypingIndicator(selectedConv?.id || null);
  const clearChat = useClearChat();
  const closeArchive = useCloseAndArchive();
  const reopenConv = useReopenConversation();
  const deleteConv = useDeleteConversation();
  
  const { data: faqs = [] } = useChatFaqs();
  const upsertFaq = useUpsertFaq();
  const deleteFaq = useDeleteFaq();

  // Merge messages
  useEffect(() => {
    if (msgData?.messages) {
      if (page === 0) setAllMsgs(msgData.messages);
      else setAllMsgs(prev => {
        const ids = new Set(prev.map(m => m.id));
        return [...msgData.messages.filter((m: any) => !ids.has(m.id)), ...prev];
      });
    }
  }, [msgData, page]);

  // Reset on conv switch
  useEffect(() => { setPage(0); setAllMsgs([]); setNewMessage(""); }, [selectedConv?.id]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current && isBottom) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [allMsgs, userTyping]);

  const onScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setIsBottom(scrollHeight - scrollTop - clientHeight < 40);
  }, []);

  // Mark user messages read
  useEffect(() => {
    if (selectedConv) {
      const hasUnread = allMsgs.some(m => m.sender_type === "user" && !m.is_read);
      if (hasUnread) {
        markRead.mutate({ conversationId: selectedConv.id, senderType: "user" });
      }
    }
  }, [selectedConv, allMsgs]);

  // ─── Realtime: global admin channel for ALL conversations + messages ───
  useEffect(() => {
    const ch = supabase
      .channel("admin_support_global_rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, () => {
        refetchConvs();
        if (selectedConv) { setPage(0); refetchMsgs(); }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "chat_messages" }, () => {
        if (selectedConv) refetchMsgs();
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "chat_messages" }, () => {
        if (selectedConv) { setPage(0); refetchMsgs(); }
        refetchConvs();
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "conversations" }, () => {
        refetchConvs();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "conversations" }, () => {
        refetchConvs();
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "conversations" }, () => {
        refetchConvs();
      })
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [selectedConv?.id]);

  // Typing channel per conversation
  useEffect(() => {
    if (!selectedConv) return;
    const ch = supabase
      .channel(`typing:${selectedConv.id}`)
      .on("broadcast", { event: "typing" }, (payload: any) => {
        if (payload?.payload?.senderType === "user") {
          setUserTyping(payload.payload.isTyping);
          if (typingTimeout.current) clearTimeout(typingTimeout.current);
          if (payload.payload.isTyping) typingTimeout.current = setTimeout(() => setUserTyping(false), 4000);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [selectedConv?.id]);

  const handleSend = () => {
    if (!newMessage.trim() || !selectedConv) return;
    sendMsg.mutate({ conversationId: selectedConv.id, message: newMessage.trim(), senderType: "admin" });
    setNewMessage("");
    setIsBottom(true);
    typing.sendTyping(false, "admin");
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !selectedConv) return;
    try {
      const res = await uploadFile.mutateAsync(f);
      sendMsg.mutate({ conversationId: selectedConv.id, message: f.name, senderType: "admin", attachment_url: res.url, attachment_type: res.type });
      setIsBottom(true);
    } catch { /* handled */ }
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleInput = (val: string) => {
    setNewMessage(val);
    typing.sendTyping(val.length > 0, "admin");
  };

  const handleAddNote = () => {
    if (!newNote.trim() || !selectedConv) return;
    addNote.mutate({ conversationId: selectedConv.id, note: newNote.trim() });
    setNewNote("");
  };

  const handleSelect = (conv: Conversation) => {
    setSelectedConv(conv);
    setShowContacts(false);
    setIsBottom(true);
  };

  // Group by date
  const dateGroups: [string, any[]][] = [];
  const gm: Record<string, any[]> = {};
  allMsgs.forEach(m => {
    const k = new Date(m.created_at).toDateString();
    if (!gm[k]) { gm[k] = []; dateGroups.push([k, gm[k]]); }
    gm[k].push(m);
  });

  const profile = selectedConv?.profiles;
  const isClosed = selectedConv?.status === "closed";
  const isResolved = selectedConv?.status === "resolved";

  return (
    <div className="space-y-3 max-w-[1600px] mx-auto h-[calc(100vh-10rem)]">
      {/* ─── Top bar ─── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Support Hub</h1>
          <Badge variant="outline" className="text-xs">
            {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
          </Badge>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* FAQ Manager Dialog */}
          <Dialog open={showFaqDialog} onOpenChange={setShowFaqDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                <FileText className="h-3.5 w-3.5" /> Manage FAQs
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Quick Responses & FAQs</DialogTitle>
              </DialogHeader>
              <ScrollArea className="flex-1 -mx-2 px-2">
                <div className="space-y-4 pt-2">
                  <div className="bg-muted p-3 rounded-lg space-y-3">
                    <h4 className="text-sm font-semibold">{editingFaq?.id ? "Edit FAQ" : "Add New FAQ"}</h4>
                    <Input placeholder="Question / Topic"
                      value={editingFaq?.question || ""}
                      onChange={e => setEditingFaq({ ...editingFaq, question: e.target.value })}
                    />
                    <Textarea placeholder="Automated Answer (Optional)"
                      value={editingFaq?.answer || ""}
                      onChange={e => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <label className="text-xs">Active:</label>
                        <input type="checkbox" checked={editingFaq?.is_active ?? true}
                          onChange={e => setEditingFaq({ ...editingFaq, is_active: e.target.checked })} />
                        <label className="text-xs ml-2">Sort Order:</label>
                        <Input type="number" className="w-16 h-7 text-xs" value={editingFaq?.sort_order || 0}
                          onChange={e => setEditingFaq({ ...editingFaq, sort_order: parseInt(e.target.value) || 0 })} />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingFaq(null)}>Cancel</Button>
                        <Button size="sm" disabled={!editingFaq?.question || upsertFaq.isPending}
                          onClick={() => {
                            if (editingFaq?.question) {
                              upsertFaq.mutate(editingFaq, { onSuccess: () => setEditingFaq(null) });
                            }
                          }}>Save</Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Existing FAQs</h4>
                    {faqs.map(faq => (
                      <div key={faq.id} className="border p-3 rounded-lg flex items-start flex-col gap-2 relative">
                        <div className="flex-1 pr-16 w-full">
                          <p className="font-semibold text-sm">{faq.question}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{faq.answer || "No automated answer"}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={faq.is_active ? "default" : "secondary"} className="text-[10px]">
                              {faq.is_active ? "Active" : "Inactive"}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">Used: {faq.usage_count} times</span>
                            <span className="text-[10px] text-muted-foreground">Order: {faq.sort_order}</span>
                          </div>
                        </div>
                        <div className="absolute top-3 right-3 flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingFaq(faq)}>
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                            onClick={() => { if(confirm("Delete this FAQ?")) deleteFaq.mutate(faq.id); }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {faqs.length === 0 && <p className="text-xs text-muted-foreground">No FAQs defined yet.</p>}
                  </div>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          <Button variant={showArchived ? "default" : "outline"} size="sm" className="gap-1.5 text-xs h-8"
            onClick={() => setShowArchived(!showArchived)}>
            <Archive className="h-3.5 w-3.5" /> {showArchived ? "Viewing Archived" : "Archive"}
          </Button>
          {selectedConv && (
            <Button variant="outline" size="sm" className="md:hidden gap-1.5 text-xs h-8"
              onClick={() => { setShowContacts(true); setSelectedConv(null); }}>
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 h-full">
        {/* ══════════════ LEFT PANEL: Conversations ══════════════ */}
        <Card className={`md:col-span-3 h-full flex flex-col pt-3 ${!showContacts && selectedConv ? "hidden md:flex" : "flex"}`}>
          <div className="px-3 pb-2 space-y-2 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 text-xs h-8" />
            </div>
            <div className="flex gap-1.5">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-7 text-[11px] flex-1"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {STATUS_OPTS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-7 text-[11px] flex-1"><SelectValue placeholder="Priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  {PRIORITY_OPTS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-1.5 space-y-0.5">
              {conversations.map((conv) => {
                const st = statusMeta(conv.status);
                const selected = selectedConv?.id === conv.id;
                return (
                  <button key={conv.id} onClick={() => handleSelect(conv)}
                    className={`w-full flex items-start gap-2.5 p-2.5 rounded-lg text-left transition-all ${
                      selected ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50 border border-transparent"
                    }`}>
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
                        <UserCircle className="h-5 w-5 text-primary" />
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${st.color}`} />
                    </div>
                    <div className="flex-1 overflow-hidden min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-semibold text-xs truncate">
                          {conv.profiles?.first_name || "—"} {conv.profiles?.last_name || ""}
                        </span>
                        <span className="text-[10px] text-muted-foreground/50 shrink-0 ml-1">
                          {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: false })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-[11px] text-muted-foreground truncate flex-1">{conv.last_message}</p>
                        {(conv.unread_count || 0) > 0 && (
                          <Badge className="h-4 min-w-4 px-1 flex justify-center text-[9px] font-bold ml-1.5 shrink-0">
                            {conv.unread_count}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge variant="outline" className={`text-[9px] px-1 py-0 h-3.5 border-0 ${st.text} bg-transparent`}>{st.label}</Badge>
                        {conv.priority !== "normal" && (
                          <Badge variant="outline" className={`text-[9px] px-1 py-0 h-3.5 border-0 ${priorityMeta(conv.priority).color} bg-transparent`}>
                            {priorityMeta(conv.priority).label}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
              {conversations.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">No conversations found</div>
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* ══════════════ CENTER PANEL: Chat ══════════════ */}
        <Card className={`${selectedConv && showInfo ? "md:col-span-5" : "md:col-span-9"} h-full flex flex-col ${showContacts && !selectedConv ? "hidden md:flex" : "flex"} transition-all`}>
          {selectedConv ? (
            <>
              {/* Header */}
              <CardHeader className="border-b py-2.5 px-4 shrink-0">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                    <UserCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{profile?.first_name} {profile?.last_name}</div>
                    <div className="text-[11px] font-normal text-muted-foreground truncate">{profile?.email}</div>
                  </div>

                  {/* Status + Priority selectors */}
                  <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                    {!isClosed && (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="h-7 text-[11px] px-3 mr-1"
                        onClick={() => {
                          updateConv.mutate({
                            conversationId: selectedConv.id,
                            updates: { status: "closed", resolved_at: new Date().toISOString() },
                          });
                          setSelectedConv({ ...selectedConv, status: "closed" });
                        }}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1.5" /> End Chat
                      </Button>
                    )}
                    <Select value={selectedConv.status}
                      onValueChange={(val) => {
                        updateConv.mutate({
                          conversationId: selectedConv.id,
                          updates: { status: val, resolved_at: val === "resolved" ? new Date().toISOString() : null },
                        });
                        setSelectedConv({ ...selectedConv, status: val });
                      }}>
                      <SelectTrigger className="h-7 text-[11px] w-[95px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={selectedConv.priority}
                      onValueChange={(val) => {
                        updateConv.mutate({ conversationId: selectedConv.id, updates: { priority: val } });
                        setSelectedConv({ ...selectedConv, priority: val });
                      }}>
                      <SelectTrigger className="h-7 text-[11px] w-[85px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PRIORITY_OPTS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Actions dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {(isClosed || isResolved) && (
                        <DropdownMenuItem onClick={() => {
                          reopenConv.mutate(selectedConv.id);
                          setSelectedConv({ ...selectedConv, status: "open", is_archived: false });
                        }}>
                          <RotateCcw className="h-3.5 w-3.5 mr-2" /> Reopen Chat
                        </DropdownMenuItem>
                      )}
                      {!isClosed && (
                        <>
                          <DropdownMenuItem onClick={() => {
                            closeArchive.mutate(selectedConv.id);
                            setSelectedConv(null);
                          }}>
                            <XCircle className="h-3.5 w-3.5 mr-2" /> Close & Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            clearChat.mutate(selectedConv.id);
                            closeArchive.mutate(selectedConv.id);
                            setSelectedConv(null);
                          }}>
                            <Eraser className="h-3.5 w-3.5 mr-2" /> Close & Clear Messages
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem onClick={() => {
                        updateConv.mutate({ conversationId: selectedConv.id, updates: { is_archived: !selectedConv.is_archived } });
                        setSelectedConv({ ...selectedConv, is_archived: !selectedConv.is_archived });
                      }}>
                        <Archive className="h-3.5 w-3.5 mr-2" /> {selectedConv.is_archived ? "Unarchive" : "Archive"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => clearChat.mutate(selectedConv.id)}
                        className="text-amber-600 focus:text-amber-600">
                        <Eraser className="h-3.5 w-3.5 mr-2" /> Clear Messages
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}
                            className="text-destructive focus:text-destructive">
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Conversation
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the conversation, all messages, and internal notes.
                              This action cannot be undone. An audit log entry will be created.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => {
                                deleteConv.mutate(selectedConv.id);
                                setSelectedConv(null);
                              }}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Info toggle button (mobile/tablet) */}
                  <Button variant="ghost" size="icon" className="h-7 w-7 lg:hidden shrink-0"
                    onClick={() => setShowInfo(!showInfo)}>
                    <User className="h-3.5 w-3.5" />
                  </Button>
                </CardTitle>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
                <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto px-3 py-2 sm:px-4 sm:py-3">
                  {msgData?.hasMore && (
                    <div className="flex justify-center mb-3">
                      <Button variant="ghost" size="sm" onClick={() => setPage(p => p + 1)} className="text-xs text-muted-foreground h-7 gap-1">
                        <ChevronUp className="h-3 w-3" /> Load older messages
                      </Button>
                    </div>
                  )}
                  {allMsgs.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                      <MessageSquare className="h-8 w-8 opacity-30 mb-2" />
                      <p className="text-sm">No messages yet</p>
                    </div>
                  )}
                  {dateGroups.map(([dk, msgs]) => (
                    <div key={dk}>
                      <div className="flex items-center justify-center my-4">
                        <div className="h-px bg-border flex-1" />
                        <span className="text-[10px] text-muted-foreground/50 px-3 font-medium uppercase tracking-wider">{formatDate(msgs[0].created_at)}</span>
                        <div className="h-px bg-border flex-1" />
                      </div>
                      <div className="space-y-3">
                        {msgs.map((msg: any) => {
                          const isAdmin = msg.sender_type === "admin";
                          return (
                            <div key={msg.id} className={`flex w-full gap-2 ${isAdmin ? "justify-end" : "justify-start"}`}>
                              {!isAdmin && (
                                <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                                  <UserCircle className="h-3.5 w-3.5 text-primary" />
                                </div>
                              )}
                              <div className={`max-w-[75%] flex flex-col ${isAdmin ? "items-end" : "items-start"}`}>
                                <div className={`flex items-center gap-1.5 mb-1 ${isAdmin ? "flex-row-reverse" : "flex-row"}`}>
                                  <span className={`text-[10px] font-bold tracking-wide uppercase ${isAdmin ? "text-emerald-600 dark:text-emerald-400" : "text-primary"}`}>
                                    {isAdmin ? "Admin" : "User"}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground/50">{formatTime(msg.created_at)}</span>
                                </div>
                                <div className={`px-3.5 py-2.5 text-sm leading-relaxed ${
                                  isAdmin
                                    ? "bg-emerald-600 text-white dark:bg-emerald-700 rounded-2xl rounded-tr-sm"
                                    : "bg-muted text-foreground rounded-2xl rounded-tl-sm"
                                }`}>
                                  {msg.attachment_url ? (
                                    <>
                                      {msg.message && <p className="mb-1">{msg.message}</p>}
                                      <AttachmentBubble url={msg.attachment_url} type={msg.attachment_type || "file"} />
                                    </>
                                  ) : msg.message}
                                </div>
                                {isAdmin && <div className="mt-0.5"><ReadIndicator msg={msg} /></div>}
                              </div>
                              {isAdmin && (
                                <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0 mt-0.5">
                                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {userTyping && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                        <UserCircle className="h-3 w-3 text-primary" />
                      </div>
                      <div className="bg-muted px-3 py-2 rounded-2xl rounded-tl-sm">
                        <div className="flex gap-1">
                          <Circle className="h-1.5 w-1.5 fill-muted-foreground/50 text-transparent animate-bounce" style={{ animationDelay: "0ms" }} />
                          <Circle className="h-1.5 w-1.5 fill-muted-foreground/50 text-transparent animate-bounce" style={{ animationDelay: "150ms" }} />
                          <Circle className="h-1.5 w-1.5 fill-muted-foreground/50 text-transparent animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground">Investor is typing...</span>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-3 border-t bg-card flex items-center gap-2 shrink-0">
                  <input ref={fileRef} type="file" accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.csv" className="hidden" onChange={handleFile} />
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground" onClick={() => fileRef.current?.click()} disabled={uploadFile.isPending}>
                    {uploadFile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
                  </Button>
                  <Input
                    value={newMessage}
                    onChange={e => handleInput(e.target.value)}
                    placeholder="Type a reply..."
                    onKeyDown={e => e.key === "Enter" && handleSend()}
                    className="flex-1 text-sm"
                  />
                  <Button onClick={handleSend} size="icon" disabled={!newMessage.trim() || sendMsg.isPending} className="shrink-0 h-8 w-8">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3 p-8">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <MessageSquare className="h-7 w-7 opacity-30" />
              </div>
              <p className="font-medium text-sm">Select a conversation</p>
              <p className="text-xs text-muted-foreground">Choose a conversation from the left panel</p>
            </div>
          )}
        </Card>

        {/* ══════════════ RIGHT PANEL: Customer Info ══════════════ */}
        {selectedConv && showInfo && (
          <Card className="hidden lg:flex md:col-span-4 h-full flex-col pt-4">
            <CardHeader className="border-b py-2.5 px-4 shrink-0">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4" /> Customer Information
              </CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-5">
                {/* Profile */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                    <UserCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{profile?.first_name} {profile?.last_name}</div>
                    <div className="text-xs text-muted-foreground">{profile?.email}</div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> KYC Status</span>
                    <Badge variant="outline" className="text-[10px] capitalize">{profile?.kyc_status || "Unknown"}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5" /> Balance</span>
                    <span className="font-semibold">${(profile?.balance || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> Member Since</span>
                    <span>{profile?.created_at ? fullDate(profile.created_at) : "—"}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5" /> Priority</span>
                    <Badge variant="outline" className={`text-[10px] capitalize ${priorityMeta(selectedConv.priority).color}`}>
                      {selectedConv.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Opened</span>
                    <span>{formatDistanceToNow(new Date(selectedConv.created_at), { addSuffix: true })}</span>
                  </div>
                  {selectedConv.resolved_at && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Resolved</span>
                      <span>{fullDate(selectedConv.resolved_at)}</span>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(isClosed || isResolved) && (
                      <Button variant="outline" size="sm" className="text-[11px] h-7 gap-1 text-emerald-600 border-emerald-200"
                        onClick={() => { reopenConv.mutate(selectedConv.id); setSelectedConv({ ...selectedConv, status: "open", is_archived: false }); }}>
                        <RotateCcw className="h-3 w-3" /> Reopen
                      </Button>
                    )}
                    {!isClosed && (
                      <Button variant="outline" size="sm" className="text-[11px] h-7 gap-1 text-red-500 border-red-200"
                        onClick={() => { closeArchive.mutate(selectedConv.id); setSelectedConv(null); }}>
                        <XCircle className="h-3 w-3" /> Close
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="text-[11px] h-7 gap-1"
                      onClick={() => { updateConv.mutate({ conversationId: selectedConv.id, updates: { is_archived: !selectedConv.is_archived } }); setSelectedConv({ ...selectedConv, is_archived: !selectedConv.is_archived }); }}>
                      <Archive className="h-3 w-3" /> {selectedConv.is_archived ? "Unarchive" : "Archive"}
                    </Button>
                    <Button variant="outline" size="sm" className="text-[11px] h-7 gap-1 text-amber-600 border-amber-200"
                      onClick={() => clearChat.mutate(selectedConv.id)}>
                      <Eraser className="h-3 w-3" /> Clear
                    </Button>
                  </div>
                </div>

                {/* Internal Notes */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <StickyNote className="h-3.5 w-3.5" /> Internal Notes
                  </h4>
                  <Textarea
                    placeholder="Add a note..."
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    className="text-xs min-h-[60px] resize-none"
                  />
                  <Button size="sm" className="w-full text-xs h-7" onClick={handleAddNote} disabled={!newNote.trim()}>
                    Save Note
                  </Button>
                  {notes.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {notes.map((n: any) => (
                        <div key={n.id} className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/30 rounded-lg p-2.5">
                          <p className="text-xs leading-relaxed">{n.note}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </Card>
        )}
      </div>
    </div>
  );
}
