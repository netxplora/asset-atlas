export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      balances: {
        Row: {
          copy_trading_balance: number | null
          created_at: string | null
          crypto_balances: Json | null
          fiat_balance: number | null
          id: string
          trading_balance: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          copy_trading_balance?: number | null
          created_at?: string | null
          crypto_balances?: Json | null
          fiat_balance?: number | null
          id?: string
          trading_balance?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          copy_trading_balance?: number | null
          created_at?: string | null
          crypto_balances?: Json | null
          fiat_balance?: number | null
          id?: string
          trading_balance?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chat_audit_logs: {
        Row: {
          action: string
          conversation_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          performed_by: string | null
        }
        Insert: {
          action: string
          conversation_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          performed_by?: string | null
        }
        Update: {
          action?: string
          conversation_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_audit_logs_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_faqs: {
        Row: {
          answer: string | null
          created_at: string
          id: string
          is_active: boolean
          question: string
          sort_order: number
          usage_count: number
        }
        Insert: {
          answer?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          question: string
          sort_order?: number
          usage_count?: number
        }
        Update: {
          answer?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          question?: string
          sort_order?: number
          usage_count?: number
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          attachment_type: string | null
          attachment_url: string | null
          conversation_id: string
          created_at: string | null
          id: string
          is_delivered: boolean | null
          is_read: boolean | null
          message: string
          sender_id: string
          sender_type: string
        }
        Insert: {
          attachment_type?: string | null
          attachment_url?: string | null
          conversation_id: string
          created_at?: string | null
          id?: string
          is_delivered?: boolean | null
          is_read?: boolean | null
          message?: string
          sender_id: string
          sender_type: string
        }
        Update: {
          attachment_type?: string | null
          attachment_url?: string | null
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_delivered?: boolean | null
          is_read?: boolean | null
          message?: string
          sender_id?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      config_backups: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          label: string | null
          snapshot: Json
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          label?: string | null
          snapshot: Json
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          label?: string | null
          snapshot?: Json
        }
        Relationships: []
      }
      config_versions: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          config_key: string
          id: string
          new_value: Json | null
          old_value: Json | null
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          config_key: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          config_key?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
        }
        Relationships: []
      }
      conversation_notes: {
        Row: {
          admin_id: string
          conversation_id: string
          created_at: string | null
          id: string
          note: string
        }
        Insert: {
          admin_id: string
          conversation_id: string
          created_at?: string | null
          id?: string
          note: string
        }
        Update: {
          admin_id?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_notes_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          assigned_admin_id: string | null
          created_at: string | null
          id: string
          is_archived: boolean | null
          priority: string
          resolved_at: string | null
          status: string
          subject: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_admin_id?: string | null
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_admin_id?: string | null
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_profile_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      crypto_providers: {
        Row: {
          created_at: string
          description: string | null
          id: string
          priority: number | null
          provider_name: string
          provider_url: string
          status: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          priority?: number | null
          provider_name: string
          provider_url: string
          status?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          priority?: number | null
          provider_name?: string
          provider_url?: string
          status?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      deposit_audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          intent_id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          intent_id: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          intent_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      deposit_intents: {
        Row: {
          amount: number | null
          amount_sent: number | null
          created_at: string
          deposit_id: string | null
          deposit_method: string
          id: string
          initiated_timestamp: string
          last_activity_timestamp: string
          reminder_24h_sent: boolean
          reminder_30m_sent: boolean
          reminder_72h_sent: boolean
          screenshot_url: string | null
          selected_currency: string
          selected_network: string | null
          status: string
          tx_hash: string | null
          updated_at: string
          user_id: string
          user_notes: string | null
          wallet_address: string
          wallet_id: string | null
        }
        Insert: {
          amount?: number | null
          amount_sent?: number | null
          created_at?: string
          deposit_id?: string | null
          deposit_method: string
          id?: string
          initiated_timestamp?: string
          last_activity_timestamp?: string
          reminder_24h_sent?: boolean
          reminder_30m_sent?: boolean
          reminder_72h_sent?: boolean
          screenshot_url?: string | null
          selected_currency: string
          selected_network?: string | null
          status?: string
          tx_hash?: string | null
          updated_at?: string
          user_id: string
          user_notes?: string | null
          wallet_address: string
          wallet_id?: string | null
        }
        Update: {
          amount?: number | null
          amount_sent?: number | null
          created_at?: string
          deposit_id?: string | null
          deposit_method?: string
          id?: string
          initiated_timestamp?: string
          last_activity_timestamp?: string
          reminder_24h_sent?: boolean
          reminder_30m_sent?: boolean
          reminder_72h_sent?: boolean
          screenshot_url?: string | null
          selected_currency?: string
          selected_network?: string | null
          status?: string
          tx_hash?: string | null
          updated_at?: string
          user_id?: string
          user_notes?: string | null
          wallet_address?: string
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deposit_intents_deposit_id_fkey"
            columns: ["deposit_id"]
            isOneToOne: false
            referencedRelation: "deposits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposit_intents_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposit_intents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      deposits: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string
          currency: string
          id: string
          screenshot_url: string | null
          status: Database["public"]["Enums"]["request_status"]
          tx_hash: string | null
          updated_at: string
          user_id: string
          user_notes: string | null
          wallet_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string
          currency: string
          id?: string
          screenshot_url?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          tx_hash?: string | null
          updated_at?: string
          user_id: string
          user_notes?: string | null
          wallet_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          screenshot_url?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          tx_hash?: string | null
          updated_at?: string
          user_id?: string
          user_notes?: string | null
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deposits_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "deposits_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_plans: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          duration_days: number
          id: string
          is_active: boolean | null
          max_amount: number | null
          min_amount: number
          name: string
          roi_percentage: number
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration_days: number
          id?: string
          is_active?: boolean | null
          max_amount?: number | null
          min_amount: number
          name: string
          roi_percentage: number
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration_days?: number
          id?: string
          is_active?: boolean | null
          max_amount?: number | null
          min_amount?: number
          name?: string
          roi_percentage?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          dismissed_by: string[] | null
          id: string
          is_read: boolean
          message: string
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          dismissed_by?: string[] | null
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          dismissed_by?: string[] | null
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          balance: number
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          kyc_document_url: string | null
          kyc_id_number: string | null
          kyc_id_type: string | null
          kyc_status: Database["public"]["Enums"]["kyc_status"]
          last_name: string | null
          name: string | null
          pnl_mode: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          balance?: number
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          kyc_document_url?: string | null
          kyc_id_number?: string | null
          kyc_id_type?: string | null
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          last_name?: string | null
          name?: string | null
          pnl_mode?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          balance?: number
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          kyc_document_url?: string | null
          kyc_id_number?: string | null
          kyc_id_type?: string | null
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          last_name?: string | null
          name?: string | null
          pnl_mode?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_chats: {
        Row: {
          attachment_type: string | null
          attachment_url: string | null
          created_at: string
          id: string
          is_delivered: boolean | null
          is_read: boolean
          message: string
          sender_type: string
          user_id: string
        }
        Insert: {
          attachment_type?: string | null
          attachment_url?: string | null
          created_at?: string
          id?: string
          is_delivered?: boolean | null
          is_read?: boolean
          message: string
          sender_type: string
          user_id: string
        }
        Update: {
          attachment_type?: string | null
          attachment_url?: string | null
          created_at?: string
          id?: string
          is_delivered?: boolean | null
          is_read?: boolean
          message?: string
          sender_type?: string
          user_id?: string
        }
        Relationships: []
      }
      traders: {
        Row: {
          avatar_url: string | null
          bio: string | null
          category: string | null
          created_at: string
          followers: number
          id: string
          is_active: boolean
          min_copy_balance: number | null
          name: string
          platform_fee_percentage: number | null
          total_profit: number
          updated_at: string
          win_rate: number
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          category?: string | null
          created_at?: string
          followers?: number
          id?: string
          is_active?: boolean
          min_copy_balance?: number | null
          name: string
          platform_fee_percentage?: number | null
          total_profit?: number
          updated_at?: string
          win_rate?: number
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          category?: string | null
          created_at?: string
          followers?: number
          id?: string
          is_active?: boolean
          min_copy_balance?: number | null
          name?: string
          platform_fee_percentage?: number | null
          total_profit?: number
          updated_at?: string
          win_rate?: number
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          status: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          status?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_copy_trades: {
        Row: {
          allocated_capital: number
          closed_at: string | null
          created_at: string | null
          current_pnl: number | null
          id: string
          status: string | null
          trader_id: string | null
          user_id: string | null
        }
        Insert: {
          allocated_capital: number
          closed_at?: string | null
          created_at?: string | null
          current_pnl?: number | null
          id?: string
          status?: string | null
          trader_id?: string | null
          user_id?: string | null
        }
        Update: {
          allocated_capital?: number
          closed_at?: string | null
          created_at?: string | null
          current_pnl?: number | null
          id?: string
          status?: string | null
          trader_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_copy_trades_trader_id_fkey"
            columns: ["trader_id"]
            isOneToOne: false
            referencedRelation: "traders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_copy_trades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_investments: {
        Row: {
          amount: number
          created_at: string | null
          duration_days: number
          end_date: string
          id: string
          last_profit_update: string | null
          plan_id: string | null
          profit_generated: number | null
          roi_percentage: number
          start_date: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          duration_days: number
          end_date: string
          id?: string
          last_profit_update?: string | null
          plan_id?: string | null
          profit_generated?: number | null
          roi_percentage: number
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          duration_days?: number
          end_date?: string
          id?: string
          last_profit_update?: string | null
          plan_id?: string | null
          profit_generated?: number | null
          roi_percentage?: number
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_investments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "investment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          address: string
          created_at: string
          currency: string
          exchange_rate: number
          id: string
          is_active: boolean
          network: string | null
          qr_code_url: string | null
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          currency: string
          exchange_rate?: number
          id?: string
          is_active?: boolean
          network?: string | null
          qr_code_url?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          currency?: string
          exchange_rate?: number
          id?: string
          is_active?: boolean
          network?: string | null
          qr_code_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string
          currency: string
          id: string
          status: Database["public"]["Enums"]["request_status"]
          updated_at: string
          user_id: string
          wallet_address: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string
          currency: string
          id?: string
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          user_id: string
          wallet_address: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          user_id?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_investment_profits: { Args: never; Returns: undefined }
      cancel_copy_trade: {
        Args: { p_current_pnl: number; p_trade_id: string; p_user_id: string }
        Returns: Json
      }
      cancel_deposit_intent: {
        Args: { p_intent_id: string }
        Returns: undefined
      }
      check_deposit_intents_lifecycle: { Args: never; Returns: undefined }
      close_copy_trade: {
        Args: { p_trade_id: string; p_user_id: string }
        Returns: Json
      }
      ensure_infrastructure_integrity: { Args: never; Returns: Json }
      has_role:
        | {
            Args: { _role: Database["public"]["Enums"]["app_role"] }
            Returns: boolean
          }
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
      make_me_admin: { Args: never; Returns: undefined }
      process_deposit:
        | {
            Args: {
              p_admin_notes: string
              p_deposit_id: string
              p_status: Database["public"]["Enums"]["request_status"]
            }
            Returns: undefined
          }
        | {
            Args: {
              p_admin_notes?: string
              p_deposit_id: string
              p_status: string
            }
            Returns: Json
          }
      process_withdrawal: {
        Args: {
          p_admin_notes: string
          p_status: Database["public"]["Enums"]["request_status"]
          p_withdrawal_id: string
        }
        Returns: undefined
      }
      start_copy_trade: {
        Args: { p_allocation: number; p_trader_id: string; p_user_id: string }
        Returns: Json
      }
      promote_to_admin: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      revoke_admin: {
        Args: { p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      kyc_status: "unverified" | "pending" | "verified" | "rejected"
      notification_type:
        | "deposit"
        | "withdrawal"
        | "investment"
        | "security"
        | "system"
        | "trading"
      request_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      kyc_status: ["unverified", "pending", "verified", "rejected"],
      notification_type: [
        "deposit",
        "withdrawal",
        "investment",
        "security",
        "system",
        "trading",
      ],
      request_status: ["pending", "approved", "rejected"],
    },
  },
} as const
// Force reload
