import React, { useEffect, useState, createContext, useContext } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { apiJson } from '../lib/apiClient';

export type Role = 'admin' | 'subscriber';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  charityId?: string | null;
  charityPercent?: number | null;
  subscriptionStatus?: string | null;
  subscriptionPlan?: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapSessionToUser(session: Session | null): User | null {
  if (!session?.user) {
    return null;
  }

  const email = session.user.email ?? '';
  const metadataName =
    (session.user.user_metadata?.full_name as string | undefined) ??
    (session.user.user_metadata?.name as string | undefined) ??
    email.split('@')[0] ??
    'User';

  const role: Role = email.toLowerCase().includes('admin')
    ? 'admin'
    : 'subscriber';

  return {
    id: session.user.id,
    email,
    name: role === 'admin' ? 'Administrator' : metadataName,
    role,
    charityId: (session.user.user_metadata?.charity_id as string | undefined) ?? null,
    charityPercent:
      (session.user.user_metadata?.charity_percent as number | undefined) ?? null,
    subscriptionStatus:
      (session.user.user_metadata?.subscription_status as string | undefined) ?? null,
    subscriptionPlan:
      (session.user.user_metadata?.subscription_plan as string | undefined) ?? null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setUser(mapSessionToUser(data.session));
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapSessionToUser(session));
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return { error: error.message };
    }
    return {};
  };

  const signup = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    if (error) {
      return { error: error.message };
    }
    return {};
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const refreshSubscription = async () => {
    if (!user) return;
    try {
      const result = await apiJson<{
        allowed: boolean;
        subscription_status: string;
        subscription_plan: string;
      }>('/auth/validate-subscription', {
        method: 'POST',
        body: JSON.stringify({ userId: user.id }),
      });
      setUser((prev) =>
        prev
          ? {
              ...prev,
              subscriptionStatus: result.subscription_status,
              subscriptionPlan: result.subscription_plan,
            }
          : prev
      );
      if (!result.allowed && user.role !== 'admin') {
        await supabase.auth.signOut();
        setUser(null);
      }
    } catch {
      // keep local session if API is unavailable
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        signup,
        logout,
        refreshSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}