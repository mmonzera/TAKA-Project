"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
  user: null, session: null, loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const init = async () => {
        try {
          const res: any = await supabase.auth.getSession();
          const s = res?.data?.session ?? null;
          setSession(s);
          setUser(s?.user ?? null);
        } catch {
          // noop
        }
        setLoading(false);
      };
      init();

      const sub: any = supabase.auth.onAuthStateChange((_event: any, s: any) => {
        setSession(s);
        setUser(s?.user ?? null);
        setLoading(false);
      });

      return () => {
        if (sub?.data?.subscription?.unsubscribe) sub.data.subscription.unsubscribe();
      };
    } catch {
      setLoading(false);
      return () => {};
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error }: any = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message || null };
    } catch (e: any) {
      return { error: e?.message || "Login failed" };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { error }: any = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name } },
      });
      return { error: error?.message || null };
    } catch (e: any) {
      return { error: e?.message || "Signup failed" };
    }
  };

  const signOut = async () => {
    try { await supabase.auth.signOut(); } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
