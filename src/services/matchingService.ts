import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { Item, MatchItem } from '@/types/item';

export const findMatchingItems = async (selectedItem: Item, currentUserId: string, location: string = 'nationwide'): Promise<MatchItem[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    // Get all available and visible items from other users
    let itemsQuery = supabase
      .from('items')
      .select('*')
      .neq('user_id', currentUserId)
      .eq('is_available', true) // Only show available items
      .eq('is_hidden', false); // Only show non-hidden items

    // If location is not nationwide, get user profiles with location filter
    let userIdsToFilter: string[] = [];
    if (location !== 'nationwide') {
      console.log('Debug - Filtering by location:', location);
      console.log('Debug - Getting profiles for location:', location);
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, location')
        .eq('location', location);
      
      console.log('Debug - Found profiles for location:', profiles);
      console.log('Debug - Profiles error:', profilesError);
      
      if (profilesError) {
        console.error('Error fetching profiles by location:', profilesError);
      } else if (profiles && profiles.length > 0) {
        userIdsToFilter = profiles.map(p => p.id);
        console.log('Debug - User IDs to filter by location:', userIdsToFilter);
        itemsQuery = itemsQuery.in('user_id', userIdsToFilter);
      } else {
        // No users in this location, return empty
        console.log('Debug - No users found in location, returning empty array');
        return [];
      }
    } else {
      console.log('Debug - Location is nationwide, no filtering applied');
    }

    const { data: allItems, error: itemsError } = await itemsQuery;

    if (itemsError) {
      console.error('Error fetching items:', itemsError);
      return [];
    }

    if (!allItems || allItems.length === 0) {
      return [];
    }

    // Get items that the current user has already liked (for display purposes only)
    const { data: likedItems, error: likedError } = await supabase
      .from('liked_items')
      .select('item_id')
      .eq('user_id', currentUserId);

    if (likedError) {
      console.error('Error fetching liked items:', likedError);
    }

    // Get items that the current user has rejected
    const { data: rejectedItems, error: rejectedError } = await supabase
      .from('rejections')
      .select('item_id')
      .eq('user_id', currentUserId);

    if (rejectedError) {
      console.error('Error fetching rejected items:', rejectedError);
    }

    // Get items where the owner has rejected the current user's selected item
    const { data: ownerRejections, error: ownerRejectionsError } = await supabase
      .from('rejections')
      .select('user_id')
      .eq('item_id', selectedItem.id);

    if (ownerRejectionsError) {
      console.error('Error fetching owner rejections:', ownerRejectionsError);
    }

    console.log('Debug - Current user:', currentUserId);
    console.log('Debug - Liked items:', likedItems);
    console.log('Debug - Total items before filtering:', allItems.length);

    const likedItemIds = new Set(likedItems?.map(item => item.item_id) || []);
    console.log('Debug - Liked item IDs:', Array.from(likedItemIds));

    // Filter out rejected items from both sides
    const rejectedItemIds = new Set(rejectedItems?.map(item => item.item_id) || []);
    const rejectedByOwnerIds = new Set(ownerRejections?.map(item => item.user_id) || []);
    
    console.log('Debug - Rejected item IDs:', Array.from(rejectedItemIds));
    console.log('Debug - Users who rejected current item:', Array.from(rejectedByOwnerIds));

    // Filter out items that:
    // 1. Current user has rejected
    // 2. Item owners who have rejected the current user's selected item
    const availableItems = allItems.filter(item => 
      !rejectedItemIds.has(item.id) && // Not rejected by current user
      !rejectedByOwnerIds.has(item.user_id) // Owner hasn't rejected current user's item
    );
    
    console.log('Debug - Available items after filtering rejections:', availableItems.length);

    const matches: Array<MatchItem & { matchScore: number }> = [];

    // Get unique user IDs to fetch profiles in batch
    const userIds = [...new Set(availableItems.map(item => item.user_id))];
    
    // Fetch all user profiles in one query
    const { data: userProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, username, avatar_url')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching user profiles:', profilesError);
    }

    // Create a map for quick profile lookup
    const profileMap = new Map();
    if (userProfiles) {
      userProfiles.forEach(profile => {
        profileMap.set(profile.id, profile);
      });
    }

    for (const otherItem of availableItems) {
      let matchScore = 0;
      let isMatch = false;

      // Check if this other item matches what the current user is looking for
      if (selectedItem.lookingForCategories && selectedItem.lookingForCategories.length > 0) {
        if (selectedItem.lookingForCategories.includes(otherItem.category)) {
          matchScore += 3; // High score for category match
          isMatch = true;
        }
      }

      if (selectedItem.lookingForConditions && selectedItem.lookingForConditions.length > 0) {
        if (selectedItem.lookingForConditions.includes(otherItem.condition)) {
          matchScore += 2; // Medium score for condition match
          isMatch = true;
        }
      }

      // Check keyword matching in description
      if (selectedItem.lookingForDescription && otherItem.name) {
        const lookingForKeywords = selectedItem.lookingForDescription.toLowerCase().split(' ');
        const itemName = otherItem.name.toLowerCase();
        const itemDescription = (otherItem.description || '').toLowerCase();
        
        for (const keyword of lookingForKeywords) {
          if (keyword.length > 2 && (itemName.includes(keyword) || itemDescription.includes(keyword))) {
            matchScore += 1; // Lower score for keyword matches
            isMatch = true;
            break;
          }
        }
      }

      // For mutual matching: Check if the other user is looking for what we're offering
      if (otherItem.looking_for_categories && otherItem.looking_for_categories.length > 0) {
        if (otherItem.looking_for_categories.includes(selectedItem.category)) {
          matchScore += 5; // Very high score for mutual interest
          isMatch = true;
        }
      }

      if (otherItem.looking_for_conditions && otherItem.looking_for_conditions.length > 0) {
        if (otherItem.looking_for_conditions.includes(selectedItem.condition)) {
          matchScore += 3; // High score for mutual condition interest
          isMatch = true;
        }
      }

      // Check if other user's looking for description matches our item
      if (otherItem.looking_for_description && selectedItem.name) {
        const otherLookingForKeywords = otherItem.looking_for_description.toLowerCase().split(' ');
        const ourItemName = selectedItem.name.toLowerCase();
        const ourItemDescription = (selectedItem.description || '').toLowerCase();
        
        for (const keyword of otherLookingForKeywords) {
          if (keyword.length > 2 && (ourItemName.includes(keyword) || ourItemDescription.includes(keyword))) {
            matchScore += 2; // Medium score for mutual keyword interest
            isMatch = true;
            break;
          }
        }
      }

      // If there's any match, add to results
      if (isMatch) {
        const userProfile = profileMap.get(otherItem.user_id);
        matches.push({
          id: otherItem.id,
          name: otherItem.name,
          image: otherItem.image_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f",
          category: otherItem.category,
          condition: otherItem.condition,
          description: otherItem.description,
          tags: otherItem.tags,
          priceRangeMin: otherItem.price_range_min,
          priceRangeMax: otherItem.price_range_max,
          liked: false, // Will be determined by like status
          user_id: otherItem.user_id, // Include user_id for profile navigation
          userProfile: userProfile ? {
            name: userProfile.name,
            username: userProfile.username,
            avatar_url: userProfile.avatar_url
          } : undefined,
          matchScore // Add match score for potential sorting
        });
      }
    }

    // Sort by match score (highest first) and limit results
    return matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20)
      .map(({ matchScore, ...item }) => item); // Remove matchScore from final result

  } catch (error) {
    console.error('Error in findMatchingItems:', error);
    return [];
  }
};