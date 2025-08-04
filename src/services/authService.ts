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
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          name: name
        }
      }
    });

    if (error) {
      throw error;
    }

    if (data.user) {
      // The database trigger will automatically create the profile with the correct name
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

// New function to create an item (used for duplication and posting)
export const createItem = async (item: {
  name: string;
  description?: string;
  image_url?: string;
  image_urls?: string[];
  category?: string;
  condition?: string;
  tags?: string[];
  looking_for_categories?: string[];
  looking_for_conditions?: string[];
  looking_for_description?: string;
  price_range_min?: number;
  price_range_max?: number;
  status?: 'draft' | 'published';
}, isDraft: boolean = false) => {
  if (!isSupabaseConfigured()) {
    toast.error('Supabase is not configured. Please add environment variables.');
    return null;
  }

  try {
    const session = await getCurrentSession();
    if (!session?.user) {
      toast.error('You must be logged in to create an item.');
      return null;
    }

    const itemToInsert = {
      ...item,
      user_id: session.user.id,
      status: isDraft ? 'draft' : (item.status || 'published'),
      has_been_edited: false, // Set to false for new duplicated items
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('🔄 CREATING ITEM - Inserting item to database:', itemToInsert);

    const { data, error } = await supabase
      .from('items')
      .insert(itemToInsert)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating item:', error);
      toast.error(error.message || 'Error creating item');
      return null;
    }

    return data.id;
  } catch (error: any) {
    console.error('Error creating item:', error);
    toast.error(error.message || 'Error creating item');
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
export const likeItem = async (itemId: string, selectedItemId?: string) => {
  console.log('DEBUG: likeItem function called with itemId:', itemId, 'selectedItemId:', selectedItemId);
  
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
    console.log('DEBUG: Inserting new like with selectedItemId:', selectedItemId);
    const { error } = await supabase
      .from('liked_items')
      .insert({
        user_id: currentUserId,
        item_id: itemId,
        my_item_id: selectedItemId || null // Include the specific item this like is from
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
    console.log('🔍 MUTUAL MATCH CHECK:', { currentUserId, itemId, selectedItemId, itemOwner: 'will be determined' });
    const matchResult = await checkForMutualMatch(currentUserId, itemId, selectedItemId);
    
    console.log('🔍 MUTUAL MATCH RESULT:', {
      isMatch: matchResult.isMatch,
      matchData: matchResult.matchData,
      willCreateConversation: matchResult.isMatch && matchResult.matchData ? 'YES' : 'NO'
    });
    
    if (matchResult.isMatch && matchResult.matchData) {
      console.log('🚀 CREATING MUTUAL MATCH & CONVERSATION!', {
        currentUserId,
        otherUserId: matchResult.matchData.otherUserId,
        myItemId: matchResult.matchData.myItemId,
        otherUserItemId: matchResult.matchData.otherUserItemId
      });
      
      // Create the confirmed match
      const match = await createMatch(
        currentUserId,
        matchResult.matchData.otherUserId,
        matchResult.matchData.myItemId,
        matchResult.matchData.otherUserItemId
      );

      if (match) {
        console.log('✅ MUTUAL MATCH CREATED:', match);
        
        // Create trade conversation for the mutual match
        const tradeConversation = await createTradeConversation(
          currentUserId,
          matchResult.matchData.otherUserId,
          matchResult.matchData.myItemId,
          matchResult.matchData.otherUserItemId
        );
        
        console.log('✅ TRADE CONVERSATION CREATED:', tradeConversation);

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

// New function to unlike an item for a specific item pair
export const unlikeItem = async (itemId: string, selectedItemId?: string) => {
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

    let query = supabase
      .from('liked_items')
      .delete()
      .eq('user_id', session.user.id)
      .eq('item_id', itemId);

    if (selectedItemId) {
      query = query.eq('my_item_id', selectedItemId);
    } else {
      query = query.is('my_item_id', null);
    }

    const { error } = await query;

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

// New function to check if an item is liked by the current user for a specific item pair
export const isItemLiked = async (itemId: string, selectedItemId?: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    const session = await getCurrentSession();
    if (!session?.user) {
      return false;
    }

    console.log('🔍 CHECKING LIKED STATUS:', {
      itemId,
      selectedItemId,
      currentUserId: session.user.id,
      currentUserEmail: session.user.email
    });

    let query = supabase
      .from('liked_items')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('item_id', itemId);

    if (selectedItemId) {
      // Check for likes specific to this item pair OR global likes (where my_item_id is null)
      query = query.or(`my_item_id.eq.${selectedItemId},my_item_id.is.null`);
    } else {
      // If no specific item, only check global likes
      query = query.is('my_item_id', null);
    }

    const { data, error } = await query.maybeSingle();

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

// Function to submit a review for a trade/marketplace item
export const submitReview = async (reviewData: {
  rating: number;
  comment: string;
  reviewee_id: string;
  trade_conversation_id?: string;
  market_id?: string;
  vendor_id?: string;
}) => {
  if (!isSupabaseConfigured()) {
    toast.error('Supabase is not configured. Please add environment variables.');
    return false;
  }

  try {
    const session = await getCurrentSession();
    if (!session?.user) {
      toast.error('You must be logged in to submit a review.');
      return false;
    }

    const { error } = await supabase
      .from('reviews')
      .insert({
        user_id: session.user.id,
        reviewer_id: session.user.id,
        reviewee_id: reviewData.reviewee_id,
        rating: reviewData.rating,
        comment: reviewData.comment,
        trade_conversation_id: reviewData.trade_conversation_id,
        market_id: reviewData.market_id,
        vendor_id: reviewData.vendor_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error submitting review:', error);
      toast.error('Error submitting review');
      return false;
    }

    toast.success('Review submitted successfully!');
    return true;
  } catch (error: any) {
    console.error('Error submitting review:', error);
    toast.error(error.message || 'Error submitting review');
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

// Function to fetch a single item by ID
export const fetchItemById = async (itemId: string) => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', itemId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching item:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching item:', error);
    return null;
  }
};

// Function to update an existing item
export const updateItem = async (itemId: string, item: Partial<Item> & {
  lookingForCategories?: string[];
  lookingForConditions?: string[];
  lookingForDescription?: string;
  priceRangeMin?: number;
  priceRangeMax?: number;
  looking_for_price_ranges?: string[];
  imageUrls?: string[];
  status?: 'draft' | 'published';
}) => {
  if (!isSupabaseConfigured()) {
    toast.error('Supabase is not configured. Please add environment variables.');
    return null;
  }

  try {
    const session = await getCurrentSession();
    if (!session?.user) {
      toast.error('You must be logged in to update an item.');
      return null;
    }

    console.log('🔧 UPDATE ITEM DEBUG:', {
      itemId,
      currentUserId: session.user.id,
      itemData: item
    });

    // Check if this is just a status change (publishing) vs actual content changes
    const isOnlyStatusChange = Object.keys(item).length === 1 && item.status !== undefined;
    
    const updateData = {
      name: item.name,
      description: item.description,
      image_url: item.image_url,
      image_urls: item.imageUrls,
      category: item.category,
      condition: item.condition,
      tags: item.tags,
      looking_for_categories: item.lookingForCategories,
      looking_for_conditions: item.lookingForConditions,
      looking_for_description: item.lookingForDescription,
      price_range_min: item.priceRangeMin,
      price_range_max: item.priceRangeMax,
      looking_for_price_ranges: item.looking_for_price_ranges,
      status: item.status,
      // Only mark as edited if actual content changes were made, not just status changes
      ...(isOnlyStatusChange ? {} : { has_been_edited: true }),
      updated_at: new Date().toISOString()
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    console.log('🔧 UPDATE DATA:', updateData);

    const { data, error } = await supabase
      .from('items')
      .update(updateData)
      .eq('id', itemId)
      .eq('user_id', session.user.id) // Ensure user can only update their own items
      .select('*')
      .single();

    console.log('🔧 UPDATE RESULT:', { data, error });

    if (error) {
      console.error('Error updating item:', error);
      toast.error(error.message || 'Error updating item');
      return null;
    }

    
    return data;
  } catch (error: any) {
    console.error('Error updating item:', error);
    toast.error(error.message || 'Error updating item');
    return null;
  }
};

// Function to delete an item
export const deleteItem = async (itemId: string) => {
  if (!isSupabaseConfigured()) {
    toast.error('Supabase is not configured. Please add environment variables.');
    return false;
  }

  try {
    const session = await getCurrentSession();
    if (!session?.user) {
      toast.error('You must be logged in to delete an item.');
      return false;
    }

    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', session.user.id); // Ensure user can only delete their own items

    if (error) {
      console.error('Error deleting item:', error);
      toast.error('Error deleting item');
      return false;
    }

    toast.success('Item deleted successfully!');
    return true;
  } catch (error: any) {
    console.error('Error deleting item:', error);
    toast.error(error.message || 'Error deleting item');
    return false;
  }
};

// Function to hide an item
export const hideItem = async (itemId: string) => {
  if (!isSupabaseConfigured()) {
    toast.error('Supabase is not configured. Please add environment variables.');
    return false;
  }

  try {
    const session = await getCurrentSession();
    if (!session?.user) {
      toast.error('You must be logged in to hide an item.');
      return false;
    }

    const { error } = await supabase
      .from('items')
      .update({ 
        is_hidden: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId)
      .eq('user_id', session.user.id); // Ensure user can only hide their own items

    if (error) {
      console.error('Error hiding item:', error);
      toast.error('Error hiding item');
      return false;
    }

    toast.success('Item hidden successfully!');
    return true;
  } catch (error: any) {
    console.error('Error hiding item:', error);
    toast.error(error.message || 'Error hiding item');
    return false;
  }
};

// Function to unhide an item
export const unhideItem = async (itemId: string) => {
  if (!isSupabaseConfigured()) {
    toast.error('Supabase is not configured. Please add environment variables.');
    return false;
  }

  try {
    const session = await getCurrentSession();
    if (!session?.user) {
      toast.error('You must be logged in to unhide an item.');
      return false;
    }

    const { error } = await supabase
      .from('items')
      .update({ 
        is_hidden: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId)
      .eq('user_id', session.user.id); // Ensure user can only unhide their own items

    if (error) {
      console.error('Error unhiding item:', error);
      toast.error('Error unhiding item');
      return false;
    }

    toast.success('Item is now visible!');
    return true;
  } catch (error: any) {
    console.error('Error unhiding item:', error);
    toast.error(error.message || 'Error unhiding item');
    return false;
  }
};