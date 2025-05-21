
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, signUp as apiSignUp, signIn as apiSignIn, signOut as apiSignOut, getCurrentSession, fetchUserProfile, updateProfile as apiUpdateProfile } from '@/services/authService';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: { name?: string; avatar_url?: string }) => Promise<void>;
  supabaseConfigured: boolean;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  updateProfile: async () => {},
  supabaseConfigured: false,
});

// Auth Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if the user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get the user session
        const session = await getCurrentSession();
        
        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: profile?.name || session.user.email?.split('@')[0] || '',
            avatar_url: profile?.avatar_url
          });
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Set up auth state change listener
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: profile?.name || session.user.email?.split('@')[0] || '',
            avatar_url: profile?.avatar_url
          });
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign up function
  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      await apiSignUp(email, password, name);
      
      // Automatically sign in after registration
      await apiSignIn(email, password);
      
      // Get the user session after sign in
      const session = await getCurrentSession();
      
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: profile?.name || session.user.email?.split('@')[0] || '',
          avatar_url: profile?.avatar_url
        });
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await apiSignIn(email, password);
      
      const session = await getCurrentSession();
      
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: profile?.name || session.user.email?.split('@')[0] || '',
          avatar_url: profile?.avatar_url
        });
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    setLoading(true);
    try {
      await apiSignOut();
      setUser(null);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (data: { name?: string; avatar_url?: string }) => {
    if (!user) return;
    
    try {
      await apiUpdateProfile(user.id, data);
      
      // Update the local user state
      setUser({
        ...user,
        name: data.name !== undefined ? data.name : user.name,
        avatar_url: data.avatar_url !== undefined ? data.avatar_url : user.avatar_url
      });
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        signUp, 
        signIn, 
        signOut, 
        updateProfile,
        supabaseConfigured: isSupabaseConfigured()
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Export the hook for using this context
export const useAuth = () => useContext(AuthContext);

// Export the context for the provider
export { AuthContext };
