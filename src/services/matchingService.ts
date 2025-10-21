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

// Helper function to add test match only for specific user
const addTestMatchForSpecificUser = async (currentUserId: string): Promise<MatchItem[]> => {
  try {
    // Get current user's email to check if they should see the test match
    const { data: user, error } = await supabase.auth.getUser();
    
    if (error || !user?.user?.email || user.user.email !== 'nadiachibri@gmail.com') {
      return [];
    }

    // Return multiple sample match items - all Sports & Outdoors with bidirectional preferences
    const testMatches: MatchItem[] = [
      {
        id: 'test-match-camera-' + Date.now(),
        name: 'Sample Match - Camping Gear Set',
        image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80',
        category: 'Sports & Outdoors',
        condition: 'Good',
        description: 'Complete camping gear set including tent, sleeping bags, and cooking equipment. Perfect for outdoor adventures.',
        tags: ['camping', 'outdoor', 'adventure', 'gear'],
        priceRangeMin: 200,
        priceRangeMax: 400,
        looking_for_categories: ['Sports & Outdoors'],
        looking_for_conditions: ['Good', 'Excellent', 'Like New'],
        looking_for_price_ranges: ['$1-$100', '$100-$500'],
        liked: false,
        user_id: 'test-user-photographer',
        userProfile: {
          name: 'Sample User',
          username: 'outdoor_enthusiast',
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
        },
        distance: '2.5 miles away'
      },
      {
        id: 'test-match-guitar-' + Date.now(),
        name: 'Paddleboard - Inflatable SUP',
        image: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=800&q=80',
        category: 'Sports & Outdoors',
        condition: 'Excellent',
        description: 'High-quality inflatable stand-up paddleboard with pump and paddle. Great for lakes and calm waters.',
        tags: ['paddleboard', 'sup', 'water', 'outdoor'],
        priceRangeMin: 300,
        priceRangeMax: 500,
        looking_for_categories: ['Sports & Outdoors'],
        looking_for_conditions: ['Good', 'Excellent', 'Like New'],
        looking_for_price_ranges: ['$100-$500', '$500-$1000'],
        liked: false,
        user_id: 'test-user-musician',
        userProfile: {
          name: 'Alex Martinez',
          username: 'water_sports',
          avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
        },
        distance: '1.2 miles away'
      },
      {
        id: 'test-match-bike-' + Date.now(),
        name: 'Mountain Bike - Trek X-Caliber',
        image: 'https://images.unsplash.com/photo-1544191696-15693072e4a7?auto=format&fit=crop&w=800&q=80',
        category: 'Sports & Outdoors',
        condition: 'Good',
        description: 'Well-maintained mountain bike perfect for trails and city riding. Recent tune-up completed.',
        tags: ['bike', 'mountain', 'trek', 'outdoor'],
        priceRangeMin: 300,
        priceRangeMax: 500,
        looking_for_categories: ['Sports & Outdoors'],
        looking_for_conditions: ['Good', 'Excellent', 'Like New'],
        looking_for_price_ranges: ['$100-$500', '$500-$1000'],
        liked: false,
        user_id: 'test-user-cyclist',
        userProfile: {
          name: 'Sarah Chen',
          username: 'trail_rider',
          avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b2e5a7a5?auto=format&fit=crop&w=150&q=80'
        },
        distance: '3.1 miles away'
      },
      {
        id: 'test-match-watch-' + Date.now(),
        name: 'Fishing Rod & Reel Combo',
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
        category: 'Sports & Outdoors',
        condition: 'Excellent',
        description: 'Professional fishing rod and reel combo with tackle box. Perfect for lake or river fishing.',
        tags: ['fishing', 'outdoor', 'rod', 'reel'],
        priceRangeMin: 150,
        priceRangeMax: 300,
        looking_for_categories: ['Sports & Outdoors'],
        looking_for_conditions: ['Good', 'Excellent', 'Like New'],
        looking_for_price_ranges: ['$1-$100', '$100-$500'],
        liked: false,
        user_id: 'test-user-collector',
        userProfile: {
          name: 'David Kim',
          username: 'fishing_pro',
          avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
        },
        distance: '0.8 miles away'
      },
      {
        id: 'test-match-book-' + Date.now(),
        name: 'Camping Tent - 4 Person',
        image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80',
        category: 'Sports & Outdoors',
        condition: 'Very Good',
        description: 'Spacious 4-person tent with rainfly and stakes. Used only twice, in excellent condition.',
        tags: ['tent', 'camping', 'outdoor', 'adventure'],
        priceRangeMin: 100,
        priceRangeMax: 250,
        looking_for_categories: ['Sports & Outdoors'],
        looking_for_conditions: ['Good', 'Excellent', 'Like New'],
        looking_for_price_ranges: ['$1-$100', '$100-$500'],
        liked: false,
        user_id: 'test-user-bookworm',
        userProfile: {
          name: 'Emma Thompson',
          username: 'outdoor_camper',
          avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80'
        },
        distance: '4.2 miles away'
      },
      {
        id: 'test-match-hiking-' + Date.now(),
        name: 'Hiking Backpack - Osprey 65L',
        image: 'https://images.unsplash.com/photo-1622260614927-17f2ec53c15f?auto=format&fit=crop&w=800&q=80',
        category: 'Sports & Outdoors',
        condition: 'Excellent',
        description: 'Premium hiking backpack with 65L capacity. Perfect for multi-day treks and camping trips.',
        tags: ['hiking', 'backpack', 'osprey', 'outdoor'],
        priceRangeMin: 150,
        priceRangeMax: 300,
        looking_for_categories: ['Sports & Outdoors'],
        looking_for_conditions: ['Good', 'Excellent', 'Like New'],
        looking_for_price_ranges: ['$100-$500'],
        liked: false,
        user_id: 'test-user-hiker',
        userProfile: {
          name: 'Mike Johnson',
          username: 'trail_explorer',
          avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
        },
        distance: '2.8 miles away'
      },
      {
        id: 'test-match-snowboard-' + Date.now(),
        name: 'Snowboard - Burton Custom 158',
        image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80',
        category: 'Sports & Outdoors',
        condition: 'Good',
        description: 'Burton Custom snowboard with bindings. Great all-mountain board for intermediate to advanced riders.',
        tags: ['snowboard', 'burton', 'winter', 'snow'],
        priceRangeMin: 250,
        priceRangeMax: 450,
        looking_for_categories: ['Sports & Outdoors'],
        looking_for_conditions: ['Good', 'Excellent', 'Like New'],
        looking_for_price_ranges: ['$100-$500'],
        liked: false,
        user_id: 'test-user-shredder',
        userProfile: {
          name: 'Jake Williams',
          username: 'snow_rider',
          avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80'
        },
        distance: '5.3 miles away'
      },
      {
        id: 'test-match-kayak-' + Date.now(),
        name: 'Kayak - Ocean Touring',
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
        category: 'Sports & Outdoors',
        condition: 'Good',
        description: 'Stable ocean touring kayak with storage compartments. Includes paddle and life jacket.',
        tags: ['kayak', 'water', 'touring', 'ocean'],
        priceRangeMin: 400,
        priceRangeMax: 700,
        looking_for_categories: ['Sports & Outdoors'],
        looking_for_conditions: ['Good', 'Excellent', 'Like New'],
        looking_for_price_ranges: ['$100-$500', '$500-$1000'],
        liked: false,
        user_id: 'test-user-paddler',
        userProfile: {
          name: 'Lisa Park',
          username: 'kayak_adventures',
          avatar_url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=150&q=80'
        },
        distance: '1.9 miles away'
      },
      {
        id: 'test-match-climbing-' + Date.now(),
        name: 'Rock Climbing Gear Set',
        image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=800&q=80',
        category: 'Sports & Outdoors',
        condition: 'Excellent',
        description: 'Complete climbing gear including harness, carabiners, and chalk bag. Safety certified.',
        tags: ['climbing', 'rock', 'gear', 'safety'],
        priceRangeMin: 180,
        priceRangeMax: 350,
        looking_for_categories: ['Sports & Outdoors'],
        looking_for_conditions: ['Good', 'Excellent', 'Like New'],
        looking_for_price_ranges: ['$100-$500'],
        liked: false,
        user_id: 'test-user-climber',
        userProfile: {
          name: 'Tom Anderson',
          username: 'vertical_life',
          avatar_url: 'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=150&q=80'
        },
        distance: '3.7 miles away'
      },
      {
        id: 'test-match-golf-' + Date.now(),
        name: 'Golf Club Set - Callaway',
        image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=800&q=80',
        category: 'Sports & Outdoors',
        condition: 'Very Good',
        description: 'Premium Callaway golf club set with bag. Includes driver, irons, wedges, and putter.',
        tags: ['golf', 'callaway', 'clubs', 'sports'],
        priceRangeMin: 300,
        priceRangeMax: 550,
        looking_for_categories: ['Sports & Outdoors'],
        looking_for_conditions: ['Good', 'Excellent', 'Like New'],
        looking_for_price_ranges: ['$100-$500', '$500-$1000'],
        liked: false,
        user_id: 'test-user-golfer',
        userProfile: {
          name: 'Robert Lee',
          username: 'golf_pro',
          avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80'
        },
        distance: '6.1 miles away'
      },
      {
        id: 'test-match-surf-' + Date.now(),
        name: 'Surfboard - Shortboard 6\'2"',
        image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80',
        category: 'Sports & Outdoors',
        condition: 'Good',
        description: 'High-performance shortboard perfect for intermediate surfers. Minor dings repaired.',
        tags: ['surfboard', 'surf', 'water', 'beach'],
        priceRangeMin: 200,
        priceRangeMax: 400,
        looking_for_categories: ['Sports & Outdoors'],
        looking_for_conditions: ['Good', 'Excellent', 'Like New'],
        looking_for_price_ranges: ['$100-$500'],
        liked: false,
        user_id: 'test-user-surfer',
        userProfile: {
          name: 'Maria Santos',
          username: 'wave_rider',
          avatar_url: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&w=150&q=80'
        },
        distance: '4.5 miles away'
      },
      {
        id: 'test-match-running-' + Date.now(),
        name: 'Treadmill - NordicTrack',
        image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=800&q=80',
        category: 'Sports & Outdoors',
        condition: 'Excellent',
        description: 'Professional NordicTrack treadmill with incline. Barely used, like new condition.',
        tags: ['treadmill', 'running', 'fitness', 'gym'],
        priceRangeMin: 500,
        priceRangeMax: 800,
        looking_for_categories: ['Sports & Outdoors'],
        looking_for_conditions: ['Good', 'Excellent', 'Like New'],
        looking_for_price_ranges: ['$500-$1000'],
        liked: false,
        user_id: 'test-user-runner',
        userProfile: {
          name: 'Chris Taylor',
          username: 'marathon_trainer',
          avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80'
        },
        distance: '2.2 miles away'
      }
    ];

    return testMatches;
  } catch (error) {
    console.error('Error adding test matches:', error);
    return [];
  }
};

export const findMatchingItems = async (selectedItem: Item, currentUserId: string, location: string = 'nationwide', perspectiveUserId?: string): Promise<MatchItem[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  // Add test match for specific user
  const testMatches = await addTestMatchForSpecificUser(currentUserId);

  try {
    // Use perspectiveUserId if provided (for viewing other's profiles) or currentUserId (default)
    const effectiveUserId = perspectiveUserId || currentUserId;
    
    // Batch all parallel queries for better performance
    const [
      blockedResult,
      blockersResult,
      mutualMatchesResult,
      likedItemsResult,
      rejectedItemsResult,
      ownerRejectionsResult,
      myItemsResult
    ] = await Promise.all([
      // Get blocked users
      supabase
        .from('blocked_users')
        .select('blocked_id')
        .eq('blocker_id', currentUserId),
      
      // Get users who blocked me
      supabase
        .from('blocked_users')
        .select('blocker_id')
        .eq('blocked_id', currentUserId),
      
      // Get mutual matches for this specific item
      supabase
        .from('mutual_matches')
        .select('user1_item_id, user2_item_id, user1_id, user2_id')
        .or(`user1_item_id.eq.${selectedItem.id},user2_item_id.eq.${selectedItem.id}`),
      
      // Get items liked by current user
      supabase
        .from('liked_items')
        .select('item_id')
        .eq('user_id', currentUserId),
      
      // Get items rejected by current user
      supabase
        .from('rejections')
        .select('item_id')
        .eq('user_id', currentUserId)
        .or(`my_item_id.eq.${selectedItem.id},my_item_id.is.null`),
      
      // Get rejections by item owners
      supabase
        .from('rejections')
        .select('user_id, my_item_id')
        .eq('item_id', selectedItem.id),
      
      // Get current user's items for mutual blocking check
      supabase
        .from('items')
        .select('id')
        .eq('user_id', currentUserId)
    ]);

    console.log('🔍 FILTERING MATCHES: Selected item ID:', selectedItem.id);
    console.log('🔍 FILTERING MATCHES: Mutual matches found:', mutualMatchesResult.data);

    const blockedUsers = blockedResult.data?.map(item => item.blocked_id) || [];
    const usersWhoBlockedMe = blockersResult.data?.map(item => item.blocker_id) || [];
    const allBlockedUserIds = [...blockedUsers, ...usersWhoBlockedMe];

    // Extract matched item IDs to filter out
    const matchedWithSelectedItemIds = new Set<string>();
    if (mutualMatchesResult.data) {
      mutualMatchesResult.data.forEach(match => {
        if (match.user1_item_id === selectedItem.id) {
          matchedWithSelectedItemIds.add(match.user2_item_id);
          console.log('🔍 FILTERING MATCHES: Will exclude item:', match.user2_item_id);
        } else if (match.user2_item_id === selectedItem.id) {
          matchedWithSelectedItemIds.add(match.user1_item_id);
          console.log('🔍 FILTERING MATCHES: Will exclude item:', match.user1_item_id);
        }
      });
    }

    // Handle location filtering and get user profiles in parallel if needed
    let userIdsToFilter: string[] = [];
    let currentUserProfile: any = null;
    let allProfilesWithDistance: Array<{ id: string; location: string; distance: number }> = [];
    
    if (location !== 'nationwide' && ['local', '10', '20', '50'].includes(location)) {
      const [currentUserResult, allProfilesResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('location')
          .eq('id', currentUserId)
          .single(),
        supabase
          .from('profiles')
          .select('id, location')
          .not('location', 'is', null)
          .not('id', 'eq', currentUserId)
      ]);
      
      if (currentUserResult.error || !currentUserResult.data?.location) {
        return [];
      }
      
      currentUserProfile = currentUserResult.data;
      const currentUserCoords = parseLocation(currentUserProfile.location);
      if (!currentUserCoords) {
        return [];
      }
      
      if (allProfilesResult.error || !allProfilesResult.data?.length) {
        return [];
      }
      
      // Calculate distances for all profiles
      allProfilesWithDistance = allProfilesResult.data
        .map(profile => {
          const profileCoords = parseLocation(profile.location);
          if (!profileCoords) return null;
          
          const distance = calculateDistance(
            currentUserCoords.lat, currentUserCoords.lng,
            profileCoords.lat, profileCoords.lng
          );
          
          return { id: profile.id, location: profile.location, distance };
        })
        .filter((p): p is { id: string; location: string; distance: number } => p !== null);
      
      // For "local", include all users sorted by distance
      // For specific miles, filter by radius
      if (location === 'local') {
        allProfilesWithDistance.sort((a, b) => a.distance - b.distance);
        userIdsToFilter = allProfilesWithDistance.map(p => p.id);
      } else {
        const radiusInMiles = parseInt(location);
        const profilesWithinRadius = allProfilesWithDistance.filter(p => p.distance <= radiusInMiles);
        userIdsToFilter = profilesWithinRadius.map(p => p.id);
      }
      
      if (userIdsToFilter.length === 0) {
        return [];
      }
    }

    // Build items query with all filters
    let itemsQuery = supabase
      .from('items')
      .select('*')
      .not('user_id', 'eq', currentUserId)
      .eq('is_available', true)
      .eq('is_hidden', false)
      .eq('status', 'published');
    
    // Apply all filters in the query
    if (allBlockedUserIds.length > 0) {
      itemsQuery = itemsQuery.not('user_id', 'in', `(${allBlockedUserIds.join(',')})`);
    }
    
    if (userIdsToFilter.length > 0) {
      itemsQuery = itemsQuery.in('user_id', userIdsToFilter);
    }

    const { data: allItems, error: itemsError } = await itemsQuery;

    if (itemsError) {
      console.error('Error fetching items:', itemsError);
      return [];
    }

    if (!allItems || allItems.length === 0) {
      console.log('🔍 NO ITEMS FOUND in initial query');
      return [];
    }
    
    console.log('🔍 INITIAL ITEMS FOUND:', allItems.length, 'items before filtering');
    console.log('🔍 SAMPLE ITEMS:', JSON.stringify(allItems.slice(0, 3).map(i => ({ name: i.name, user_id: i.user_id, category: i.category })), null, 2));
    
    // Use data from parallel queries
    const myItemIds = myItemsResult.data?.map(item => item.id) || [];
    
    // Get users who have rejected any of my items (mutual blocking)
    const usersWhoRejectedMyItemsResult = myItemIds.length > 0 
      ? await supabase
          .from('rejections')
          .select('user_id')
          .in('item_id', myItemIds)
      : { data: [], error: null };

    if (usersWhoRejectedMyItemsResult.error) {
      console.error('Error fetching mutual blocks:', usersWhoRejectedMyItemsResult.error);
    }

    // Process all the data from parallel queries
    const mutualBlockedUserIds = new Set(usersWhoRejectedMyItemsResult.data?.map(r => r.user_id) || []);
    const likedItemIds = new Set(likedItemsResult.data?.map(item => item.item_id) || []);
    const rejectedItemIds = new Set(rejectedItemsResult.data?.map(item => item.item_id) || []);
    
    // Create a map of rejections: user_id -> Set of item_ids they rejected us for
    const rejectedByOwnerMap = new Map<string, Set<string>>();
    ownerRejectionsResult.data?.forEach(rejection => {
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
      const isMyOwnItem = item.user_id === currentUserId;
      
      // 4. Don't show items from the same user as selected item (but this should be rare)
      const isSameUser = item.user_id === selectedItem.user_id;

      // 5. Don't show items if there's bidirectional blocking
      const isBlockedUser = allBlockedUserIds.includes(item.user_id);

      // 6. Don't show items that have specifically matched with the selected item
      const hasMatchedWithSelectedItem = matchedWithSelectedItemIds.has(item.id);

      // 7. Don't show items from users who have rejected ANY of my items (mutual blocking)
      const isMutuallyBlocked = mutualBlockedUserIds.has(item.user_id);

      // Enhanced safety check with multiple comparison methods
      const isSameUserAsSelected = item.user_id === selectedItem.user_id || 
                        (item.user_id && selectedItem.user_id && item.user_id.toString().trim() === selectedItem.user_id.toString().trim());

      if (item.name === 'Trek Mountain Bike' || item.name === 'Camping Tent - 4 Person') {
        console.log('🔍 FILTERING SPORTS ITEM:', item.name, JSON.stringify({
          isRejectedByCurrentUser,
          ownerRejectedCurrentItem,
          isMyOwnItem,
          isSameUser,
          isBlockedUser,
          hasMatchedWithSelectedItem,
          isMutuallyBlocked,
          isSameUserAsSelected,
          willBeFiltered: isRejectedByCurrentUser || ownerRejectedCurrentItem || isMyOwnItem || isSameUserAsSelected || isBlockedUser || hasMatchedWithSelectedItem || isMutuallyBlocked
        }, null, 2));
      }

      return !isRejectedByCurrentUser && !ownerRejectedCurrentItem && !isMyOwnItem && !isSameUserAsSelected && !isBlockedUser && !hasMatchedWithSelectedItem && !isMutuallyBlocked;
    });
    
    console.log('🔍 AVAILABLE ITEMS AFTER FILTERING:', availableItems.length, 'items');
    console.log('🔍 AVAILABLE ITEMS:', JSON.stringify(availableItems.slice(0, 5).map(i => ({ name: i.name, category: i.category })), null, 2));
    
    

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

    // Helper functions for price range matching within scope
    const parsePriceRange = (range: string): { min: number; max: number } | null => {
      if (!range) return null;
      const trimmed = range.trim();
      if (/^\d+\+$/.test(trimmed)) {
        const min = parseFloat(trimmed.replace('+', ''));
        if (isNaN(min)) return null;
        return { min, max: Number.POSITIVE_INFINITY };
      }
      const parts = trimmed.split('-');
      if (parts.length === 2) {
        const min = parseFloat(parts[0]);
        const max = parseFloat(parts[1]);
        if (isNaN(min) || isNaN(max)) return null;
        return { min, max };
      }
      return null;
    };

    const priceOverlapsAny = (
      itemMin?: number | null,
      itemMax?: number | null,
      desiredRanges?: string[] | null
    ): { gatePass: boolean; matched: boolean } => {
      // If no desired ranges selected, treat as no restriction (gatePass) and no score contribution (matched=false)
      if (!desiredRanges || desiredRanges.length === 0) return { gatePass: true, matched: false };
      if (itemMin === undefined || itemMin === null) return { gatePass: false, matched: false };
      const min = Number(itemMin);
      const max = Number(itemMax ?? itemMin);
      let matched = false;
      for (const r of desiredRanges) {
        const pr = parsePriceRange(r);
        if (!pr) continue;
        // overlap if ranges intersect
        if (max >= pr.min && min <= pr.max) {
          matched = true;
          break;
        }
      }
      return { gatePass: matched, matched };
    };

    console.log('🔍 MATCHING: Processing', availableItems.length, 'available items for selected item:', selectedItem.name);
    
    for (const otherItem of availableItems) {
      let matchScore = 0;

      console.log('🔍 MATCHING ITEM:', {
        itemName: otherItem.name,
        itemCategory: otherItem.category,
        itemCondition: otherItem.condition,
        itemLookingFor: otherItem.looking_for_categories,
        selectedItemCategory: selectedItem.category,
        selectedItemLookingFor: selectedItem.looking_for_categories,
        selectedItemConditions: selectedItem.looking_for_conditions
      });

      // Build per-criterion gates (bi-directional). Each side must satisfy all criteria that the other specified.
      // A = selectedItem (current user), B = otherItem (owner)

      // Category gates
      const aRequiresCategory = Array.isArray(selectedItem.looking_for_categories) && selectedItem.looking_for_categories.length > 0;
      const bSatisfiesACategory = !!(otherItem.category && aRequiresCategory && selectedItem.looking_for_categories!.includes(otherItem.category));
      const aCategoryGate = !aRequiresCategory || bSatisfiesACategory;

      const bRequiresCategory = Array.isArray(otherItem.looking_for_categories) && otherItem.looking_for_categories.length > 0;
      const aSatisfiesBCategory = !!(selectedItem.category && bRequiresCategory && otherItem.looking_for_categories!.includes(selectedItem.category));
      const bCategoryGate = !bRequiresCategory || aSatisfiesBCategory;

      if (bSatisfiesACategory) matchScore += 3;
      if (aSatisfiesBCategory) matchScore += 5;

      // Condition gates
      const aRequiresCondition = Array.isArray(selectedItem.looking_for_conditions) && selectedItem.looking_for_conditions.length > 0;
      const bSatisfiesACondition = !!(otherItem.condition && aRequiresCondition && selectedItem.looking_for_conditions!.includes(otherItem.condition));
      const aConditionGate = !aRequiresCondition || bSatisfiesACondition;

      const bRequiresCondition = Array.isArray(otherItem.looking_for_conditions) && otherItem.looking_for_conditions.length > 0;
      const aSatisfiesBCondition = !!(selectedItem.condition && bRequiresCondition && otherItem.looking_for_conditions!.includes(selectedItem.condition));
      const bConditionGate = !bRequiresCondition || aSatisfiesBCondition;

      if (bSatisfiesACondition) matchScore += 2;
      if (aSatisfiesBCondition) matchScore += 3;

      // Description/keyword gates
      const tokenize = (s?: string | null) => (s || '').toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2);

      const aKeywords = tokenize(selectedItem.looking_for_description);
      const aRequiresKeywords = aKeywords.length > 0;
      const bText = `${(otherItem.name || '').toLowerCase()} ${
        (otherItem.description || '').toLowerCase()
      }`;
      const bSatisfiesADescription = aRequiresKeywords && aKeywords.some(k => bText.includes(k));
      const aDescriptionGate = !aRequiresKeywords || bSatisfiesADescription;

      const bKeywords = tokenize(otherItem.looking_for_description);
      const bRequiresKeywords = bKeywords.length > 0;
      const aText = `${(selectedItem.name || '').toLowerCase()} ${
        (selectedItem.description || '').toLowerCase()
      }`;
      const aSatisfiesBDescription = bRequiresKeywords && bKeywords.some(k => aText.includes(k));
      const bDescriptionGate = !bRequiresKeywords || aSatisfiesBDescription;

      if (bSatisfiesADescription) matchScore += 1;
      if (aSatisfiesBDescription) matchScore += 2;

      // Price range gates (using helper)
      const priceCheckA = priceOverlapsAny(
        otherItem.price_range_min,
        otherItem.price_range_max,
        selectedItem.looking_for_price_ranges
      );
      const aPriceGate = priceCheckA.gatePass; // true if no ranges specified OR overlap exists
      if (priceCheckA.matched) matchScore += 3;

      const priceCheckB = priceOverlapsAny(
        selectedItem.priceRangeMin,
        selectedItem.priceRangeMax,
        otherItem.looking_for_price_ranges
      );
      const bPriceGate = priceCheckB.gatePass;
      if (priceCheckB.matched) matchScore += 4;

      // Final decision: both sides must pass ALL gates they require
      const currentUserAllGates = aCategoryGate && aConditionGate && aDescriptionGate && aPriceGate;
      const otherUserAllGates = bCategoryGate && bConditionGate && bDescriptionGate && bPriceGate;
      const isMatch = currentUserAllGates && otherUserAllGates;

      console.log('🔍 GATE CHECK:', {
        itemName: otherItem.name,
        aCategoryGate,
        aConditionGate,
        aDescriptionGate,
        aPriceGate,
        bCategoryGate,
        bConditionGate,
        bDescriptionGate,
        bPriceGate,
        currentUserAllGates,
        otherUserAllGates,
        isMatch
      });

      if (isMatch) {
        // Bonus for mutual confirmed match
        matchScore += 10;

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
          liked: false,
          user_id: otherItem.user_id,
          userProfile: userProfile ? {
            name: userProfile.name,
            username: userProfile.username,
            avatar_url: userProfile.avatar_url
          } : undefined,
          matchScore,
          created_at: otherItem.created_at
        });
      }
    }

    // Sort by distance if "local" mode, otherwise by date created then match score
    if (location === 'local' && allProfilesWithDistance.length > 0) {
      const distanceMap = new Map(allProfilesWithDistance.map(p => [p.id, p.distance]));
      matches.sort((a, b) => {
        const distA = distanceMap.get(a.user_id) ?? Infinity;
        const distB = distanceMap.get(b.user_id) ?? Infinity;
        if (distA !== distB) return distA - distB;
        return (b.matchScore || 0) - (a.matchScore || 0);
      });
      
      // Add distance to match display
      matches.forEach(match => {
        const dist = distanceMap.get(match.user_id);
        if (dist !== undefined) {
          match.distance = `${dist.toFixed(1)} miles away`;
        }
      });
    } else {
      matches.sort((a, b) => {
        const dateA = new Date(a.created_at || '').getTime();
        const dateB = new Date(b.created_at || '').getTime();
        if (dateB !== dateA) return dateB - dateA;
        return (b.matchScore || 0) - (a.matchScore || 0);
      });
    }

    // Limit to top 50 matches
    const finalMatches = matches.slice(0, 50);
    
    // Sort test matches by distance if in local mode
    let sortedTestMatches = testMatches;
    if (location === 'local') {
      sortedTestMatches = [...testMatches].sort((a, b) => {
        const distA = parseFloat(a.distance?.split(' ')[0] || '999');
        const distB = parseFloat(b.distance?.split(' ')[0] || '999');
        return distA - distB;
      });
    }
    
    // Combine test matches with real matches
    const allMatches = [...sortedTestMatches, ...finalMatches.map(({ matchScore, created_at, ...item }) => item)];

    return allMatches;

  } catch (error) {
    console.error('Error in findMatchingItems:', error);
    return testMatches; // Return test matches even if real matching fails
  }
};