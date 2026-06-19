import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";


// ─── App Settings Hooks ──────────────────────────────────────
export const useAppSetting = (key: string) => {
  return useQuery({
    queryKey: ["appSetting", key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_settings" as any)
        .select("value")
        .eq("key", key)
        .maybeSingle();
      if (error) throw error;
      return (data as any)?.value || null;
    },
  });
};

export const useCryptoProviders = () => {
  return useQuery({
    queryKey: ["cryptoProviders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crypto_providers" as any)
        .select("*")
        .order("priority", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useAdminAddProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { error } = await supabase.from("crypto_providers" as any).insert([payload]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cryptoProviders"] });
      toast.success("Provider added successfully");
    },
    onError: (err: any) => toast.error(err.message || "Failed to add provider"),
  });
}

export const useAdminUpdateProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase.from("crypto_providers" as any).update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cryptoProviders"] });
      toast.success("Provider updated successfully");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update provider"),
  });
}

export const useAdminDeleteProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("crypto_providers" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cryptoProviders"] });
      toast.success("Provider deleted successfully");
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete provider"),
  });
}

export const useUpdateAppSetting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from("app_settings" as any)
        .upsert({ key, value, updated_at: new Date().toISOString() } as any);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["appSetting", vars.key] });
      toast.success("Setting updated");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update setting"),
  });
};

export const useSyncInvestorDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel('investor_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `user_id=eq.${user.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deposits', filter: `user_id=eq.${user.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["userDeposits", user.id] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawals', filter: `user_id=eq.${user.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["userWithdrawals", user.id] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["transactions", user.id] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_investments', filter: `user_id=eq.${user.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["userInvestments", user.id] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deposit_intents', filter: `user_id=eq.${user.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["activeDepositIntent", user.id] });
        queryClient.invalidateQueries({ queryKey: ["userDepositIntents", user.id] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings' }, () => {
        queryClient.invalidateQueries({ queryKey: ["appSetting"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, queryClient]);
};

export const useSyncAdminDashboard = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase.channel('admin_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deposits' }, () => {
        queryClient.invalidateQueries({ queryKey: ["adminDeposits"] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawals' }, () => {
        queryClient.invalidateQueries({ queryKey: ["adminWithdrawals"] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        queryClient.invalidateQueries({ queryKey: ["adminTransactions"] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'traders' }, () => {
        queryClient.invalidateQueries({ queryKey: ["adminTraders"] });
        queryClient.invalidateQueries({ queryKey: ["traders"] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'investment_plans' }, () => {
        queryClient.invalidateQueries({ queryKey: ["adminInvestmentPlans"] });
        queryClient.invalidateQueries({ queryKey: ["investmentPlans"] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_investments' }, () => {
        queryClient.invalidateQueries({ queryKey: ["adminUserInvestments"] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deposit_intents' }, () => {
        queryClient.invalidateQueries({ queryKey: ["adminDepositIntents"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);
};

// User queries
export const useProfile = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: { first_name?: string; last_name?: string; email?: string; avatar_url?: string }) => {
      const { error } = await supabase.from("profiles").update(updates).eq("user_id", user?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast.success("Profile updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update profile");
    }
  });
};

export const useSubmitKYC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ kyc_document_url, kyc_id_type, kyc_id_number }: { kyc_document_url: string; kyc_id_type: string; kyc_id_number: string }) => {
      const { error } = await supabase.from("profiles").update({
        kyc_status: "pending",
        kyc_document_url,
        kyc_id_type,
        kyc_id_number,
      } as any).eq("user_id", user?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success("KYC submission received! Under review.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit KYC");
    }
  });
};

export const useUserTransactions = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useWallets = () => {
  return useQuery({
    queryKey: ["wallets"],
    queryFn: async () => {
      const { data, error } = await supabase.from("wallets").select("*").eq("is_active", true);
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useUserDeposits = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["userDeposits", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("deposits").select("*, wallets(currency, network, address)").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useSubmitDeposit = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (payload: { amount: number; currency: string; wallet_id: string; tx_hash: string; screenshot_url?: string; user_notes?: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("deposits").insert({ ...payload, user_id: user.id });
      if (error) throw error;
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "Deposit Submitted",
        message: `Your deposit of $${payload.amount.toLocaleString()} via ${payload.currency} is pending verification.`,
        type: "deposit",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userDeposits", user?.id] });
      toast.success("Deposit submitted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit deposit");
    }
  });
};

export const useUserWithdrawals = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["userWithdrawals", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("withdrawals").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useSubmitWithdrawal = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (payload: { amount: number; currency: string; wallet_address: string; }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("withdrawals").insert({ ...payload, user_id: user.id });
      if (error) throw error;
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "Withdrawal Requested",
        message: `Your request to withdraw $${payload.amount.toLocaleString()} via ${payload.currency} is pending review.`,
        type: "withdrawal",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userWithdrawals", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] }); // refresh balance
      toast.success("Withdrawal request submitted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit withdrawal request");
    }
  });
};

export const useTraders = () => {
  return useQuery({
    queryKey: ["traders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("traders").select("*").order("win_rate", { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useUserCopyTrades = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["userCopyTrades", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("user_copy_trades")
        .select("*, traders(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useStartCopyTrade = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ traderId, allocation }: { traderId: string; allocation: number }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase.rpc("start_copy_trade", {
        p_user_id: user.id,
        p_trader_id: traderId,
        p_allocation: allocation,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userCopyTrades", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast.success("Copy trade activated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to start copy trade");
    }
  });
};

export const useCancelCopyTrade = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ tradeId, currentPnl }: { tradeId: string; currentPnl: number }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase.rpc("cancel_copy_trade", {
        p_trade_id: tradeId,
        p_user_id: user.id,
        p_current_pnl: currentPnl,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["userCopyTrades", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast.success(`Trade canceled. $${data.returned?.toLocaleString()} returned to your balance.`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to cancel copy trade");
    }
  });
};

// Admin queries
export const useAdminUsers = () => {
  return useQuery({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useAdminUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id: string, updates: any }) => {
      const { error } = await supabase.from("profiles").update(payload.updates).eq("user_id", payload.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminActiveCopyTrades"] });
      toast.success("User updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update user");
    }
  });
};
// ─── Admin: Role Management ──────────────────────────────────
export const usePromoteToAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc("promote_to_admin", { p_user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminAuditLogs"] });
      toast.success("User promoted to Admin");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to promote user");
    },
  });
};

export const useRevokeAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc("revoke_admin", { p_user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminAuditLogs"] });
      toast.success("Admin access revoked");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to revoke admin access");
    },
  });
};

// ─── Admin: Active Copy Trades ───────────────────────────────
export const useAdminActiveCopyTrades = () => {
  return useQuery({
    queryKey: ["adminActiveCopyTrades"],
    queryFn: async () => {
      // Fetch all active copy trades with trader info
      const { data: trades, error } = await supabase
        .from("user_copy_trades")
        .select("*, traders(*)")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Fetch profiles for these users
      const userIds = [...new Set((trades || []).map((t: any) => t.user_id))];
      if (!userIds.length) return [];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, email, balance, pnl_mode, avatar_url")
        .in("user_id", userIds);

      const profileMap: Record<string, any> = {};
      (profiles || []).forEach((p: any) => { profileMap[p.user_id] = p; });

      return (trades || []).map((t: any) => ({
        ...t,
        profile: profileMap[t.user_id] || null,
      }));
    },
  });
};

export const useAdminUpdateCopyTradePnl = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tradeId, currentPnl }: { tradeId: string; currentPnl: number }) => {
      const { error } = await supabase
        .from("user_copy_trades")
        .update({ current_pnl: currentPnl } as any)
        .eq("id", tradeId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminActiveCopyTrades"] });
      toast.success("PNL updated");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update PNL"),
  });
};

export const useAdminUpdateUserPnlMode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, pnlMode }: { userId: string; pnlMode: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ pnl_mode: pnlMode })
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminActiveCopyTrades"] });
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success("PNL mode updated");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update PNL mode"),
  });
};

export const useAdminDeposits = () => {
  return useQuery({
    queryKey: ["adminDeposits"],
    queryFn: async () => {
      const { data, error } = await supabase.from("deposits").select("*, profiles!inner(first_name, last_name, email)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useAdminUpdateDeposit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string, status: "pending" | "approved" | "rejected", admin_notes?: string }) => {
      const { data, error } = await supabase.rpc("process_deposit", {
        p_deposit_id: payload.id,
        p_status: payload.status,
        p_admin_notes: payload.admin_notes || null,
      });
      if (error) throw error;

      const { data: d } = await supabase.from("deposits").select("user_id, amount, currency").eq("id", payload.id).single();
      if (d) {
        await supabase.from("notifications").insert({
          user_id: d.user_id,
          title: `Deposit ${payload.status === "approved" ? "Approved" : "Rejected"}`,
          message: `Your deposit of $${Number(d.amount).toLocaleString()} via ${d.currency} has been ${payload.status}.`,
          type: "deposit"
        });
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminDeposits"] });
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminTransactions"] });
      toast.success("Deposit processed successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to process deposit");
    }
  });
};

export const useAdminWithdrawals = () => {
  return useQuery({
    queryKey: ["adminWithdrawals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("withdrawals").select("*, profiles!inner(first_name, last_name, email, kyc_status)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useAdminUpdateWithdrawal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string, status: "pending" | "approved" | "rejected", admin_notes?: string }) => {
      const { data, error } = await supabase.rpc("process_withdrawal", {
        p_withdrawal_id: payload.id,
        p_status: payload.status,
        p_admin_notes: payload.admin_notes || null,
      });
      if (error) throw error;

      const { data: d } = await supabase.from("withdrawals").select("user_id, amount, currency").eq("id", payload.id).single();
      if (d) {
        await supabase.from("notifications").insert({
          user_id: d.user_id,
          title: `Withdrawal ${payload.status === "approved" ? "Approved" : "Rejected"}`,
          message: `Your withdrawal of $${Number(d.amount).toLocaleString()} via ${d.currency} has been ${payload.status}.`,
          type: "withdrawal"
        });
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminWithdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminTransactions"] });
      toast.success("Withdrawal processed successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to process withdrawal");
    }
  });
};

export const useAdminTransactions = () => {
  return useQuery({
    queryKey: ["adminTransactions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("transactions").select("*, profiles(first_name, last_name, email)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

// Admin Wallets CRUD
export const useAdminCreateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { user_id: string; type: string; amount: number; description?: string; status?: string }) => {
      const { error } = await supabase.from("transactions").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTransactions"] });
      toast.success("Transaction created successfully");
    },
    onError: (error: any) => toast.error(error.message || "Failed to create transaction"),
  });
};

export const useAdminDeleteTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTransactions"] });
      toast.success("Transaction deleted successfully");
    },
    onError: (error: any) => toast.error(error.message || "Failed to delete transaction"),
  });
};

export const useAdminUpdateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; updates: { type?: string; amount?: number; description?: string; status?: string } }) => {
      const { error } = await supabase.from("transactions").update(payload.updates).eq("id", payload.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTransactions"] });
      toast.success("Transaction updated successfully");
    },
    onError: (error: any) => toast.error(error.message || "Failed to update transaction"),
  });
};

// Admin Wallets CRUD
export const useAdminWallets = () => {
  return useQuery({
    queryKey: ["adminWallets"],
    queryFn: async () => {
      const { data, error } = await supabase.from("wallets").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useAdminCreateWallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { currency: string; address: string; network?: string; qr_code_url?: string; is_active?: boolean }) => {
      const { error } = await supabase.from("wallets").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminWallets"] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      toast.success("Wallet created successfully");
    },
    onError: (error: any) => { toast.error(error.message || "Failed to create wallet"); }
  });
};

export const useAdminUpdateWallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; updates: { currency?: string; address?: string; network?: string; qr_code_url?: string; is_active?: boolean } }) => {
      const { error } = await supabase.from("wallets").update(payload.updates).eq("id", payload.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminWallets"] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      toast.success("Wallet updated successfully");
    },
    onError: (error: any) => { toast.error(error.message || "Failed to update wallet"); }
  });
};

export const useAdminDeleteWallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("wallets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminWallets"] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      toast.success("Wallet deleted successfully");
    },
    onError: (error: any) => { toast.error(error.message || "Failed to delete wallet"); }
  });
};

// Admin KYC (uses profiles with kyc_status)
export const useAdminUpdateKYC = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { user_id: string; kyc_status: "unverified" | "pending" | "verified" | "rejected" }) => {
      const { error } = await supabase.from("profiles").update({ kyc_status: payload.kyc_status }).eq("user_id", payload.user_id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success("KYC status updated successfully");
    },
    onError: (error: any) => { toast.error(error.message || "Failed to update KYC status"); }
  });
};

// Admin Traders CRUD
export const useAdminTraders = () => {
  return useQuery({
    queryKey: ["adminTraders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("traders").select("*").order("win_rate", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useAdminCreateTrader = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; bio?: string; avatar_url?: string; win_rate?: number; total_profit?: number; followers?: number; is_active?: boolean }) => {
      const { error } = await supabase.from("traders").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTraders"] });
      queryClient.invalidateQueries({ queryKey: ["traders"] });
      toast.success("Trader created successfully");
    },
    onError: (error: any) => { toast.error(error.message || "Failed to create trader"); }
  });
};

export const useAdminUpdateTrader = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; updates: { name?: string; bio?: string; avatar_url?: string; win_rate?: number; total_profit?: number; followers?: number; is_active?: boolean } }) => {
      const { error } = await supabase.from("traders").update(payload.updates).eq("id", payload.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTraders"] });
      queryClient.invalidateQueries({ queryKey: ["traders"] });
      toast.success("Trader updated successfully");
    },
    onError: (error: any) => { toast.error(error.message || "Failed to update trader"); }
  });
};

export const useAdminDeleteTrader = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("traders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTraders"] });
      queryClient.invalidateQueries({ queryKey: ["traders"] });
      toast.success("Trader deleted successfully");
    },
    onError: (error: any) => { toast.error(error.message || "Failed to delete trader"); }
  });
};

// User Notifications
export const useUserNotifications = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });
};

// Chat Hooks (User)
const CHAT_PAGE_SIZE = 30;

export const useUserChats = (page: number = 0) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["supportChats", user?.id, page],
    queryFn: async () => {
      if (!user) return { messages: [], hasMore: false };
      const from = page * CHAT_PAGE_SIZE;
      const to = from + CHAT_PAGE_SIZE - 1;
      const { data, error, count } = await supabase
        .from("support_chats")
        .select("*", { count: "exact" })
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) throw error;
      return {
        messages: (data || []).reverse(),
        hasMore: (count || 0) > from + CHAT_PAGE_SIZE,
        total: count || 0,
      };
    },
    enabled: !!user,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (payload: { message: string; attachment_url?: string; attachment_type?: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("support_chats").insert({
        user_id: user.id,
        sender_type: "user",
        message: payload.message,
        attachment_url: payload.attachment_url || null,
        attachment_type: payload.attachment_type || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supportChats", user?.id] });
    },
    onError: (error: any) => toast.error(error.message || "Failed to send message"),
  });
};

export const useUploadChatAttachment = () => {
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
    onError: (error: any) => toast.error(error.message || "Failed to upload file"),
  });
};

// Chat Hooks (Admin)
export const useAdminChatPreview = () => {
  return useQuery({
    queryKey: ["adminChatsPreview"],
    queryFn: async () => {
      const { data, error } = await supabase.from("support_chats")
        .select("*, profiles!inner(first_name, last_name, email)")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const users: Record<string, any> = {};
      data.forEach(chat => {
        if (!users[chat.user_id]) {
          users[chat.user_id] = {
            user_id: chat.user_id,
            profile: chat.profiles,
            lastMessage: chat.attachment_url ? (chat.attachment_type === "image" ? "📷 Image" : "📎 File") : chat.message,
            lastMessageTime: chat.created_at,
            unreadCount: 0
          };
        }
        if (chat.sender_type === "user" && !chat.is_read) {
          users[chat.user_id].unreadCount++;
        }
      });
      return Object.values(users);
    },
  });
};

export const useAdminChatHistory = (userId: string | null, page: number = 0) => {
  return useQuery({
    queryKey: ["adminChatHistory", userId, page],
    queryFn: async () => {
      if (!userId) return { messages: [], hasMore: false };
      const from = page * CHAT_PAGE_SIZE;
      const to = from + CHAT_PAGE_SIZE - 1;
      const { data, error, count } = await supabase
        .from("support_chats")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) throw error;
      return {
        messages: (data || []).reverse(),
        hasMore: (count || 0) > from + CHAT_PAGE_SIZE,
        total: count || 0,
      };
    },
    enabled: !!userId,
  });
};

export const useAdminSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { userId: string; message: string; attachment_url?: string; attachment_type?: string }) => {
      const { error } = await supabase.from("support_chats").insert({
        user_id: payload.userId,
        sender_type: "admin",
        message: payload.message,
        attachment_url: payload.attachment_url || null,
        attachment_type: payload.attachment_type || null,
      });
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminChatHistory", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["adminChatsPreview"] });
    },
    onError: (error: any) => toast.error(error.message || "Failed to send message"),
  });
};

export const useAdminMarkChatRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.from("support_chats").update({ is_read: true }).eq("user_id", userId).eq("sender_type", "user");
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminChatsPreview"] });
      queryClient.invalidateQueries({ queryKey: ["adminChatHistory", variables] });
    },
  });
};

// --- Investment Hooks ---

export const useInvestmentPlans = () => {
  return useQuery({
    queryKey: ["investmentPlans"],
    queryFn: async () => {
      const { data, error } = await supabase.from("investment_plans").select("*").order("min_amount", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
};

export const useAdminInvestmentPlans = () => {
  return useQuery({
    queryKey: ["adminInvestmentPlans"],
    queryFn: async () => {
      const { data, error } = await supabase.from("investment_plans").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateInvestmentPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (plan: any) => {
      const { data, error } = await supabase.from("investment_plans").insert(plan).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminInvestmentPlans"] });
      queryClient.invalidateQueries({ queryKey: ["investmentPlans"] });
      toast.success("Investment plan created successfully");
    },
    onError: (error: any) => toast.error(error.message || "Failed to create investment plan"),
  });
};

export const useUpdateInvestmentPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase.from("investment_plans").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminInvestmentPlans"] });
      queryClient.invalidateQueries({ queryKey: ["investmentPlans"] });
      toast.success("Investment plan updated successfully");
    },
    onError: (error: any) => toast.error(error.message || "Failed to update investment plan"),
  });
};

export const useDeleteInvestmentPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("investment_plans").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminInvestmentPlans"] });
      queryClient.invalidateQueries({ queryKey: ["investmentPlans"] });
      toast.success("Investment plan deleted successfully");
    },
    onError: (error: any) => toast.error(error.message || "Failed to delete investment plan"),
  });
};

export const useUserInvestments = (userId?: string) => {
  const { user } = useAuth();
  const id = userId || user?.id;
  return useQuery({
    queryKey: ["userInvestments", id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase.from("user_investments").select(`
        *,
        plan:investment_plans(*)
      `).eq("user_id", id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useAdminUserInvestments = () => {
  return useQuery({
    queryKey: ["adminUserInvestments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_investments").select(`
        *,
        plan:investment_plans(*),
        user:profiles(*)
      `).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateUserInvestment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (investment: any) => {
      const { data, error } = await supabase.from("user_investments").insert({
        ...investment,
        user_id: user?.id,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userInvestments"] });
      queryClient.invalidateQueries({ queryKey: ["adminUserInvestments"] });
      toast.success("Investment started successfully!");
    },
    onError: (error: any) => toast.error(error.message || "Failed to start investment"),
  });
};

// ─── Deposit Continuation / Recovery System ───────────────────

export const useUserActiveDepositIntent = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["activeDepositIntent", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("deposit_intents")
        .select("*, wallets(id, currency, network, address)")
        .eq("user_id", user.id)
        .in("status", ["Awaiting Payment", "Awaiting Confirmation", "Pending Verification", "Under Review"])
        .order("initiated_timestamp", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useCreateDepositIntent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (payload: {
      deposit_method: string;
      selected_currency: string;
      selected_network?: string;
      wallet_address: string;
      amount?: number;
      wallet_id?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("deposit_intents")
        .insert({
          ...payload,
          user_id: user.id,
          status: "Awaiting Payment",
        })
        .select()
        .single();
      if (error) throw error;

      // Send initial notification
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "Deposit Initiated",
        message: "Your cryptocurrency purchase process has started. Complete the purchase and return to AssetVault to submit your transaction details.",
        type: "deposit" as any,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeDepositIntent", user?.id] });
    },
  });
};

export const useCancelDepositIntent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (intentId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.rpc("cancel_deposit_intent", {
        p_intent_id: intentId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeDepositIntent", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["userDepositIntents", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["adminDepositIntents"] });
      toast.success("Deposit process cancelled.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to cancel deposit process");
    },
  });
};

export const useSubmitDepositConfirmation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (payload: {
      intentId: string;
      amount_sent: number;
      tx_hash: string;
      screenshot_url?: string;
      user_notes?: string;
      currency: string;
      wallet_id: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // 1. Create the deposit record in deposits
      const { data: depositData, error: depositError } = await supabase
        .from("deposits")
        .insert({
          amount: payload.amount_sent,
          currency: payload.currency,
          wallet_id: payload.wallet_id,
          tx_hash: payload.tx_hash,
          screenshot_url: payload.screenshot_url,
          user_notes: payload.user_notes,
          user_id: user.id,
          status: "pending",
        })
        .select()
        .single();
      
      if (depositError) throw depositError;

      // 2. Link deposit and update deposit intent status
      const { error: intentError } = await supabase
        .from("deposit_intents")
        .update({
          deposit_id: depositData.id,
          amount_sent: payload.amount_sent,
          tx_hash: payload.tx_hash,
          screenshot_url: payload.screenshot_url,
          user_notes: payload.user_notes,
          status: "Pending Verification",
          last_activity_timestamp: new Date().toISOString(),
        })
        .eq("id", payload.intentId);

      if (intentError) throw intentError;

      // 3. Insert user notification
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "Deposit Submitted",
        message: `Your deposit of $${payload.amount_sent.toLocaleString()} via ${payload.currency} has been submitted and is awaiting verification.`,
        type: "deposit" as any,
      });

      return depositData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeDepositIntent", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["userDeposits", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["userDepositIntents", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["adminDepositIntents"] });
      toast.success("Deposit details submitted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit deposit confirmation");
    },
  });
};

export const useCheckDepositLifecycle = () => {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("check_deposit_intents_lifecycle");
      if (error) throw error;
    },
  });
};

export const useUserDepositIntents = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["userDepositIntents", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("deposit_intents")
        .select("*, wallets(id, currency, network, address, user_id)")
        .eq("user_id", user.id)
        .order("initiated_timestamp", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useAdminDepositIntents = () => {
  return useQuery({
    queryKey: ["adminDepositIntents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deposit_intents")
        .select("*, profiles!inner(id, first_name, last_name, email)")
        .order("initiated_timestamp", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
};
// Force reload
