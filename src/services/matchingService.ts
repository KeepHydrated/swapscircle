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
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    // Get current user for authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return [];
    }

    // Use perspectiveUserId if provided (for viewing other's profiles) or currentUserId (default)
    const effectiveUserId = perspectiveUserId || currentUserId;
    
    // Get blocked users from the VIEWING user's perspective (not the perspective user)
    // This ensures when you view your own matches, blocked users are filtered out
    const { data: blockedData, error: blockedError } = await supabase
      .from('blocked_users')
      .select('blocked_id')
      .eq('blocker_id', currentUserId);
    
    const { data: blockersData, error: blockersError } = await supabase
      .from('blocked_users')
      .select('blocker_id')
      .eq('blocked_id', currentUserId);
    
    const blockedUsers = blockedData?.map(item => item.blocked_id) || [];
    const usersWhoBlockedMe = blockersData?.map(item => item.blocker_id) || [];
    const allBlockedUserIds = [...blockedUsers, ...usersWhoBlockedMe];

    // Get all available and visible items from other users - exclude the current user's items
    
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


    // If location is not nationwide, filter by GPS radius
    let userIdsToFilter: string[] = [];
    if (location !== 'nationwide' && ['5', '10', '20', '50'].includes(location)) {
      const radiusInMiles = parseInt(location);
      
      // Get current user's location
      const { data: currentUserProfile, error: currentUserError } = await supabase
        .from('profiles')
        .select('location')
        .eq('user_id', currentUserId)
        .single();
      
      if (currentUserError || !currentUserProfile?.location) {
        return [];
      }
      
      const currentUserCoords = parseLocation(currentUserProfile.location);
      if (!currentUserCoords) {
        return [];
      }
      
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
        
        return distance <= radiusInMiles;
      });
      
      userIdsToFilter = profilesWithinRadius.map(p => p.user_id);
      
      if (userIdsToFilter.length === 0) {
        return [];
      }
      
      itemsQuery = itemsQuery.in('user_id', userIdsToFilter);
    }

    const { data: allItems, error: itemsError } = await itemsQuery;

    if (itemsError) {
      console.error('Error fetching items:', itemsError);
      return [];
    }

    if (!allItems || allItems.length === 0) {
      return [];
    }
    
    // Get mutual matches specifically involving the selected item  
    console.log('🔥 MUTUAL MATCHES: Querying for selectedItem.id:', selectedItem.id);
    const { data: mutualMatches, error: mutualMatchesError } = await supabase
      .from('mutual_matches')
      .select('user1_item_id, user2_item_id, user1_id, user2_id')
      .or(`user1_item_id.eq.${selectedItem.id},user2_item_id.eq.${selectedItem.id}`);

    console.log('🔥 MUTUAL MATCHES: Query result:', { mutualMatches, error: mutualMatchesError });

    // Extract item IDs that have specifically matched with the selected item
    const matchedWithSelectedItemIds = new Set<string>();
    if (mutualMatches) {
      mutualMatches.forEach(match => {
        console.log('🔥 MUTUAL MATCHES: Processing match:', match);
        // Only add the OTHER item that matched with our selected item
        if (match.user1_item_id === selectedItem.id) {
          console.log('🔥 MUTUAL MATCHES: Adding user2_item_id to exclusion:', match.user2_item_id);
          matchedWithSelectedItemIds.add(match.user2_item_id);
        } else if (match.user2_item_id === selectedItem.id) {
          console.log('🔥 MUTUAL MATCHES: Adding user1_item_id to exclusion:', match.user1_item_id);
          matchedWithSelectedItemIds.add(match.user1_item_id);
        }
      });
    }
    console.log('🔥 MUTUAL MATCHES: Final exclusion set:', Array.from(matchedWithSelectedItemIds));

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

    const likedItemIds = new Set(likedItems?.map(item => item.item_id) || []);

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


    // Filter out items that:
    // 1. Current user has rejected for this specific item
    // 2. Item owners who have rejected the current user's selected item for their specific items
    // 3. Items where bidirectional blocking exists
    // 4. Items that have specifically matched with the selected item
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

      // 6. Don't show items that have specifically matched with the selected item
      const hasMatchedWithSelectedItem = matchedWithSelectedItemIds.has(item.id);

      // Enhanced safety check with multiple comparison methods
      const isSameUserAsSelected = item.user_id === selectedItem.user_id || 
                        (item.user_id && selectedItem.user_id && item.user_id.toString().trim() === selectedItem.user_id.toString().trim());

      return !isRejectedByCurrentUser && !ownerRejectedCurrentItem && !isMyOwnItem && !isSameUserAsSelected && !isBlockedUser && !hasMatchedWithSelectedItem;
    });
    
    

    const matches: Array<MatchItem & { matchScore: number; created_at?: string }> = [];

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

      

      // If there's any match, add to results
      if (isMatch) {
        const userProfile = profileMap.get(otherItem.user_id);
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

    // Sort by date created, then by match score
    matches.sort((a, b) => {
      const dateA = new Date(a.created_at || '').getTime();
      const dateB = new Date(b.created_at || '').getTime();
      if (dateB !== dateA) return dateB - dateA;
      return (b.matchScore || 0) - (a.matchScore || 0);
    });

    // Limit to top 50 matches
    const finalMatches = matches.slice(0, 50);
    
    return finalMatches.map(({ matchScore, created_at, ...item }) => item);

  } catch (error) {
    console.error('Error in findMatchingItems:', error);
    return [];
  }
};