
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
    // Using try-catch since the table might not exist yet
    try {
      // Check if the table exists first
      const { error: checkError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (checkError && checkError.message?.includes('does not exist')) {
        console.warn('The profiles table does not exist yet. Please run the SQL migrations.');
        return null;
      }
      
      const result = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (result.error) {
        console.error('Error fetching profile:', result.error);
        return null;
      }

      return result.data;
    } catch (error) {
      console.error('Profile fetch error:', error);
      return null;
    }
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
      try {
        // Try to create a profile record if the table exists
        try {
          const { error: tableCheckError } = await supabase
            .from('profiles')
            .select('count')
            .limit(1);
            
          // Only try to insert if the table exists
          if (!tableCheckError) {
            const profileInsert = await supabase.from('profiles').insert({
              id: data.user.id,
              name,
              email,
              created_at: new Date().toISOString(),
            });
  
            if (profileInsert.error && !profileInsert.error.message?.includes('does not exist')) {
              console.error('Error creating profile:', profileInsert.error);
            }
          } else {
            console.warn('The profiles table does not exist yet. Please run the SQL migrations.');
          }
        } catch (profileError) {
          console.error('Error creating profile:', profileError);
        }
      } catch (profileError) {
        console.error('Error creating profile:', profileError);
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
    return false;
  }

  try {
    // Check if the profiles table exists first
    try {
      const { error: tableCheckError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
        
      if (tableCheckError && tableCheckError.message?.includes('does not exist')) {
        console.warn('The profiles table does not exist yet. Please run the SQL migrations.');
        toast.error('Cannot update profile: database tables not set up.');
        return false;
      }
      
      // Using explicit error handling since we don't have proper types yet
      const result = await supabase
        .from('profiles')
        .update(data)
        .eq('id', userId);
  
      if (result.error) {
        throw result.error;
      }
  
      toast.success('Profile updated successfully');
      return true;
    } catch (error: any) {
      if (error.message?.includes('does not exist')) {
        console.warn('The profiles table does not exist yet. Please run the SQL migrations.');
        toast.error('Cannot update profile: database tables not set up.');
        return false;
      }
      toast.error(error.message || 'Error updating profile');
      throw error;
    }
  } catch (error: any) {
    toast.error(error.message || 'Error updating profile');
    return false;
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
