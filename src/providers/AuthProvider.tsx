
import React, { useState, useEffect } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { 
  User, 
  signUp as authSignUp, 
  signIn as authSignIn, 
  signOut as authSignOut,
  updateProfile as authUpdateProfile,
  fetchUserProfile,
  getCurrentSession
} from '@/services/authService';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabaseConfigured = isSupabaseConfigured();

  useEffect(() => {
    // Check active session and set user
    const getSession = async () => {
      setLoading(true);
      
      if (!supabaseConfigured) {
        setLoading(false);
        return;
      }
      
      try {
        const session = await getCurrentSession();

        if (session) {
          const profileData = await fetchUserProfile(session.user.id);

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: profileData?.name,
            avatar_url: profileData?.avatar_url,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Set up auth subscription
    if (supabaseConfigured) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          if (session) {
            // Fetch user profile from profiles table
            const profileData = await fetchUserProfile(session.user.id);

            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: profileData?.name,
              avatar_url: profileData?.avatar_url,
            });
          }
        }
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, [supabaseConfigured]);

  const signUp = async (email: string, password: string, name: string) => {
    await authSignUp(email, password, name);
  };

  const signIn = async (email: string, password: string) => {
    await authSignIn(email, password);
  };

  const signOut = async () => {
    await authSignOut();
  };

  const updateProfile = async (data: { name?: string; avatar_url?: string }) => {
    if (!user) return;
    
    const updated = await authUpdateProfile(user.id, data);
    if (updated) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signUp,
      signIn,
      signOut,
      updateProfile,
      supabaseConfigured
    }}>
      {children}
    </AuthContext.Provider>
  );
};
