'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  supabase: SupabaseClient | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, locale?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState<SupabaseClient | null>(() => {
    try {
      return createBrowserSupabaseClient();
    } catch {
      return null;
    }
  });

  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(() => Boolean(supabase));

  useEffect(() => {
    if (!supabase) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    void supabase.auth.getSession().then(({ data: { session: nextSession } }) => {
      if (cancelled) {
        return;
      }

      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (cancelled) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setIsLoading(false);
    });

    // Safety timeout: don't block the user forever if Supabase is slow/down
    const timeout = setTimeout(() => {
      if (!cancelled) {
        setIsLoading(false);
      }
    }, 2500);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [supabase]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!supabase) {
        return { error: new Error('Supabase not configured') };
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error ? new Error(error.message) : null };
    },
    [supabase]
  );

  const signUp = useCallback(
    async (email: string, password: string, locale = 'en') => {
      if (!supabase) {
        return { error: new Error('Supabase not configured') };
      }

      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=/${locale}`
        }
      });

      return { error: error ? new Error(error.message) : null };
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      isLoading,
      supabase,
      signIn,
      signUp,
      signOut
    }),
    [user, session, isLoading, supabase, signIn, signUp, signOut]
  );

  if (isLoading && supabase) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 overflow-hidden">
        <div className="relative">
          {/* Pulse animation */}
          <div className="absolute inset-0 scale-[2.5] rounded-full bg-indigo-500/20 blur-2xl animate-pulse" />
          
          <div className="relative flex h-24 w-24 items-center justify-center rounded-[2rem] bg-slate-950 text-3xl font-black text-white shadow-2xl ring-1 ring-white/10 animate-bounce">
            GD
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 animate-pulse">
            Configuring Premium Experience
          </p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return ctx;
}
