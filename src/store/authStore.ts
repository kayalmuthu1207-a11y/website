import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

interface AuthStore {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,

  signUp: async (email: string, password: string, fullName: string) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    if (authData.user) {
      const { error: profileError } = await supabase.from('users').insert({
        id: authData.user.id,
        email,
        full_name: fullName,
      });

      if (profileError) throw profileError;

      set({
        user: {
          id: authData.user.id,
          email,
          full_name: fullName,
        },
      });
    }
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      set({
        user: userData
          ? {
              id: userData.id,
              email: userData.email,
              full_name: userData.full_name,
              avatar_url: userData.avatar_url,
            }
          : {
              id: data.user.id,
              email: data.user.email || '',
            },
      });
    }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null });
  },

  checkSession: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        set({
          user: userData
            ? {
                id: userData.id,
                email: userData.email,
                full_name: userData.full_name,
                avatar_url: userData.avatar_url,
              }
            : {
                id: session.user.id,
                email: session.user.email || '',
              },
        });
      } else {
        set({ user: null });
      }
    } finally {
      set({ loading: false });
    }
  },
}));
