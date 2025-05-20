
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create supabase client only if credentials are properly set
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseKey);
};

// Create a dummy client or real client based on configuration
const dummyUrl = 'https://placeholder-url.supabase.co';
const dummyKey = 'placeholder-key';

export const supabase = createClient(
  supabaseUrl || dummyUrl,
  supabaseKey || dummyKey
);

// This function should be used to check if operations should proceed
export const getSupabaseClient = () => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase is not configured. Some features may not work.');
    return null;
  }
  return supabase;
};
