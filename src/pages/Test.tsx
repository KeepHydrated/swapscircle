
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import Header from '@/components/layout/Header';
import HeaderLocationSelector from '@/components/layout/HeaderLocationSelector';
import FriendItemsCarousel from '@/components/profile/FriendItemsCarousel';

import { useDbItems } from '@/hooks/useDbItems';
import { useUserItems } from '@/hooks/useUserItems';
import { useMatches } from '@/hooks/useMatches';
import ItemCard from '@/components/items/ItemCard';
import MyItems from '@/components/items/MyItems';
import Matches from '@/components/items/Matches';
import ExploreItemModal from '@/components/items/ExploreItemModal';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { MatchItem } from '@/types/item';
import { supabase } from '@/integrations/supabase/client';
import { likeItem, unlikeItem } from '@/services/authService';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

const Test: React.FC = () => {
  // User's authentication and navigation
  const { user, supabaseConfigured } = useAuth();
  const navigate = useNavigate();
  
  // Friend items - fetch from friends
  const [friendItems, setFriendItems] = useState([]);
  const [friendItemsLoading, setFriendItemsLoading] = useState(false);
  const [rejectedFriendItems, setRejectedFriendItems] = useState<string[]>([]);
  const [lastFriendActions, setLastFriendActions] = useState<{ type: 'like' | 'reject'; itemId: string; wasLiked?: boolean }[]>([]);

  // Modal state
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

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

  // Define handler for liking friend items with mutual matching
  const handleLikeFriendItem = async (itemId: string) => {
    if (!user) {
      toast.error('Please log in to like items');
      return;
    }

    const currentItem = friendItems.find(item => item.id === itemId);
    if (!currentItem) return;

    // Track the action for undo (keep only last 3 actions)
    setLastFriendActions(prev => {
      const newAction = { type: 'like' as const, itemId, wasLiked: currentItem.liked };
      const updated = [newAction, ...prev];
      return updated.slice(0, 3); // Keep only last 3 actions
    });

    // Optimistically update UI
    setFriendItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, liked: !item.liked } : item
      )
    );

    try {
      const isCurrentlyLiked = currentItem.liked;
      let result;
      
      if (isCurrentlyLiked) {
        result = await unlikeItem(itemId);
        toast.success("Removed from favorites");
      } else {
        result = await likeItem(itemId);
        
        // Check for mutual match result
        if (result && typeof result === 'object' && 'success' in result && result.success) {
          if ('isMatch' in result && result.isMatch && 'matchData' in result && result.matchData) {
            toast.success("It's a match! 🎉 Starting conversation...");
            // Navigate to messages after a delay
            setTimeout(() => {
              navigate('/messages', {
                state: {
                  newMatch: true,
                  matchData: result.matchData,
                },
              });
            }, 2000);
          } else {
            toast.success("Added to favorites");
          }
        }
      }
    } catch (error) {
      console.error('Error liking friend item:', error);
      // Revert optimistic update on error
      setFriendItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, liked: currentItem.liked } : item
        )
      );
      toast.error('Failed to update like status');
    }
  };

  // Handle rejecting friend items
  const handleRejectFriendItem = (itemId: string) => {
    // Track the action for undo (keep only last 3 actions)
    setLastFriendActions(prev => {
      const newAction = { type: 'reject' as const, itemId };
      const updated = [newAction, ...prev];
      return updated.slice(0, 3); // Keep only last 3 actions
    });
    setRejectedFriendItems(prev => [...prev, itemId]);
    toast.success('Item removed from friends\' items');
  };

  // Handle undo for friend items
  const handleUndoFriendAction = () => {
    if (lastFriendActions.length === 0) return;

    const actionToUndo = lastFriendActions[0]; // Get most recent action

    if (actionToUndo.type === 'like') {
      // Undo like action - revert to previous liked state
      setFriendItems(prev =>
        prev.map(item =>
          item.id === actionToUndo.itemId 
            ? { ...item, liked: actionToUndo.wasLiked || false }
            : item
        )
      );
      toast.success('Like action undone');
    } else if (actionToUndo.type === 'reject') {
      // Undo reject action - restore item to friends' items
      setRejectedFriendItems(prev => prev.filter(id => id !== actionToUndo.itemId));
      toast.success('Reject action undone');
    }

    // Remove the undone action from the list
    setLastFriendActions(prev => prev.slice(1));
  };

  // User's items and matching functionality
  const { items: userItems, loading: userItemsLoading, error: userItemsError } = useUserItems();
  
  // Selected items state - auto-select first item
  const [selectedUserItemId, setSelectedUserItemId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('matches');
  
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

  // Handle opening item modal
  const handleOpenItemModal = (item: any) => {
    console.log('OPENING MODAL with item:', item);
    setSelectedItem(item);
    setModalOpen(true);
  };

  // Handle closing item modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  // Get displayed friends items (excluding rejected ones)
  const displayedFriendItems = friendItems.filter(item => !rejectedFriendItems.includes(item.id));
  
  // Find current index in displayed friend items
  const currentFriendItemIndex = selectedItem 
    ? displayedFriendItems.findIndex(item => item.id === selectedItem.id)
    : -1;

  // Navigation functions for friends items
  const navigateToPrevFriendItem = () => {
    if (currentFriendItemIndex > 0) {
      const prevItem = displayedFriendItems[currentFriendItemIndex - 1];
      if (prevItem) {
        setSelectedItem(prevItem);
      }
    }
  };

  const navigateToNextFriendItem = () => {
    if (currentFriendItemIndex < displayedFriendItems.length - 1) {
      const nextItem = displayedFriendItems[currentFriendItemIndex + 1];
      if (nextItem) {
        setSelectedItem(nextItem);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex-1 p-4 md:p-6 flex flex-col h-full">

        {/* Main Two-Column Layout */}
        <div className="flex-1 min-h-0">
          {user && supabaseConfigured ? (
            <div className="grid grid-cols-1 gap-6 h-full">
              {/* Left Column - Your Items */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
                
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
                  <div className="h-auto">
                    <div className="overflow-x-auto overflow-y-hidden p-2">
                      <div className="flex gap-2 min-w-max">
                        {userItems.map((item) => (
                          <div key={item.id} className="flex-shrink-0 w-32 transform transition-all duration-200 hover:scale-105">
                            <ItemCard 
                              id={item.id}
                              name={item.name}
                              image={item.image}
                              isSelected={selectedUserItemId === item.id}
                              onSelect={handleSelectUserItem}
                              compact={true}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Matches and Friends Items */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
                <Tabs defaultValue="matches" onValueChange={setActiveTab} className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <TabsList className="grid grid-cols-2 w-auto">
                      <TabsTrigger value="matches">Matches</TabsTrigger>
                      <TabsTrigger value="friends">Friends' Items</TabsTrigger>
                    </TabsList>
                    <div className="flex items-center gap-2">
                      {activeTab === 'matches' && (
                        <HeaderLocationSelector 
                          onLocationChange={(value) => console.log('Location changed to:', value)}
                        />
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUndoFriendAction}
                        disabled={lastFriendActions.length === 0}
                        className="flex items-center gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Undo
                      </Button>
                    </div>
                  </div>
                  
                   <TabsContent value="matches" className="flex-1 mt-0">
                     {selectedUserItem ? (
                       <Matches
                         matches={matches}
                         selectedItemName={selectedUserItem.name}
                       />
                     ) : (
                       <div className="h-full flex flex-col">
                         <div className="flex-1 flex flex-col justify-center items-center text-center text-gray-500 py-8">
                           <div className="text-4xl mb-3">🔍</div>
                           <p className="text-base font-medium mb-1">No item selected</p>
                           <p className="text-sm">Select an item to see matches</p>
                         </div>
                       </div>
                     )}
                   </TabsContent>
                  
                    <TabsContent value="friends" className="flex-1 mt-0">
                      <div className="h-full flex flex-col">
                      {friendItemsLoading ? (
                        <div className="flex-1 flex justify-center items-center">
                          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                        </div>
                      ) : friendItems.length === 0 ? (
                        <div className="flex-1 flex flex-col justify-center items-center text-center text-gray-500 py-8">
                          <div className="text-4xl mb-3">👥</div>
                          <p className="text-base font-medium mb-1">No friends' items</p>
                          <p className="text-sm">Add friends to see their items here</p>
                        </div>
                        ) : (
                          <div className="overflow-x-auto overflow-y-hidden p-2">
                            <div className="flex gap-2 min-w-max">
                              {friendItems
                                .filter(item => !rejectedFriendItems.includes(item.id))
                                .map((item) => (
                              <div key={item.id} className="flex-shrink-0 w-64 transform transition-all duration-200 hover:scale-105">
                                <ItemCard
                                  id={item.id}
                                  name={item.name}
                                  image={item.image}
                                  liked={item.liked}
                                  onSelect={() => handleOpenItemModal(item)}
                                  onLike={() => handleLikeFriendItem(item.id)}
                                  onReject={() => handleRejectFriendItem(item.id)}
                                  showLikeButton={true}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
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

      {/* Explore Item Modal */}
      <ExploreItemModal
        open={modalOpen}
        item={selectedItem}
        onClose={handleCloseModal}
        liked={selectedItem?.liked}
        onLike={() => selectedItem && handleLikeFriendItem(selectedItem.id)}
        onNavigatePrev={navigateToPrevFriendItem}
        onNavigateNext={navigateToNextFriendItem}
        currentIndex={currentFriendItemIndex}
        totalItems={displayedFriendItems.length}
      />
    </div>
  );
};

export default Test;
