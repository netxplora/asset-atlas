import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

const MSG_PAGE_SIZE = 40;

// ─── Types ───────────────────────────────────────────────────
export interface Conversation {
  id: string;
  user_id: string;
  assigned_admin_id: string | null;
  subject: string;
  status: string;
  priority: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    kyc_status: string;
    balance: number;
    avatar_url: string | null;
    created_at: string;
  };
  last_message?: string;
  unread_count?: number;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: string;
  message: string;
  attachment_url: string | null;
  attachment_type: string | null;
  is_read: boolean;
  is_delivered: boolean;
  created_at: string;
}

// ─── User: Get or Create Conversation ────────────────────────
export const useUserConversation = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["userConversation", user?.id],
    queryFn: async () => {
      if (!user) return null;
      // Check for existing open/pending conversation
      const { data: existing } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", user.id)
        .in("status", ["open", "pending"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (existing) return existing;
      // Create new one
      const { data: created, error } = await supabase
        .from("conversations")
        .insert({ user_id: user.id, subject: "Support Request" })
        .select("*")
        .single();
      if (error) throw error;
      return created;
    },
    enabled: !!user,
  });
};

// ─── User: Get Messages ──────────────────────────────────────
export const useConversationMessages = (conversationId: string | null, page = 0) => {
  return useQuery({
    queryKey: ["chatMessages", conversationId, page],
    queryFn: async () => {
      if (!conversationId) return { messages: [], hasMore: false, total: 0 };
      const from = page * MSG_PAGE_SIZE;
      const to = from + MSG_PAGE_SIZE - 1;
      const { data, error, count } = await supabase
        .from("chat_messages")
        .select("*", { count: "exact" })
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) throw error;
      return {
        messages: (data || []).reverse(),
        hasMore: (count || 0) > from + MSG_PAGE_SIZE,
        total: count || 0,
      };
    },
    enabled: !!conversationId,
  });
};

// ─── User: Send Message ──────────────────────────────────────
export const useSendChatMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (payload: {
      conversationId: string;
      message: string;
      senderType?: string;
      attachment_url?: string;
      attachment_type?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("chat_messages").insert({
        conversation_id: payload.conversationId,
        sender_id: user.id,
        sender_type: payload.senderType || "user",
        message: payload.message,
        attachment_url: payload.attachment_url || null,
        attachment_type: payload.attachment_type || null,
      });
      if (error) throw error;
      // Always bump updated_at so the conversation rises to the top
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", payload.conversationId);
      // Reopen conversation if it was resolved/closed
      await supabase
        .from("conversations")
        .update({ status: "open" })
        .eq("id", payload.conversationId)
        .in("status", ["resolved", "closed"]);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["chatMessages", vars.conversationId] });
      queryClient.invalidateQueries({ queryKey: ["userConversation"] });
      queryClient.invalidateQueries({ queryKey: ["adminConversations"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to send message"),
  });
};

// ─── Upload Attachment ───────────────────────────────────────
export const useChatFileUpload = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split(".").pop();
      const path = `chat-attachments/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("avatars").upload(path, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const isImage = file.type.startsWith("image/");
      return { url: urlData.publicUrl, type: isImage ? "image" : "file", name: file.name };
    },
    onError: (err: any) => toast.error(err.message || "Upload failed"),
  });
};

// ─── Mark Messages Read ──────────────────────────────────────
export const useMarkMessagesRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { conversationId: string; senderType: string }) => {
      const { error } = await supabase
        .from("chat_messages")
        .update({ is_read: true })
        .eq("conversation_id", payload.conversationId)
        .eq("sender_type", payload.senderType);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["chatMessages", vars.conversationId] });
      queryClient.invalidateQueries({ queryKey: ["adminConversations"] });
    },
  });
};

// ─── Admin: List Conversations ───────────────────────────────
export const useAdminConversations = (filters?: {
  status?: string;
  priority?: string;
  search?: string;
  archived?: boolean;
}) => {
  return useQuery({
    queryKey: ["adminConversations", filters],
    queryFn: async () => {
      let query = supabase
        .from("conversations")
        .select("*, profiles!conversations_profile_user_id_fkey(first_name, last_name, email, kyc_status, balance, avatar_url, created_at)")
        .eq("is_archived", filters?.archived ?? false)
        .order("updated_at", { ascending: false });

      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }
      if (filters?.priority && filters.priority !== "all") {
        query = query.eq("priority", filters.priority);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Enrich with last message + unread count
      const enriched = await Promise.all(
        (data || []).map(async (conv: any) => {
          const { data: lastMsg } = await supabase
            .from("chat_messages")
            .select("message, attachment_url, attachment_type, created_at")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          const { count: unreadCount } = await supabase
            .from("chat_messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conv.id)
            .eq("sender_type", "user")
            .eq("is_read", false);

          let lastMessage = "No messages yet";
          if (lastMsg) {
            if (lastMsg.attachment_url) {
              lastMessage = lastMsg.attachment_type === "image" ? "📷 Image" : "📎 File";
            } else {
              lastMessage = lastMsg.message;
            }
          }

          // Apply search filter
          if (filters?.search) {
            const s = filters.search.toLowerCase();
            const name = `${conv.profiles?.first_name || ""} ${conv.profiles?.last_name || ""}`.toLowerCase();
            const email = (conv.profiles?.email || "").toLowerCase();
            if (!name.includes(s) && !email.includes(s) && !(conv.subject || "").toLowerCase().includes(s)) {
              return null;
            }
          }

          return {
            ...conv,
            last_message: lastMessage,
            unread_count: unreadCount || 0,
          };
        })
      );

      return enriched.filter(Boolean) as Conversation[];
    },
  });
};

// ─── Admin: Update Conversation ──────────────────────────────
export const useUpdateConversation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (payload: {
      conversationId: string;
      updates: { status?: string; priority?: string; assigned_admin_id?: string | null; is_archived?: boolean; resolved_at?: string | null };
    }) => {
      const { error } = await supabase
        .from("conversations")
        .update({ ...payload.updates, updated_at: new Date().toISOString() })
        .eq("id", payload.conversationId);
      if (error) throw error;

      // Audit log
      if (user) {
        await supabase.from("chat_audit_logs").insert({
          conversation_id: payload.conversationId,
          performed_by: user.id,
          action: "conversation_updated",
          details: payload.updates,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminConversations"] });
      queryClient.invalidateQueries({ queryKey: ["userConversation"] });
    },
    onError: (err: any) => toast.error(err.message || "Update failed"),
  });
};

// ─── Admin: Add Internal Note ────────────────────────────────
export const useAddConversationNote = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (payload: { conversationId: string; note: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("conversation_notes").insert({
        conversation_id: payload.conversationId,
        admin_id: user.id,
        note: payload.note,
      });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["conversationNotes", vars.conversationId] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to add note"),
  });
};

// ─── Admin: Get Notes ────────────────────────────────────────
export const useConversationNotes = (conversationId: string | null) => {
  return useQuery({
    queryKey: ["conversationNotes", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data, error } = await supabase
        .from("conversation_notes")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!conversationId,
  });
};

// ─── Admin: Audit Logs ───────────────────────────────────────
export const useAuditLogs = (conversationId: string | null) => {
  return useQuery({
    queryKey: ["auditLogs", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data, error } = await supabase
        .from("chat_audit_logs")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!conversationId,
  });
};

// ─── Typing Indicator (Supabase Broadcast) ───────────────────
export const useTypingIndicator = (conversationId: string | null) => {
  return {
    sendTyping: (isTyping: boolean, senderType: string) => {
      if (!conversationId) return;
      supabase.channel(`typing:${conversationId}`).send({
        type: "broadcast",
        event: "typing",
        payload: { isTyping, senderType },
      });
    },
  };
};

// ─── Admin: Clear Chat (delete messages but keep conversation) ───
export const useClearChat = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (conversationId: string) => {
      const { error } = await supabase
        .from("chat_messages")
        .delete()
        .eq("conversation_id", conversationId);
      if (error) throw error;
      // Audit log
      if (user) {
        await supabase.from("chat_audit_logs").insert({
          conversation_id: conversationId,
          performed_by: user.id,
          action: "chat_cleared",
          details: { cleared_at: new Date().toISOString() },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatMessages"] });
      queryClient.invalidateQueries({ queryKey: ["adminConversations"] });
      toast.success("Chat messages cleared");
    },
    onError: (err: any) => toast.error(err.message || "Failed to clear chat"),
  });
};

// ─── Admin: Close and Archive Conversation ───────────────────
export const useCloseAndArchive = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (conversationId: string) => {
      const { error } = await supabase
        .from("conversations")
        .update({
          status: "closed",
          is_archived: true,
          updated_at: new Date().toISOString(),
          resolved_at: new Date().toISOString(),
        })
        .eq("id", conversationId);
      if (error) throw error;
      if (user) {
        await supabase.from("chat_audit_logs").insert({
          conversation_id: conversationId,
          performed_by: user.id,
          action: "conversation_closed_archived",
          details: { closed_at: new Date().toISOString() },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminConversations"] });
      queryClient.invalidateQueries({ queryKey: ["userConversation"] });
      toast.success("Chat closed and archived");
    },
    onError: (err: any) => toast.error(err.message || "Failed to close chat"),
  });
};

// ─── Admin: Reopen Conversation ──────────────────────────────
export const useReopenConversation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (conversationId: string) => {
      const { error } = await supabase
        .from("conversations")
        .update({
          status: "open",
          is_archived: false,
          resolved_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversationId);
      if (error) throw error;
      if (user) {
        await supabase.from("chat_audit_logs").insert({
          conversation_id: conversationId,
          performed_by: user.id,
          action: "conversation_reopened",
          details: { reopened_at: new Date().toISOString() },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminConversations"] });
      queryClient.invalidateQueries({ queryKey: ["userConversation"] });
      toast.success("Conversation reopened");
    },
    onError: (err: any) => toast.error(err.message || "Failed to reopen"),
  });
};

// ─── Admin: Delete Conversation (permanent) ──────────────────
export const useDeleteConversation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (conversationId: string) => {
      // Log before delete
      if (user) {
        await supabase.from("chat_audit_logs").insert({
          conversation_id: null,
          performed_by: user.id,
          action: "conversation_deleted",
          details: { deleted_conversation_id: conversationId, deleted_at: new Date().toISOString() },
        });
      }
      // Delete notes first
      await supabase.from("conversation_notes").delete().eq("conversation_id", conversationId);
      // Delete messages
      await supabase.from("chat_messages").delete().eq("conversation_id", conversationId);
      // Delete conversation
      const { error } = await supabase.from("conversations").delete().eq("id", conversationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminConversations"] });
      queryClient.invalidateQueries({ queryKey: ["chatMessages"] });
      toast.success("Conversation deleted");
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete"),
  });
};

// ─── User: Close Session on Logout ───────────────────────────
export const closeUserChatSession = async (userId: string) => {
  try {
    // Close and archive all open/pending conversations for this user
    const { data: openConvs } = await supabase
      .from("conversations")
      .select("id")
      .eq("user_id", userId)
      .in("status", ["open", "pending"]);

    if (openConvs && openConvs.length > 0) {
      const ids = openConvs.map(c => c.id);
      await supabase
        .from("conversations")
        .update({
          status: "closed",
          is_archived: true,
          updated_at: new Date().toISOString(),
          resolved_at: new Date().toISOString(),
        })
        .in("id", ids);
    }
  } catch (err) {
    console.error("Failed to close chat session:", err);
  }
};

// ─── FAQ Hooks ─────────────────────────────────────────────────────────────

export type ChatFaq = Database["public"]["Tables"]["chat_faqs"]["Row"];

export function useChatFaqs() {
  return useQuery({
    queryKey: ["chat_faqs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_faqs")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ChatFaq[];
    },
  });
}

export function useActiveChatFaqs() {
  return useQuery({
    queryKey: ["chat_faqs", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_faqs")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ChatFaq[];
    },
  });
}

export function useIncrementFaqUsage() {
  return useMutation({
    mutationFn: async (id: string) => {
      // Need to read the current usage_count, then increment via rpc or just fetch + update
      // A better way is using an RPC, but we can do a quick fetch and update for now:
      const { data, error: fetchErr } = await supabase
        .from("chat_faqs")
        .select("usage_count")
        .eq("id", id)
        .single();
      if (fetchErr) throw fetchErr;

      const { error: updateErr } = await supabase
        .from("chat_faqs")
        .update({ usage_count: (data?.usage_count || 0) + 1 })
        .eq("id", id);
      if (updateErr) throw updateErr;
    },
  });
}

export function useUpsertFaq() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (faq: Partial<ChatFaq>) => {
      const { data, error } = await supabase
        .from("chat_faqs")
        .upsert(faq as any)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat_faqs"] });
      toast({ title: "FAQ Saved", description: "The FAQ has been saved successfully." });
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: "Error saving FAQ",
        description: err.message,
      });
    },
  });
}

export function useDeleteFaq() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("chat_faqs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat_faqs"] });
      toast({ title: "FAQ Deleted", description: "The FAQ was successfully removed." });
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: "Error deleting FAQ",
        description: err.message,
      });
    },
  });
}
