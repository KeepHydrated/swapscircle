import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import FriendItemsCarousel from '@/components/profile/FriendItemsCarousel';
import HomeWithLocationFilter from '@/components/home/HomeWithLocationFilter';
import { useDbItems } from '@/hooks/useDbItems';
import { useUserItems } from '@/hooks/useUserItems';
import { useMatches } from '@/hooks/useMatches';
import ItemCard from '@/components/items/ItemCard';
import MyItems from '@/components/items/MyItems';
import Matches from '@/components/items/Matches';
import ExploreItemModal from '@/components/items/ExploreItemModal';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { MatchItem } from '@/types/item';
import { supabase } from '@/integrations/supabase/client';

const Home: React.FC = () => {
  // User's authentication
  const { user, supabaseConfigured } = useAuth();
  
  // Friend items - fetch from friends
  const [friendItems, setFriendItems] = useState([]);
  const [friendItemsLoading, setFriendItemsLoading] = useState(false);

  // Fetch friends' items
  const fetchFriendsItems = async () => {
    if (!user) return;
    
    setFriendItemsLoading(true);
    try {
      // Get all accepted friend requests where current user is involved
      const { data: friendRequests, error: friendsError } = await supabase
        .from('friend_requests')
        .select('requester_id, recipient_id')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

      if (friendsError) {
        console.error('Error fetching friends:', friendsError);
        return;
      }

      if (!friendRequests || friendRequests.length === 0) {
        setFriendItems([]);
        return;
      }

      // Get friend user IDs (excluding current user)
      const friendIds = friendRequests.map(req => 
        req.requester_id === user.id ? req.recipient_id : req.requester_id
      );

      // Fetch items from all friends and their profiles separately
      const { data: friendItemsData, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .in('user_id', friendIds);

      if (itemsError) {
        console.error('Error fetching friend items:', itemsError);
        return;
      }

      // Fetch profiles for the friends
      const { data: friendProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url')
        .in('id', friendIds);

      if (profilesError) {
        console.error('Error fetching friend profiles:', profilesError);
      }

      // Create a map of user_id to profile for quick lookup
      const profileMap = (friendProfiles || []).reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, any>);

      // Format items for the carousel
      const formattedFriendItems = friendItemsData?.map(item => {
        const ownerProfile = profileMap[item.user_id];
        return {
          id: item.id,
          name: item.name,
          image: item.image_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f',
          category: item.category,
          condition: item.condition,
          description: item.description,
          price_range_min: item.price_range_min,
          price_range_max: item.price_range_max,
          tags: item.tags,
          liked: false,
          ownerName: ownerProfile?.name || ownerProfile?.username || 'Unknown',
          ownerAvatar: ownerProfile?.avatar_url,
          user_id: item.user_id
        };
      }) || [];

      setFriendItems(formattedFriendItems);
    } catch (error) {
      console.error('Error fetching friends items:', error);
    } finally {
      setFriendItemsLoading(false);
    }
  };

  // Fetch friends' items when user changes or component mounts
  useEffect(() => {
    if (user && supabaseConfigured) {
      fetchFriendsItems();
    } else {
      setFriendItems([]);
    }
  }, [user, supabaseConfigured]);

  // Define handler for liking friend items (local state only)
  const handleLikeFriendItem = (itemId: string) => {
    setFriendItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, liked: !item.liked } : item
      )
    );
    const toggled = friendItems.find(item => item.id === itemId)?.liked;
    toast({
      title: toggled ? "Removed from favorites" : "Added to favorites",
      description: `Item has been ${toggled ? "removed from" : "added to"} your favorites.`,
    });
  };

  // User's items and matching functionality
  const { items: userItems, loading: userItemsLoading, error: userItemsError } = useUserItems();
  
  // Selected items state - auto-select first item
  const [selectedUserItemId, setSelectedUserItemId] = useState<string>('');
  
  // Auto-select first item when userItems are loaded
  useEffect(() => {
    if (userItems.length > 0 && !selectedUserItemId) {
      setSelectedUserItemId(userItems[0].id);
    }
  }, [userItems, selectedUserItemId]);
  
  // Get selected user item
  const selectedUserItem = userItems.find(item => item.id === selectedUserItemId) || null;
  
  // Get matches for selected item (real matches from DB)
  const { matches: dbMatches, loading: matchesLoading, error: matchesError } = useMatches(selectedUserItem);

  // Use only real matches from database
  const matches = selectedUserItem ? dbMatches : [];

  // Handle selecting a user item
  const handleSelectUserItem = (itemId: string) => {
    setSelectedUserItemId(itemId);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <HomeWithLocationFilter>
        <div className="flex-1 p-4 md:p-6 flex flex-col h-full">
          {/* Friend Items Carousel */}
          <div className="mb-6 h-64">
            <FriendItemsCarousel 
              items={friendItems} 
              onLikeItem={handleLikeFriendItem} 
            />
          </div>

          {/* Main Two-Column Layout */}
          <div className="flex-1 min-h-0">
            {user && supabaseConfigured ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                {/* Left Column - Your Items */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Items</h2>
                  {userItemsLoading ? (
                    <div className="flex justify-center items-center min-h-[300px]">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : userItemsError ? (
                    <div className="text-red-600 text-center bg-red-50 p-4 rounded-lg text-sm">{userItemsError}</div>
                  ) : userItems.length === 0 ? (
                    <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">
                      <div className="text-4xl mb-3">📦</div>
                      <p className="text-base font-medium mb-1">No items yet</p>
                      <p className="text-sm">Post an item to see matches!</p>
                    </div>
                  ) : (
                    <MyItems
                      items={userItems}
                      selectedItemId={selectedUserItemId}
                      onSelectItem={handleSelectUserItem}
                    />
                  )}
                </div>

                {/* Right Column - Matches */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
                  {selectedUserItem ? (
                    <Matches
                      matches={matches}
                      selectedItemName={selectedUserItem.name}
                    />
                  ) : (
                    <div className="h-full flex flex-col">
                      <h2 className="text-2xl font-bold mb-4 text-gray-800">Matches</h2>
                      <div className="flex-1 flex flex-col justify-center items-center text-center text-gray-500 py-8">
                        <div className="text-4xl mb-3">🔍</div>
                        <p className="text-base font-medium mb-1">No item selected</p>
                        <p className="text-sm">Select an item to see matches</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="text-4xl mb-3">🔐</div>
                <p className="text-base font-medium mb-1">Please log in</p>
                <p className="text-sm">Sign in to see your items and find matches</p>
              </div>
            )}
          </div>
        </div>
      </HomeWithLocationFilter>
    </div>
  );
};

export default Home;
