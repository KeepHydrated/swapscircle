
import React, { createContext, useContext } from 'react';
import { User } from '@/services/authService';

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

// Export the hook for using this context
export const useAuth = () => useContext(AuthContext);

// Export the context for the provider
export { AuthContext };
