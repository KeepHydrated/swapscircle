import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type User = {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
};

export type Item = {
  id?: string;
  name: string;
  description?: string;
  image_url?: string;
  category?: string;
  condition?: string;
  tags?: string[];
  user_id?: string;
};

export const fetchUserProfile = async (userId: string) => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    // Using try-catch since the table might not exist yet
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
        // Try to create a profile record
        const profileInsert = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name,
            email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileInsert.error) {
          console.error('Error creating profile:', profileInsert.error);
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
    const { error } = await supabase
      .from('profiles')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      throw error;
    }

    toast.success('Profile updated successfully');
    return true;
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

// New function to post an item with preferences
export const postItem = async (item: Item & {
  lookingForCategories?: string[];
  lookingForConditions?: string[];
  lookingForDescription?: string;
  priceRangeMin?: number;
  priceRangeMax?: number;
}) => {
  if (!isSupabaseConfigured()) {
    toast.error('Supabase is not configured. Please add environment variables.');
    return null;
  }

  try {
    const session = await getCurrentSession();
    if (!session?.user) {
      toast.error('You must be logged in to post an item.');
      return null;
    }

    const itemToInsert = {
      name: item.name,
      description: item.description,
      image_url: item.image_url,
      category: item.category,
      condition: item.condition,
      tags: item.tags,
      looking_for_categories: item.lookingForCategories,
      looking_for_conditions: item.lookingForConditions,
      looking_for_description: item.lookingForDescription,
      price_range_min: item.priceRangeMin,
      price_range_max: item.priceRangeMax,
      user_id: session.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('items')
      .insert(itemToInsert)
      .select('*')
      .single();

    if (error) {
      console.error('Error posting item:', error);
      toast.error(error.message || 'Error posting item');
      return null;
    }

    toast.success('Item posted successfully!');
    return data;
  } catch (error: any) {
    console.error('Error posting item:', error);
    toast.error(error.message || 'Error posting item');
    return null;
  }
};

// Updated function to handle image upload
export const uploadItemImage = async (file: File): Promise<string | null> => {
  if (!isSupabaseConfigured()) {
    toast.error('Supabase is not configured. Please add environment variables.');
    return null;
  }

  try {
    const session = await getCurrentSession();
    if (!session?.user) {
      toast.error('You must be logged in to upload an image.');
      return null;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${session.user.id}-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${session.user.id}/${fileName}`;

    // Upload the file to the existing bucket
    const { error: uploadError } = await supabase.storage
      .from('item-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      toast.error('Error uploading image');
      return null;
    }

    // Get the public URL
    const { data } = supabase.storage
      .from('item-images')
      .getPublicUrl(filePath);

    return data?.publicUrl || null;
  } catch (error) {
    console.error('Error uploading image:', error);
    toast.error('Error uploading image');
    return null;
  }
};

// New function to like an item
export const likeItem = async (itemId: string) => {
  if (!isSupabaseConfigured()) {
    toast.error('Supabase is not configured. Please add environment variables.');
    return false;
  }

  try {
    const session = await getCurrentSession();
    if (!session?.user) {
      toast.error('You must be logged in to like an item.');
      return false;
    }

    const { error } = await supabase
      .from('liked_items')
      .insert({
        user_id: session.user.id,
        item_id: itemId
      });

    if (error) {
      // Handle duplicate like (user already liked this item)
      if (error.code === '23505') {
        toast.info('Item already liked!');
        return true;
      }
      console.error('Error liking item:', error);
      toast.error('Error liking item');
      return false;
    }

    toast.success('Item liked!');
    return true;
  } catch (error: any) {
    console.error('Error liking item:', error);
    toast.error(error.message || 'Error liking item');
    return false;
  }
};

// New function to unlike an item
export const unlikeItem = async (itemId: string) => {
  if (!isSupabaseConfigured()) {
    toast.error('Supabase is not configured. Please add environment variables.');
    return false;
  }

  try {
    const session = await getCurrentSession();
    if (!session?.user) {
      toast.error('You must be logged in to unlike an item.');
      return false;
    }

    const { error } = await supabase
      .from('liked_items')
      .delete()
      .eq('user_id', session.user.id)
      .eq('item_id', itemId);

    if (error) {
      console.error('Error unliking item:', error);
      toast.error('Error unliking item');
      return false;
    }

    toast.success('Item unliked!');
    return true;
  } catch (error: any) {
    console.error('Error unliking item:', error);
    toast.error(error.message || 'Error unliking item');
    return false;
  }
};

// New function to fetch liked items for a user
export const fetchLikedItems = async () => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const session = await getCurrentSession();
    if (!session?.user) {
      return [];
    }

    const { data, error } = await supabase
      .from('liked_items')
      .select(`
        id,
        created_at,
        items (
          id,
          name,
          description,
          image_url,
          category,
          condition,
          tags
        )
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching liked items:', error);
      toast.error('Error loading liked items');
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching liked items:', error);
    return [];
  }
};

// New function to check if an item is liked by the current user
export const isItemLiked = async (itemId: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    const session = await getCurrentSession();
    if (!session?.user) {
      return false;
    }

    const { data, error } = await supabase
      .from('liked_items')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('item_id', itemId)
      .maybeSingle();

    if (error) {
      console.error('Error checking if item is liked:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking if item is liked:', error);
    return false;
  }
};

// Fetch item by ID from DB (NEW)
export const fetchItemById = async (itemId: string) => {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', itemId)
      .maybeSingle();
    if (error) {
      console.error('Error fetching item by id:', error);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Error fetching item by id:', error);
    return null;
  }
};

// Update item by ID (NEW)
export const updateItem = async (itemId: string, updates: Partial<Item>) => {
  if (!isSupabaseConfigured()) {
    toast.error('Supabase not configured');
    return false;
  }
  try {
    const { error } = await supabase
      .from('items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', itemId);
    if (error) {
      toast.error('Failed to update item');
      return false;
    }
    toast.success('Item updated!');
    return true;
  } catch (error) {
    toast.error('Failed to update item');
    return false;
  }
};

// Delete item by ID (NEW)
export const deleteItem = async (itemId: string) => {
  if (!isSupabaseConfigured()) {
    toast.error('Supabase not configured');
    return false;
  }
  try {
    const { error } = await supabase.from('items').delete().eq('id', itemId);
    if (error) {
      toast.error('Error deleting item');
      return false;
    }
    toast.success('Item deleted!');
    return true;
  } catch (error) {
    toast.error('Error deleting item');
    return false;
  }
};
