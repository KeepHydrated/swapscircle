
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type User = {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
};

export const fetchUserProfile = async (userId: string) => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Profile fetch error:', error);
    return null;
  }
};

export const signUp = async (email: string, password: string, name: string) => {
  if (!isSupabaseConfigured()) {
    toast.error('Supabase is not configured. Please add environment variables.');
    return;
  }

  try {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      throw error;
    }

    if (data.user) {
      // Create a profile record
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        name,
        email,
        created_at: new Date().toISOString(),
      });

      if (profileError) {
        throw profileError;
      }

      toast.success('Account created successfully! Please check your email for verification.');
    }
  } catch (error: any) {
    toast.error(error.message || 'Error signing up');
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  if (!isSupabaseConfigured()) {
    toast.error('Supabase is not configured. Please add environment variables.');
    return;
  }

  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      throw error;
    }

    toast.success('Logged in successfully!');
  } catch (error: any) {
    toast.error(error.message || 'Error signing in');
    throw error;
  }
};

export const signOut = async () => {
  if (!isSupabaseConfigured()) {
    toast.error('Supabase is not configured. Please add environment variables.');
    return;
  }

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    toast.success('Signed out successfully');
  } catch (error: any) {
    toast.error(error.message || 'Error signing out');
    throw error;
  }
};

export const updateProfile = async (userId: string, data: { name?: string; avatar_url?: string }) => {
  if (!userId || !isSupabaseConfigured()) {
    if (!isSupabaseConfigured()) {
      toast.error('Supabase is not configured. Please add environment variables.');
    }
    return;
  }

  try {
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId);

    if (error) {
      throw error;
    }

    toast.success('Profile updated successfully');
    return true;
  } catch (error: any) {
    toast.error(error.message || 'Error updating profile');
    throw error;
  }
};

export const getCurrentSession = async () => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }

    return data?.session || null;
  } catch (error) {
    console.error('Session fetch error:', error);
    return null;
  }
};
