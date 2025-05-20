
import React, { useState, useEffect } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { 
  User, 
  signUp as authSignUp, 
  signIn as authSignIn, 
  signOut as authSignOut,
  updateProfile as authUpdateProfile,
  fetchUserProfile,
  getCurrentSession
} from '@/services/authService';

// Clean up authentication state function to prevent auth limbo
const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

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
            // Use optional chaining and nullish coalescing to handle possible null values
            name: profileData?.name ?? undefined,
            avatar_url: profileData?.avatar_url ?? undefined,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    // Set up auth subscription FIRST
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;
    
    if (supabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          if (session) {
            // Defer database operations to prevent deadlocks
            setTimeout(async () => {
              // Fetch user profile from profiles table
              const profileData = await fetchUserProfile(session.user.id);

              setUser({
                id: session.user.id,
                email: session.user.email || '',
                // Use optional chaining and nullish coalescing to handle possible null values
                name: profileData?.name ?? undefined,
                avatar_url: profileData?.avatar_url ?? undefined,
              });
            }, 0);
          }
        }
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      });

      authListener = data;
    }

    // THEN check for existing session
    getSession();

    return () => {
      if (authListener) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [supabaseConfigured]);

  const signUp = async (email: string, password: string, name: string) => {
    // Clean up existing auth state before sign up
    cleanupAuthState();
    
    try {
      // Attempt global sign out first
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      // Continue even if this fails
    }
    
    await authSignUp(email, password, name);
    
    // Force page reload
    window.location.href = '/';
  };

  const signIn = async (email: string, password: string) => {
    // Clean up existing auth state before sign in
    cleanupAuthState();
    
    try {
      // Attempt global sign out first
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      // Continue even if this fails
    }
    
    await authSignIn(email, password);
    
    // Force page reload
    window.location.href = '/';
  };

  const signOut = async () => {
    // Clean up auth state
    cleanupAuthState();
    
    try {
      // Attempt global sign out
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      // Ignore errors
    }
    
    await authSignOut();
    
    // Force page reload for a clean state
    window.location.href = '/auth';
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
