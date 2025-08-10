import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { Item, MatchItem } from '@/types/item';
import { blockingService } from './blockingService';

// Helper function to calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in miles
};

// Helper function to parse location string into coordinates
const parseLocation = (locationString: string): { lat: number; lng: number } | null => {
  if (!locationString || typeof locationString !== 'string') return null;
  
  const parts = locationString.split(',');
  if (parts.length !== 2) return null;
  
  const lat = parseFloat(parts[0].trim());
  const lng = parseFloat(parts[1].trim());
  
  if (isNaN(lat) || isNaN(lng)) return null;
  
  return { lat, lng };
};

export const findMatchingItems = async (selectedItem: Item, currentUserId: string, location: string = 'nationwide', perspectiveUserId?: string): Promise<MatchItem[]> => {
  console.log('🔥 MATCHING SERVICE CALLED - START');
  console.log('🔥🔥🔥 UPDATED CODE VERSION - MUTUAL MATCHES FILTER ENABLED 🔥🔥🔥');
  console.log('🔥 Selected item:', selectedItem.id, 'owned by:', selectedItem.user_id);
  console.log('🔥 Current user ID:', currentUserId);
  console.log('🔥 Perspective user ID:', perspectiveUserId);
  
  if (!isSupabaseConfigured()) {
    console.log('🔥 Supabase not configured, returning empty');
    return [];
  }

  try {
    // Get current user for authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('🔥 Error getting user:', userError);
      return [];
    }

    console.log('🔥 MATCHING DEBUG - Auth user:', user.id);
    console.log('🔥 MATCHING DEBUG - Current user param:', currentUserId);
    console.log('🔥 MATCHING DEBUG - Perspective user param:', perspectiveUserId);
    console.log('🔥 MATCHING DEBUG - Selected item owner:', selectedItem.user_id);

    // Use perspectiveUserId if provided (for viewing other's profiles) or currentUserId (default)
    const effectiveUserId = perspectiveUserId || currentUserId;
    
    // Get blocked users from the VIEWING user's perspective (not the perspective user)
    // This ensures when you view your own matches, blocked users are filtered out
    console.log('🔥 BLOCKING QUERY 1 - Getting users blocked BY current user:', currentUserId);
    const { data: blockedData, error: blockedError } = await supabase
      .from('blocked_users')
      .select('blocked_id')
      .eq('blocker_id', currentUserId); // Always use currentUserId for blocking queries
    
    console.log('🔥 BLOCKING QUERY 1 RESULT:', { blockedData, blockedError });
    
    console.log('🔥 BLOCKING QUERY 2 - Getting users who blocked current user:', currentUserId);
    const { data: blockersData, error: blockersError } = await supabase
      .from('blocked_users')
      .select('blocker_id')
      .eq('blocked_id', currentUserId); // Always use currentUserId for blocking queries
    
    console.log('🔥 BLOCKING QUERY 2 RESULT:', { blockersData, blockersError });
    
    const blockedUsers = blockedData?.map(item => item.blocked_id) || [];
    const usersWhoBlockedMe = blockersData?.map(item => item.blocker_id) || [];
    const allBlockedUserIds = [...blockedUsers, ...usersWhoBlockedMe];

    console.log('🔥 BLOCKING DEBUG - Current viewing user:', currentUserId);
    console.log('🔥 BLOCKING DEBUG - Effective user (perspective):', effectiveUserId);
    console.log('🔥 BLOCKING DEBUG - Users blocked by viewing user:', blockedUsers);
    console.log('🔥 BLOCKING DEBUG - Users who blocked viewing user:', usersWhoBlockedMe);
    console.log('🔥 BLOCKING DEBUG - All blocked user IDs:', allBlockedUserIds);
    console.log('🔥 BLOCKING DEBUG - Selected item owner:', selectedItem.user_id);

    // Get all available and visible items from other users - exclude the current user's items
    console.log('Debug - Building query to exclude current user:', currentUserId);
    console.log('Debug - Effective user (perspective):', effectiveUserId);
    
    let itemsQuery = supabase
      .from('items')
      .select('*')
      .not('user_id', 'eq', currentUserId) // ALWAYS exclude the viewing user's items
      .eq('is_available', true) // Only show available items
      .eq('is_hidden', false) // Only show non-hidden items
      .eq('status', 'published'); // Only show published items (not drafts)
    
    // Filter out items from blocked users
    if (allBlockedUserIds.length > 0) {
      itemsQuery = itemsQuery.not('user_id', 'in', `(${allBlockedUserIds.join(',')})`);
    }

    console.log('Debug - Current user ID for exclusion:', currentUserId);
    console.log('Debug - Current user ID type:', typeof currentUserId);

    // If location is not nationwide, filter by GPS radius
    let userIdsToFilter: string[] = [];
    if (location !== 'nationwide' && ['5', '10', '20', '50'].includes(location)) {
      const radiusInMiles = parseInt(location);
      console.log('Debug - Filtering by radius:', radiusInMiles, 'miles');
      
      // Get current user's location
      const { data: currentUserProfile, error: currentUserError } = await supabase
        .from('profiles')
        .select('location')
        .eq('user_id', currentUserId)
        .single();
      
      if (currentUserError || !currentUserProfile?.location) {
        console.log('Debug - Current user has no location set, showing no results');
        return [];
      }
      
      const currentUserCoords = parseLocation(currentUserProfile.location);
      if (!currentUserCoords) {
        console.log('Debug - Current user location could not be parsed, showing no results');
        return [];
      }
      
      console.log('Debug - Current user coordinates:', currentUserCoords);
      
      // Get all profiles with locations to calculate distances
      const { data: allProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, location')
        .not('location', 'is', null)
        .not('user_id', 'eq', currentUserId); // Exclude current user
      
      if (profilesError) {
        console.error('Error fetching profiles for distance calculation:', profilesError);
        return [];
      }
      
      if (!allProfiles || allProfiles.length === 0) {
        console.log('Debug - No users with locations found');
        return [];
      }
      
      // Filter profiles by distance
      const profilesWithinRadius = allProfiles.filter(profile => {
        const profileCoords = parseLocation(profile.location);
        if (!profileCoords) return false;
        
        const distance = calculateDistance(
          currentUserCoords.lat, currentUserCoords.lng,
          profileCoords.lat, profileCoords.lng
        );
        
        const withinRadius = distance <= radiusInMiles;
        console.log(`Debug - Profile ${profile.user_id}: distance=${distance.toFixed(2)} miles, withinRadius=${withinRadius}`);
        return withinRadius;
      });
      
      userIdsToFilter = profilesWithinRadius.map(p => p.user_id);
      console.log('Debug - User IDs within radius:', userIdsToFilter.length);
      
      if (userIdsToFilter.length === 0) {
        console.log('Debug - No users found within radius, returning empty array');
        return [];
      }
      
      itemsQuery = itemsQuery.in('user_id', userIdsToFilter);
    } else {
      console.log('Debug - Location is nationwide or unrecognized, no filtering applied');
    }

    const { data: allItems, error: itemsError } = await itemsQuery;

    console.log('Debug - Items query result:', {
      totalItems: allItems?.length || 0,
      itemsError,
      sampleItems: allItems?.slice(0, 3).map(item => ({
        id: item.id,
        user_id: item.user_id,
        currentUserId,
        isOwn: item.user_id === currentUserId
      }))
    });

    if (itemsError) {
      console.error('Error fetching items:', itemsError);
      return [];
    }

    if (!allItems || allItems.length === 0) {
      console.log('🔍 NO ITEMS FOUND - returning empty array before mutual matches check');
      return [];
    }

    console.log('🔍 FOUND', allItems.length, 'ITEMS - proceeding to mutual matches check');

    // Get items that the current user has already liked (for display purposes only)
    const { data: likedItems, error: likedError } = await supabase
      .from('liked_items')
      .select('item_id')
      .eq('user_id', currentUserId);

    if (likedError) {
      console.error('Error fetching liked items:', likedError);
    }

    // Get items rejected by the current user for this specific item
    const { data: rejectedItems, error: rejectedError } = await supabase
      .from('rejections')
      .select('item_id')
      .eq('user_id', user.id)
      .or(`my_item_id.eq.${selectedItem.id},my_item_id.is.null`); // Include both item-specific and global rejections

    if (rejectedError) {
      console.error('Error fetching rejected items:', rejectedError);
    }

    // Get items where users have rejected the current user's selected item for their items
    const { data: ownerRejections, error: ownerRejectedError } = await supabase
      .from('rejections')
      .select('user_id, my_item_id')
      .eq('item_id', selectedItem.id);

    if (ownerRejectedError) {
      console.error('Error fetching owner rejections:', ownerRejectedError);
    }

    // Get mutual matches to exclude items where users have already matched
    const { data: mutualMatches, error: mutualMatchesError } = await supabase
      .from('mutual_matches')
      .select('user1_id, user2_id, user1_item_id, user2_item_id')
      .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`);

    console.log('🔍 MUTUAL MATCHES QUERY:', {
      currentUserId,
      selectedItemId: selectedItem.id,
      mutualMatches,
      mutualMatchesError
    });

    if (mutualMatchesError) {
      console.error('Error fetching mutual matches:', mutualMatchesError);
    }

    console.log('Debug - Rejected items by current user for selected item:', rejectedItems);
    console.log('Debug - Users who rejected current item:', ownerRejections);
    console.log('Debug - Mutual matches:', mutualMatches);

    const likedItemIds = new Set(likedItems?.map(item => item.item_id) || []);
    console.log('Debug - Liked item IDs:', Array.from(likedItemIds));

    // Create a set of specific items that have mutual matches with the current selected item
    const mutualMatchedItemIds = new Set<string>();
    mutualMatches?.forEach(match => {
      console.log('🔍 CHECKING MATCH:', {
        match,
        currentUserId,
        selectedItemId: selectedItem.id,
        condition1: match.user1_id === currentUserId && match.user1_item_id === selectedItem.id,
        condition2: match.user2_id === currentUserId && match.user2_item_id === selectedItem.id
      });
      
      if (match.user1_id === currentUserId && match.user1_item_id === selectedItem.id) {
        // Current user's selected item matched with user2's item
        mutualMatchedItemIds.add(match.user2_item_id);
        console.log('✅ ADDED user2_item_id to exclude list:', match.user2_item_id);
      } else if (match.user2_id === currentUserId && match.user2_item_id === selectedItem.id) {
        // Current user's selected item matched with user1's item
        mutualMatchedItemIds.add(match.user1_item_id);
        console.log('✅ ADDED user1_item_id to exclude list:', match.user1_item_id);
      }
    });

    console.log('🔍 FINAL MUTUAL MATCHED ITEM IDS:', Array.from(mutualMatchedItemIds));

    // Filter out rejected items from both sides
    const rejectedItemIds = new Set(rejectedItems?.map(item => item.item_id) || []);
    
    // Create a map of rejections: user_id -> Set of item_ids they rejected us for
    const rejectedByOwnerMap = new Map<string, Set<string>>();
    ownerRejections?.forEach(rejection => {
      if (!rejectedByOwnerMap.has(rejection.user_id)) {
        rejectedByOwnerMap.set(rejection.user_id, new Set());
      }
      if (rejection.my_item_id) {
        rejectedByOwnerMap.get(rejection.user_id)!.add(rejection.my_item_id);
      } else {
        // Global rejection - mark with special key
        rejectedByOwnerMap.get(rejection.user_id)!.add('__GLOBAL__');
      }
    });

    console.log('Debug - Rejected item IDs (by current user):', Array.from(rejectedItemIds));
    console.log('Debug - Rejection map (by owners):', rejectedByOwnerMap);
    console.log('Debug - Mutual matched item IDs for selected item:', Array.from(mutualMatchedItemIds));

    // Filter out items that:
    // 1. Current user has rejected for this specific item
    // 2. Item owners who have rejected the current user's selected item for their specific items
    // 3. Items where bidirectional blocking exists
    // 4. Specific items that have already mutual matched with the current selected item
    const availableItems = allItems.filter(item => {
      // 1. Items rejected by the current user for this specific item or globally
      const isRejectedByCurrentUser = rejectedItemIds.has(item.id);
      
      // 2. Item owners who have rejected the current user's selected item for this specific item or globally
      const ownerRejections = rejectedByOwnerMap.get(item.user_id);
      const ownerRejectedCurrentItem = ownerRejections && 
        (ownerRejections.has(selectedItem.id) || ownerRejections.has('__GLOBAL__'));
      
      // 3. Don't show user's own items
      const isMyOwnItem = item.user_id === user.id;
      
      // 4. Don't show items from the same user as selected item (but this should be rare)
      const isSameUser = item.user_id === selectedItem.user_id;

      // 5. Don't show items if there's bidirectional blocking
      const isBlockedUser = allBlockedUserIds.includes(item.user_id);

      // 6. Don't show specific items that have already mutual matched with the current selected item
      const hasItemSpecificMutualMatch = mutualMatchedItemIds.has(item.id);

      console.log(`🔍 FILTER DEBUG - Item ${item.id} (user: ${item.user_id}): rejected=${isRejectedByCurrentUser}, ownerRejected=${!!ownerRejectedCurrentItem}, isMyOwnItem=${isMyOwnItem}, isBlockedUser=${isBlockedUser}, hasItemSpecificMutualMatch=${hasItemSpecificMutualMatch}`);

      // Enhanced safety check with multiple comparison methods
      const isSameUserAsSelected = item.user_id === selectedItem.user_id || 
                        (item.user_id && selectedItem.user_id && item.user_id.toString().trim() === selectedItem.user_id.toString().trim());

      // Include items that are:
      // - NOT rejected by current user for this specific item
      // - NOT from owners who rejected current user's item for this specific item  
      // - NOT the user's own items
      // - NOT from the same user as the selected item
      // - NOT from blocked/blocking users
      // - NOT specific items that have already mutual matched with the current selected item
      return !isRejectedByCurrentUser && !ownerRejectedCurrentItem && !isMyOwnItem && !isSameUserAsSelected && !isBlockedUser && !hasItemSpecificMutualMatch;
    });
    
    console.log('Debug - Available items after filtering rejections:', availableItems.length);

    const matches: Array<MatchItem & { matchScore: number; created_at?: string }> = [];

    // Get unique user IDs to fetch profiles in batch
    const userIds = [...new Set(availableItems.map(item => item.user_id))];
    
    // Fetch all user profiles in one query
    const { data: userProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, username, avatar_url')
      .in('id', userIds);

    console.log('🔍 PROFILE FETCH DEBUG:', {
      userIds,
      userProfiles,
      profilesError,
      profileCount: userProfiles?.length
    });

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

      // BIDIRECTIONAL MATCHING: Check both directions for interest
      
      // Direction 1: Does the other item match what the current user is looking for?
      let currentUserInterested = false;
      
      if (selectedItem.looking_for_categories && selectedItem.looking_for_categories.length > 0) {
        if (selectedItem.looking_for_categories.includes(otherItem.category)) {
          matchScore += 3;
          currentUserInterested = true;
        }
      }

      if (selectedItem.looking_for_conditions && selectedItem.looking_for_conditions.length > 0) {
        if (selectedItem.looking_for_conditions.includes(otherItem.condition)) {
          matchScore += 2;
          currentUserInterested = true;
        }
      }

      // Check keyword matching in description
      if (selectedItem.looking_for_description && otherItem.name) {
        const lookingForKeywords = selectedItem.looking_for_description.toLowerCase().split(' ');
        const itemName = otherItem.name.toLowerCase();
        const itemDescription = (otherItem.description || '').toLowerCase();
        
        for (const keyword of lookingForKeywords) {
          if (keyword.length > 2 && (itemName.includes(keyword) || itemDescription.includes(keyword))) {
            matchScore += 1;
            currentUserInterested = true;
            break;
          }
        }
      }

      // Direction 2: Does the current user's item match what the other user is looking for?
      let otherUserInterested = false;
      
      if (otherItem.looking_for_categories && otherItem.looking_for_categories.length > 0) {
        if (otherItem.looking_for_categories.includes(selectedItem.category)) {
          matchScore += 5;
          otherUserInterested = true;
        }
      }

      if (otherItem.looking_for_conditions && otherItem.looking_for_conditions.length > 0) {
        if (otherItem.looking_for_conditions.includes(selectedItem.condition)) {
          matchScore += 3;
          otherUserInterested = true;
        }
      }

      // Check if other user's looking for description matches our item
      if (otherItem.looking_for_description && selectedItem.name) {
        const otherLookingForKeywords = otherItem.looking_for_description.toLowerCase().split(' ');
        const ourItemName = selectedItem.name.toLowerCase();
        const ourItemDescription = (selectedItem.description || '').toLowerCase();
        
        for (const keyword of otherLookingForKeywords) {
          if (keyword.length > 2 && (ourItemName.includes(keyword) || ourItemDescription.includes(keyword))) {
            matchScore += 2;
            otherUserInterested = true;
            break;
          }
        }
      }

      // BIDIRECTIONAL LOGIC: Show match ONLY if BOTH users are interested in each other's items
      // This ensures true mutual matching based on criteria
      isMatch = currentUserInterested && otherUserInterested;

      // Add bonus score for mutual interest (which is now required)
      if (isMatch) {
        matchScore += 10; // Bonus for confirmed mutual match
      }

      console.log(`Debug - Item ${otherItem.id}: currentUserInterested=${currentUserInterested}, otherUserInterested=${otherUserInterested}, isMatch=${isMatch}, score=${matchScore}`);

      // If there's any match, add to results
      if (isMatch) {
        const userProfile = profileMap.get(otherItem.user_id);
        console.log(`🚨 FINAL MATCH ADDED: Item ${otherItem.id} (${otherItem.name}) from user ${otherItem.user_id}`);
        console.log(`🚨 MATCH ITEM USER: ${otherItem.user_id} vs KNOWN BLOCKER: b5fbf0c4-f064-4be4-99cf-4d32a69b22fc`);
        console.log(`🚨 IS THIS THE BLOCKING USER? ${otherItem.user_id === 'b5fbf0c4-f064-4be4-99cf-4d32a69b22fc'}`);
        matches.push({
          id: otherItem.id,
          name: otherItem.name,
          image: otherItem.image_url || (otherItem.image_urls && otherItem.image_urls.length > 0 ? otherItem.image_urls[0] : "https://images.unsplash.com/photo-1544947950-fa07a98d237f"),
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
          matchScore, // Add match score for potential sorting
          created_at: otherItem.created_at // Include creation date for sorting
        });
      }
    }

    // Sort by newest uploaded items first (created_at desc), then by match score
    return matches
      .sort((a, b) => {
        // First sort by creation date (newest first)
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        const dateCompare = dateB.getTime() - dateA.getTime();
        
        // If dates are the same, sort by match score
        if (dateCompare === 0) {
          return b.matchScore - a.matchScore;
        }
        
        return dateCompare;
      })
      .slice(0, 20)
      .map(({ matchScore, created_at, ...item }) => item); // Remove matchScore and created_at from final result

  } catch (error) {
    console.error('Error in findMatchingItems:', error);
    return [];
  }
};