import { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from "react";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: any;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  profile: null,
  isAdmin: false,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const initialSessionHandled = useRef(false);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();
      setProfile(data);
      setIsAdmin(data?.role === "admin");
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }, []);

  const handleSession = useCallback((currentSession: Session | null) => {
    setSession(currentSession);
    setUser(currentSession?.user ?? null);
    if (currentSession?.user) {
      fetchProfile(currentSession.user.id);
    } else {
      setProfile(null);
      setIsAdmin(false);
    }
  }, [fetchProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  useEffect(() => {
    // 1. Set up the auth state listener FIRST (Supabase best practice)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, currentSession: Session | null) => {
        // Skip INITIAL_SESSION if we already handled it via getSession
        if (event === 'INITIAL_SESSION' && initialSessionHandled.current) {
          return;
        }

        // Only clear state on explicit sign out
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // For all other events (SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED)
        // update the session state
        handleSession(currentSession);
        setLoading(false);
      }
    );

    // 2. Then check for existing session (page refresh / browser reopen)
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      initialSessionHandled.current = true;
      handleSession(existingSession);
      setLoading(false);
    });

    // 3. Refresh session when user returns to tab after being away
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        supabase.auth.getSession().then(({ data: { session: refreshedSession } }) => {
          if (refreshedSession) {
            setSession(refreshedSession);
            setUser(refreshedSession.user);
          }
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleSession]);

  const signOut = useCallback(async () => {
    // Close active chat sessions before signing out
    if (user) {
      try {
        const { closeUserChatSession } = await import("@/hooks/useSupportChat");
        await closeUserChatSession(user.id);
      } catch (e) {
        // Don't block logout if chat cleanup fails
      }
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, session, loading, profile, isAdmin, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
