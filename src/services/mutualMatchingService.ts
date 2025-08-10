
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
export const checkForMutualMatch = async (currentUserId: string, likedItemId: string, selectedItemId?: string): Promise<MatchResult> => {
  if (!isSupabaseConfigured()) {
    return { isMatch: false };
  }

  try {
    console.log('🔍 MUTUAL MATCH CHECK STARTING');
    console.log('DEBUG: Checking for mutual match', { currentUserId, likedItemId, selectedItemId });
    
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
    console.log('DEBUG: Current user ID:', currentUserId);
    console.log('DEBUG: Liked item ID:', likedItemId);

    // Check if the other user has liked any of the current user's items
    console.log('DEBUG: Query details - Looking for likes by user:', otherUserId, 'on items owned by:', currentUserId);
    
    // Get items to check for mutual likes
    let myItemIds: string[] = [];
    
    if (selectedItemId) {
      // If a specific item is selected (e.g., from homepage), only check that item
      console.log('DEBUG: Using selected item ID for matching:', selectedItemId);
      myItemIds = [selectedItemId];
    } else {
      // Otherwise, check all current user's items
      const { data: myItems, error: myItemsError } = await supabase
        .from('items')
        .select('id, name')
        .eq('user_id', currentUserId);
      
      console.log('DEBUG: My items (owned by current user):', myItems);
      myItemIds = myItems?.map(item => item.id) || [];
    }
    
    console.log('DEBUG: Item IDs to check for mutual likes:', myItemIds);
    
    // Get all items liked by the other user
    const { data: allOtherUserLikes, error: allLikesError } = await supabase
      .from('liked_items')
      .select('item_id')
      .eq('user_id', otherUserId);
      
    console.log('DEBUG: All items liked by other user:', allOtherUserLikes);
    console.log('DEBUG: All likes error:', allLikesError);
    
    // Now find the intersection manually
    const mutualLikes = allOtherUserLikes?.filter(like => myItemIds.includes(like.item_id)) || [];
    const likesError = allLikesError;
      
    console.log('DEBUG: Mutual likes found (manual intersection):', mutualLikes);
    console.log('DEBUG: Detailed comparison:');
    console.log('  - Other user liked items:', allOtherUserLikes?.map(l => l.item_id));
    console.log('  - My items available for liking:', myItemIds);
    console.log('  - Intersection result:', mutualLikes.map(l => l.item_id));
      
    console.log('DEBUG: Mutual likes found (manual intersection):', mutualLikes);
    console.log('DEBUG: Query - Looking for user', otherUserId, 'liking any of my items:', myItemIds);

    console.log('DEBUG: Mutual likes query result:', { mutualLikes, likesError });

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
        myItemId,
        totalMutualLikes: mutualLikes.length
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

export const createMatch = async (
  user1Id: string,
  user2Id: string,
  user1ItemId: string,
  user2ItemId: string
): Promise<MutualMatch | null> => {
  if (!isSupabaseConfigured()) {
    console.error('🚨 CREATE MATCH: Supabase not configured');
    return null;
  }

  try {
    console.error('🚨 CREATE MATCH: Starting match creation process');
    console.error('🚨 CREATE MATCH: Parameters:', { user1Id, user2Id, user1ItemId, user2ItemId });

    // Check if match already exists for these specific items (in either direction)
    console.error('🚨 CREATE MATCH: Checking for existing match with specific items...');
    const { data: existingMatch, error: existingError } = await supabase
      .from('mutual_matches')
      .select('*')
      .or(`and(user1_id.eq.${user1Id},user2_id.eq.${user2Id},user1_item_id.eq.${user1ItemId},user2_item_id.eq.${user2ItemId}),and(user1_id.eq.${user2Id},user2_id.eq.${user1Id},user1_item_id.eq.${user2ItemId},user2_item_id.eq.${user1ItemId})`);

    console.error('🚨 CREATE MATCH: Existing match check result:', { existingMatch, existingError });

    if (existingError) {
      console.error('🚨 CREATE MATCH: Error checking existing match:', existingError);
      return null;
    }

    if (existingMatch && existingMatch.length > 0) {
      console.error('🚨 CREATE MATCH: Match already exists for these specific items, returning existing:', existingMatch[0]);
      return existingMatch[0];
    }

    console.error('🚨 CREATE MATCH: No existing match found, creating new one...');

    // Create new match
    const insertData = {
      user1_id: user1Id,
      user2_id: user2Id,
      user1_item_id: user1ItemId,
      user2_item_id: user2ItemId
    };

    console.error('🚨 CREATE MATCH: Insert data:', insertData);

    const { data, error } = await supabase
      .from('mutual_matches')
      .insert(insertData)
      .select()
      .single();

    console.error('🚨 CREATE MATCH: Insert result:', { data, error });

    if (error) {
      console.error('🚨 CREATE MATCH: Error creating match:', error);
      return null;
    }

    console.error('🚨 CREATE MATCH: Match created successfully!', data);
    return data;
  } catch (error) {
    console.error('🚨 CREATE MATCH: Exception in createMatch:', error);
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
      .from('mutual_matches')
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
      .from('mutual_matches')
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
