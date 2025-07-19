
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { getCurrentSession } from './authService';

export interface MutualMatch {
  id: string;
  user1_id: string;
  user2_id: string;
  user1_item_id: string;
  user2_item_id: string;
  created_at: string;
}

export interface MatchResult {
  isMatch: boolean;
  matchData?: {
    otherUserId: string;
    otherUserItemId: string;
    myItemId: string;
  };
}

// Check if there's a mutual match when current user likes an item
export const checkForMutualMatch = async (currentUserId: string, likedItemId: string): Promise<MatchResult> => {
  if (!isSupabaseConfigured()) {
    return { isMatch: false };
  }

  try {
    console.log('DEBUG: Checking for mutual match', { currentUserId, likedItemId });
    
    // First, get the owner of the liked item
    const { data: likedItem, error: itemError } = await supabase
      .from('items')
      .select('user_id')
      .eq('id', likedItemId)
      .single();

    if (itemError || !likedItem) {
      console.error('Error fetching liked item:', itemError);
      return { isMatch: false };
    }

    const otherUserId = likedItem.user_id;
    console.log('DEBUG: Other user ID:', otherUserId);

    // Check if the other user has liked any of the current user's items
    const { data: mutualLikes, error: likesError } = await supabase
      .from('liked_items')
      .select(`
        item_id,
        items!inner(user_id)
      `)
      .eq('user_id', otherUserId)
      .eq('items.user_id', currentUserId);

    console.log('DEBUG: Mutual likes query result:', { mutualLikes, likesError });
    console.log('DEBUG: Query details - Looking for likes by user:', otherUserId, 'on items owned by:', currentUserId);

    if (likesError) {
      console.error('Error checking mutual likes:', likesError);
      return { isMatch: false };
    }

    if (mutualLikes && mutualLikes.length > 0) {
      // We have a mutual match! Return the details
      const myItemId = mutualLikes[0].item_id;
      
      console.log('DEBUG: Found mutual match!', {
        otherUserId,
        otherUserItemId: likedItemId,
        myItemId
      });
      
      return {
        isMatch: true,
        matchData: {
          otherUserId,
          otherUserItemId: likedItemId,
          myItemId
        }
      };
    }

    console.log('DEBUG: No mutual match found');
    return { isMatch: false };
  } catch (error) {
    console.error('Error in checkForMutualMatch:', error);
    return { isMatch: false };
  }
};

// Create a confirmed match record
export const createMatch = async (
  user1Id: string,
  user2Id: string,
  user1ItemId: string,
  user2ItemId: string
): Promise<MutualMatch | null> => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    // Check if match already exists (in either direction)
    const { data: existingMatch } = await supabase
      .from('matches')
      .select('*')
      .or(`and(user1_id.eq.${user1Id},user2_id.eq.${user2Id}),and(user1_id.eq.${user2Id},user2_id.eq.${user1Id})`);

    if (existingMatch && existingMatch.length > 0) {
      return existingMatch[0];
    }

    // Create new match
    const { data, error } = await supabase
      .from('matches')
      .insert({
        user1_id: user1Id,
        user2_id: user2Id,
        user1_item_id: user1ItemId,
        user2_item_id: user2ItemId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating match:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createMatch:', error);
    return null;
  }
};

// Get all confirmed matches for a user
export const getMatches = async (userId?: string): Promise<MutualMatch[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const session = await getCurrentSession();
    const currentUserId = userId || session?.user?.id;
    
    if (!currentUserId) {
      return [];
    }

    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching matches:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getMatches:', error);
    return [];
  }
};

// Check if two users have a confirmed match
export const hasConfirmedMatch = async (userId1: string, userId2: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('matches')
      .select('id')
      .or(`and(user1_id.eq.${userId1},user2_id.eq.${userId2}),and(user1_id.eq.${userId2},user2_id.eq.${userId1})`)
      .maybeSingle();

    if (error) {
      console.error('Error checking confirmed match:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error in hasConfirmedMatch:', error);
    return false;
  }
};
