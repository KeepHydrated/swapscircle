import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { Item, MatchItem } from '@/types/item';

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

export const findMatchingItems = async (selectedItem: Item, currentUserId: string, location: string = 'nationwide'): Promise<MatchItem[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    // Get current user for authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Error getting user:', userError);
      return [];
    }

    // Get all available and visible items from other users - EXPLICIT EXCLUSION
    console.log('Debug - Building query to exclude current user:', currentUserId);
    
    let itemsQuery = supabase
      .from('items')
      .select('*')
      .not('user_id', 'eq', currentUserId) // More explicit exclusion
      .eq('is_available', true) // Only show available items
      .eq('is_hidden', false) // Only show non-hidden items
      .eq('status', 'published'); // Only show published items (not drafts)

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

    console.log('Debug - Rejected items by current user for selected item:', rejectedItems);
    console.log('Debug - Users who rejected current item:', ownerRejections);

    const likedItemIds = new Set(likedItems?.map(item => item.item_id) || []);
    console.log('Debug - Liked item IDs:', Array.from(likedItemIds));

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

    // Filter out items that:
    // 1. Current user has rejected for this specific item
    // 2. Item owners who have rejected the current user's selected item for their specific items
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

      console.log(`Debug - Item ${item.id} (user: ${item.user_id}): rejected=${isRejectedByCurrentUser}, ownerRejected=${!!ownerRejectedCurrentItem}, isMyOwnItem=${isMyOwnItem}`);

      // Enhanced safety check with multiple comparison methods
      const isSameUserAsSelected = item.user_id === selectedItem.user_id || 
                        (item.user_id && selectedItem.user_id && item.user_id.toString().trim() === selectedItem.user_id.toString().trim());

      // Include items that are:
      // - NOT rejected by current user for this specific item
      // - NOT from owners who rejected current user's item for this specific item  
      // - NOT the user's own items
      // - NOT from the same user as the selected item
      return !isRejectedByCurrentUser && !ownerRejectedCurrentItem && !isMyOwnItem && !isSameUserAsSelected;
    });
    
    console.log('Debug - Available items after filtering rejections:', availableItems.length);

    const matches: Array<MatchItem & { matchScore: number }> = [];

    // Get unique user IDs to fetch profiles in batch
    const userIds = [...new Set(availableItems.map(item => item.user_id))];
    
    // Fetch all user profiles in one query
    const { data: userProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, name, username, avatar_url')
      .in('user_id', userIds);

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
        profileMap.set(profile.user_id, profile);
      });
    }

    for (const otherItem of availableItems) {
      let matchScore = 0;
      let isMatch = false;

      // BIDIRECTIONAL MATCHING: Check both directions for interest
      
      // Direction 1: Does the other item match what the current user is looking for?
      let currentUserInterested = false;
      
      if (selectedItem.lookingForCategories && selectedItem.lookingForCategories.length > 0) {
        if (selectedItem.lookingForCategories.includes(otherItem.category)) {
          matchScore += 3;
          currentUserInterested = true;
        }
      }

      if (selectedItem.lookingForConditions && selectedItem.lookingForConditions.length > 0) {
        if (selectedItem.lookingForConditions.includes(otherItem.condition)) {
          matchScore += 2;
          currentUserInterested = true;
        }
      }

      // Check keyword matching in description
      if (selectedItem.lookingForDescription && otherItem.name) {
        const lookingForKeywords = selectedItem.lookingForDescription.toLowerCase().split(' ');
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

      // BIDIRECTIONAL LOGIC: Show match if EITHER user is interested in the other's item
      // This ensures both users see each other's items when there's mutual potential
      isMatch = currentUserInterested || otherUserInterested;

      // Add bonus score for mutual interest
      if (currentUserInterested && otherUserInterested) {
        matchScore += 10; // Huge bonus for mutual interest
      }

      console.log(`Debug - Item ${otherItem.id}: currentUserInterested=${currentUserInterested}, otherUserInterested=${otherUserInterested}, isMatch=${isMatch}, score=${matchScore}`);

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