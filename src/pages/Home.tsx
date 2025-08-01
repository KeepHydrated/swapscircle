import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import HeaderLocationSelector from '@/components/layout/HeaderLocationSelector';
import Header from '@/components/layout/Header';
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

const Home: React.FC = () => {
  // User's authentication and navigation
  const { user, supabaseConfigured } = useAuth();
  const navigate = useNavigate();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('matches');
  const [selectedLocation, setSelectedLocation] = useState('nationwide');
  console.log('DEBUG: Home component selectedLocation state:', selectedLocation);
  console.log('DEBUG: Current activeTab in Home:', activeTab);
  
  // Friend items - fetch from friends
  const [friendItems, setFriendItems] = useState([]);
  const [friendItemsLoading, setFriendItemsLoading] = useState(false);
  const [rejectedFriendItems, setRejectedFriendItems] = useState<string[]>([]);
  const [lastFriendActions, setLastFriendActions] = useState<{ type: 'like' | 'reject'; itemId: string; wasLiked?: boolean }[]>([]);

  // Matches undo state - will be set by the Matches component
  const [matchesUndoAvailable, setMatchesUndoAvailable] = useState(false);
  const [matchesUndoFn, setMatchesUndoFn] = useState<(() => void) | null>(null);

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

      // Fetch available and visible items from all friends and their profiles separately
      const { data: friendItemsData, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .in('user_id', friendIds)
        .eq('is_available', true) // Only show available items
        .eq('is_hidden', false); // Only show non-hidden items

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
          priceRangeMin: item.price_range_min,
          priceRangeMax: item.price_range_max,
          tags: item.tags,
          liked: false,
          ownerName: ownerProfile?.name || ownerProfile?.username || 'Unknown',
          ownerAvatar: ownerProfile?.avatar_url,
          user_id: item.user_id,
          userProfile: {
            name: ownerProfile?.name || ownerProfile?.username || 'Unknown',
            avatar_url: ownerProfile?.avatar_url,
            username: ownerProfile?.username
          }
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
  console.log('DEBUG: selectedUserItemId:', selectedUserItemId);
  console.log('DEBUG: userItems:', userItems);
  console.log('DEBUG: userItems.length:', userItems.length);
  
  // Auto-select first item when userItems are loaded
  useEffect(() => {
    if (userItems.length > 0 && !selectedUserItemId) {
      const firstItemId = userItems[0].id;
      console.log('🔍 Home - Auto-selecting first item:', firstItemId);
      setSelectedUserItemId(firstItemId);
      // Store in localStorage so other pages can access it
      localStorage.setItem('selectedUserItemId', firstItemId);
      // Dispatch custom event to notify other components/pages
      window.dispatchEvent(new CustomEvent('selectedItemChanged'));
    }
  }, [userItems, selectedUserItemId]);
  
  // Handle matches undo availability callback
  const handleMatchesUndoAvailable = (available: boolean, undoFn: (() => void) | null) => {
    console.log('DEBUG: handleMatchesUndoAvailable called - available:', available, 'undoFn:', undoFn);
    console.log('DEBUG: Current activeTab when callback called:', activeTab);
    setMatchesUndoAvailable(available);
    setMatchesUndoFn(() => undoFn);
  };

  // Handle friends undo availability callback
  const handleFriendsUndoAvailable = (available: boolean, undoFn: (() => void) | null) => {
    // For friends tab, undo is managed by local state, not the Matches component
    // This callback is required by the Matches component but not used for friends
  };

  // Unified undo handler that works based on active tab
  const handleUndo = () => {
    console.log('DEBUG: handleUndo called, activeTab:', activeTab);
    console.log('DEBUG: lastFriendActions.length:', lastFriendActions.length);
    console.log('DEBUG: matchesUndoAvailable:', matchesUndoAvailable);
    console.log('DEBUG: matchesUndoFn:', matchesUndoFn);
    
    if (activeTab === 'friends') {
      console.log('DEBUG: Calling handleUndoFriendAction');
      handleUndoFriendAction();
    } else if ((activeTab === 'matches' || activeTab === 'matches2' || activeTab === 'test') && matchesUndoFn) {
      console.log('DEBUG: Calling matchesUndoFn');
      matchesUndoFn();
    } else {
      console.log('DEBUG: No undo action available');
    }
  };

  // Check if undo is available based on active tab
  const isUndoAvailable = () => {
    console.log('DEBUG: isUndoAvailable called - activeTab:', activeTab);
    if (activeTab === 'friends') {
      console.log('DEBUG: Friends tab - lastFriendActions.length:', lastFriendActions.length);
      return lastFriendActions.length > 0;
    } else if (activeTab === 'matches' || activeTab === 'matches2' || activeTab === 'test') {
      console.log('DEBUG: Matches tab - matchesUndoAvailable:', matchesUndoAvailable);
      return matchesUndoAvailable;
    }
    console.log('DEBUG: No matching tab, returning false');
    return false;
  };
  // Get selected user item
  const selectedUserItem = userItems.find(item => item.id === selectedUserItemId) || null;
  console.log('DEBUG: selectedUserItem:', selectedUserItem);
  
  // Get matches for selected item (real matches from DB)
  console.log('DEBUG: About to call useMatches with selectedLocation:', selectedLocation);
  const { matches: dbMatches, loading: matchesLoading, error: matchesError, refreshMatches } = useMatches(selectedUserItem, selectedLocation);

  // Use only real matches from database
  const matches = selectedUserItem ? dbMatches : [];

  // Handle selecting a user item
  const handleSelectUserItem = (itemId: string) => {
    console.log('🔍 Home - Setting selectedUserItemId:', itemId);
    console.log('🔍 Home - Previous selectedUserItemId:', selectedUserItemId);
    console.log('🔍 Home - Item details:', userItems.find(item => item.id === itemId));
    setSelectedUserItemId(itemId);
    // Store in localStorage so other pages can access it
    localStorage.setItem('selectedUserItemId', itemId);
    console.log('🔍 Home - Stored in localStorage:', localStorage.getItem('selectedUserItemId'));
    // Dispatch custom event to notify other components/pages
    window.dispatchEvent(new CustomEvent('selectedItemChanged'));
    console.log('🔍 Home - Dispatched selectedItemChanged event');
  };

  // Handle opening item modal
  const handleOpenItemModal = (item: any) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  // Handle closing item modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex-1 p-4 md:p-6 flex flex-col h-full">

        {/* Your Items Section - Full Width */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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
        </div>

        {/* Tabs Section - Full Width */}
        <div className="flex-1 min-h-0">
          {user && supabaseConfigured ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
              <Tabs defaultValue="matches" className="h-full flex flex-col" onValueChange={(value) => {
                console.log('DEBUG: Tab changed to:', value);
                setActiveTab(value);
              }}>
                <div className="flex justify-between items-center mb-4">
                  <TabsList className="grid grid-cols-4">
                    <TabsTrigger value="matches">Matches</TabsTrigger>
                    <TabsTrigger value="matches2">Matches 2</TabsTrigger>
                    <TabsTrigger value="friends">Friends' Items</TabsTrigger>
                    <TabsTrigger value="test">🧪 Test</TabsTrigger>
                  </TabsList>
                  <div className="flex items-center gap-2">
                    {/* Only show location selector on desktop - completely hidden on mobile */}
                    <div className="hidden sm:block">
                      {(activeTab === 'matches' || activeTab === 'matches2' || activeTab === 'test') && (
                        <HeaderLocationSelector 
                          onLocationChange={(newLocation) => {
                            console.log('DEBUG: HeaderLocationSelector onChange called with:', newLocation);
                            setSelectedLocation(newLocation);
                          }}
                          initialValue={selectedLocation}
                        />
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUndo}
                      disabled={!isUndoAvailable()}
                      className="flex items-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span className="hidden md:inline">Undo</span>
                    </Button>
                  </div>
                </div>
                
                <TabsContent key={`matches-${activeTab}-${selectedUserItemId}`} value="matches" className="flex-1 mt-0">
                  {(() => {
                    console.log('DEBUG: Rendering matches tab - selectedUserItem:', selectedUserItem);
                    console.log('DEBUG: matches length:', matches.length);
                    return selectedUserItem ? (
                      <Matches
                        key={`matches-component-${selectedUserItem.id}`}
                        matches={matches}
                        selectedItemName={selectedUserItem.name}
                        onUndoAvailable={handleMatchesUndoAvailable}
                        loading={matchesLoading}
                        onRefreshMatches={refreshMatches}
                      />
                    ) : (
                      <div className="h-full flex flex-col">
                        <div className="flex-1 flex flex-col justify-center items-center text-center text-gray-500 py-8">
                          <div className="text-4xl mb-3">🔍</div>
                          <p className="text-base font-medium mb-1">No item selected</p>
                          <p className="text-sm">Select an item to see matches</p>
                        </div>
                      </div>
                    );
                  })()}
                </TabsContent>
                
                <TabsContent value="matches2" className="flex-1 mt-0">
                   {selectedUserItem ? (
                     <Matches
                       matches={matches}
                       selectedItemName={selectedUserItem.name}
                       onUndoAvailable={handleMatchesUndoAvailable}
                       loading={matchesLoading}
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
                  {friendItems.length === 0 ? (
                    <div className="h-full flex flex-col">
                      <div className="flex-1 flex flex-col justify-center items-center text-center text-gray-500 py-8">
                        <div className="text-4xl mb-3">👥</div>
                        <p className="text-base font-medium mb-1">No friends' items</p>
                        <p className="text-sm">Add friends to see their items here</p>
                      </div>
                    </div>
                  ) : (
                    <Matches
                      matches={friendItems.filter(item => !rejectedFriendItems.includes(item.id))}
                      selectedItemName="Friends' Items"
                      onUndoAvailable={handleFriendsUndoAvailable}
                      loading={friendItemsLoading}
                      onRefreshMatches={() => {}} // Friends don't need refresh like matches
                    />
                  )}
                </TabsContent>
                
                <TabsContent value="test" className="flex-1 mt-0">
                   {selectedUserItem ? (
                     <Matches
                       matches={matches}
                       selectedItemName={`Test - ${selectedUserItem.name}`}
                       onUndoAvailable={handleMatchesUndoAvailable}
                       loading={matchesLoading}
                     />
                  ) : (
                    <div className="h-full flex flex-col">
                      <div className="flex-1 flex flex-col justify-center items-center text-center text-gray-500 py-8">
                        <div className="text-4xl mb-3">🧪</div>
                        <p className="text-base font-medium mb-1">No item selected</p>
                        <p className="text-sm">Select an item to see test matches</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
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
      />
    </div>
  );
};

export default Home;
