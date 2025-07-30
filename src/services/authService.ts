import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { checkForMutualMatch, createMatch } from './mutualMatchingService';
import { createTradeConversation } from './tradeService';
import { createMatchNotification } from './notificationService';

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
        // Try to create a profile record with name as default username
        const profileInsert = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username: name, // Set username to the provided name
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

    console.log('Inserting item to database:', itemToInsert);

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

// New function to handle avatar upload specifically
export const uploadAvatarImage = async (file: File): Promise<string | null> => {
  if (!isSupabaseConfigured()) {
    toast.error('Supabase is not configured. Please add environment variables.');
    return null;
  }

  try {
    const session = await getCurrentSession();
    if (!session?.user) {
      toast.error('You must be logged in to upload an avatar.');
      return null;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${session.user.id}-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${session.user.id}/${fileName}`;

    // Upload the file to the avatars bucket
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      toast.error('Error uploading avatar');
      return null;
    }

    // Get the public URL
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return data?.publicUrl || null;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    toast.error('Error uploading avatar');
    return null;
  }
};
// New function to like an item with mutual matching logic
export const likeItem = async (itemId: string) => {
  console.log('DEBUG: likeItem function called with itemId:', itemId);
  
  if (!isSupabaseConfigured()) {
    console.log('DEBUG: Supabase not configured');
    toast.error('Supabase is not configured. Please add environment variables.');
    return false;
  }

  try {
    console.log('DEBUG: Getting current session...');
    const session = await getCurrentSession();
    console.log('DEBUG: Session:', session?.user?.id);
    
    if (!session?.user) {
      console.log('DEBUG: No user session found');
      toast.error('You must be logged in to like an item.');
      return false;
    }

    const currentUserId = session.user.id;
    console.log('DEBUG: Current user ID:', currentUserId);

    // Skip the existing like check since we allow re-liking items for different matches
    console.log('DEBUG: Inserting new like (allowing duplicates for different matches)...');
    const { error } = await supabase
      .from('liked_items')
      .insert({
        user_id: currentUserId,
        item_id: itemId
      });

    console.log('DEBUG: Insert like result:', { error });

    if (error) {
      // Handle duplicate like gracefully
      if (error.code === '23505') {
        console.log('DEBUG: Like already exists, but checking for mutual match anyway...');
      } else {
        console.error('Error liking item:', error);
        toast.error('Error liking item');
        return false;
      }
    }

    // Check for mutual match
    console.log('DEBUG: About to check mutual match for item:', itemId, 'current user:', currentUserId);
    const matchResult = await checkForMutualMatch(currentUserId, itemId);
    
    if (matchResult.isMatch && matchResult.matchData) {
      // Create the confirmed match
      const match = await createMatch(
        currentUserId,
        matchResult.matchData.otherUserId,
        matchResult.matchData.myItemId,
        matchResult.matchData.otherUserItemId
      );

      if (match) {
        console.log('DEBUG: Creating trade conversation for mutual match:', {
          currentUserId,
          otherUserId: matchResult.matchData.otherUserId,
          myItemId: matchResult.matchData.myItemId,
          otherUserItemId: matchResult.matchData.otherUserItemId
        });
        
        // Create trade conversation for the mutual match
        const tradeConversation = await createTradeConversation(
          currentUserId,
          matchResult.matchData.otherUserId,
          matchResult.matchData.myItemId,
          matchResult.matchData.otherUserItemId
        );
        
        console.log('DEBUG: Trade conversation created:', tradeConversation);

        // Get item names for the notification
        const { data: myItem } = await supabase
          .from('items')
          .select('name')
          .eq('id', matchResult.matchData.myItemId)
          .single();

        const { data: theirItem } = await supabase
          .from('items')
          .select('name')
          .eq('id', matchResult.matchData.otherUserItemId)
          .single();

        // Create notifications for both users
        try {
          await createMatchNotification(
            currentUserId,
            myItem?.name || 'your item',
            theirItem?.name || 'their item',
            matchResult.matchData.otherUserId
          );
          
          await createMatchNotification(
            matchResult.matchData.otherUserId,
            theirItem?.name || 'their item',
            myItem?.name || 'your item',
            currentUserId
          );
        } catch (notificationError) {
          console.error('Error creating match notifications:', notificationError);
          // Don't fail the match if notifications fail
        }

        if (tradeConversation) {
          toast.success(`🎉 It's a match! You both liked each other's items: "${myItem?.name}" ↔ "${theirItem?.name}". A new chat has been created!`);
        } else {
          toast.success(`🎉 It's a match! You both liked each other's items: "${myItem?.name}" ↔ "${theirItem?.name}"`);
        }
        
        return { success: true, isMatch: true, matchData: match, conversationId: tradeConversation?.id };
      }
    } else {
      toast.success('Item liked!');
    }

    return { success: true, isMatch: false };
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
export const updateItem = async (itemId: string, updates: any) => {
  if (!isSupabaseConfigured()) {
    toast.error('Supabase not configured');
    return false;
  }
  try {
    // Make a safe copy of updates, excluding potentially problematic fields
    const safeUpdates = { ...updates };
    
    // Remove fields that might not exist in the database
    if ('looking_for_price_ranges' in safeUpdates) {
      delete safeUpdates.looking_for_price_ranges;
    }
    
    const { error } = await supabase
      .from('items')
      .update({ ...safeUpdates, updated_at: new Date().toISOString() })
      .eq('id', itemId);
    if (error) {
      console.error('Error updating item:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error updating item:', error);
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
      console.error('Error deleting item:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error deleting item:', error);
    toast.error('Failed to delete item');
    return false;
  }
};

// Hide/unhide item functions
export const hideItem = async (itemId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('items')
      .update({ is_hidden: true, updated_at: new Date().toISOString() })
      .eq('id', itemId);

    if (error) {
      toast.error('Error hiding item');
      console.error('Error hiding item:', error);
      return false;
    }
    
    toast.success('Item hidden successfully');
    return true;
  } catch (error) {
    console.error('Error hiding item:', error);
    toast.error('Failed to hide item');
    return false;
  }
};

export const unhideItem = async (itemId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('items')
      .update({ is_hidden: false, updated_at: new Date().toISOString() })
      .eq('id', itemId);

    if (error) {
      toast.error('Error unhiding item');
      console.error('Error unhiding item:', error);
      return false;
    }
    
    toast.success('Item shown successfully');
    return true;
  } catch (error) {
    console.error('Error unhiding item:', error);
    toast.error('Failed to show item');
    return false;
  }
};

// Function to fetch reviews for a user
export const fetchUserReviews = async (userId: string) => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        reviewer_id
      `)
      .eq('reviewee_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }

    // For each review, fetch the reviewer's profile
    const formattedReviews = await Promise.all(
      (data || []).map(async (review) => {
        try {
          const { data: reviewerProfile } = await supabase
            .from('profiles')
            .select('username, name, avatar_url')
            .eq('id', review.reviewer_id)
            .maybeSingle();

          return {
            id: review.id,
            reviewer_id: review.reviewer_id,
            user: reviewerProfile?.username || reviewerProfile?.name || 'Anonymous User',
            avatar_url: reviewerProfile?.avatar_url,
            rating: review.rating,
            comment: review.comment || '',
            date: new Date(review.created_at).toLocaleDateString()
          };
        } catch (profileError) {
          console.error('Error fetching reviewer profile:', profileError);
          return {
            id: review.id,
            reviewer_id: review.reviewer_id,
            user: 'Anonymous User',
            avatar_url: undefined,
            rating: review.rating,
            comment: review.comment || '',
            date: new Date(review.created_at).toLocaleDateString()
          };
        }
      })
    );

    return formattedReviews;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
};
