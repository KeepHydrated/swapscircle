

import React, { useState, useEffect, useCallback } from 'react';
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
import { ReportItemModal } from '@/components/items/ReportItemModal';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { MatchItem } from '@/types/item';
import { supabase } from '@/integrations/supabase/client';
import { likeItem, unlikeItem } from '@/services/authService';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { blockingService } from '@/services/blockingService';

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
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [itemToReport, setItemToReport] = useState<string | null>(null);

  // Fetch friends' items
  const fetchFriendsItems = async () => {
    if (!user) return;
    
    setFriendItemsLoading(true);
    try {
      // Get blocked users to filter them out
      const blockedUsers = await blockingService.getBlockedUsers();
      const usersWhoBlockedMe = await blockingService.getUsersWhoBlockedMe();
      const allBlockedUserIds = [...blockedUsers, ...usersWhoBlockedMe];

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

      // Get friend user IDs (excluding current user and blocked users)
      const friendIds = friendRequests
        .map(req => req.requester_id === user.id ? req.recipient_id : req.requester_id)
        .filter(friendId => !allBlockedUserIds.includes(friendId));

      // If no non-blocked friends, return empty array
      if (friendIds.length === 0) {
        setFriendItems([]);
        return;
      }

      console.log('🔥 FRIENDS DEBUG: Found friend IDs:', friendIds);

      // Get all mutual matches to exclude them from friends' items
      const { data: mutualMatches, error: mutualMatchesError } = await supabase
        .from('mutual_matches')
        .select('user1_item_id, user2_item_id')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (mutualMatchesError) {
        console.error('Error fetching mutual matches:', mutualMatchesError);
      }

      // Extract all matched item IDs to filter out
      const matchedItemIds = new Set();
      mutualMatches?.forEach(match => {
        matchedItemIds.add(match.user1_item_id);
        matchedItemIds.add(match.user2_item_id);
      });

      console.log('🔥 FRIENDS DEBUG: Matched item IDs to exclude:', Array.from(matchedItemIds));

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

      // Filter out mutual matches from friend items
      const unMatchedFriendItems = friendItemsData?.filter(item => 
        !matchedItemIds.has(item.id)
      ) || [];

      console.log('🔥 FRIENDS DEBUG: Friend items before filtering:', friendItemsData?.length || 0);
      console.log('🔥 FRIENDS DEBUG: Friend items after filtering out matches:', unMatchedFriendItems.length);

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

      // Format items for the carousel (using filtered items)
      const formattedFriendItems = unMatchedFriendItems?.map(item => {
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
  const handleLikeFriendItem = async (itemId: string, global?: boolean) => {
    if (!user) {
      navigate('/auth');
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
        result = await unlikeItem(itemId, global ? undefined : selectedUserItemId);
        const message = global ? 'Removed from favorites for all your items' : 'Removed from favorites';
        toast.success(message);
      } else {
        result = await likeItem(itemId, global ? undefined : selectedUserItemId);
        
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
            const message = global ? 'Added to favorites for all your items' : 'Added to favorites';
            toast.success(message);
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
  const handleRejectFriendItem = (itemId: string, global?: boolean) => {
    // Track the action for undo (keep only last 3 actions)
    setLastFriendActions(prev => {
      const newAction = { type: 'reject' as const, itemId };
      const updated = [newAction, ...prev];
      return updated.slice(0, 3); // Keep only last 3 actions
    });
    setRejectedFriendItems(prev => [...prev, itemId]);
    const message = global ? 'Item rejected for all your items' : 'Item removed from friends\' items';
    toast.success(message);
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
  const { items: userItems, loading: userItemsLoading, error: userItemsError } = useUserItems(false); // Don't include drafts on test page
  
  console.log('🔍 USER ITEMS: Hook results', {
    userItemsLength: userItems.length,
    userItemsLoading,
    userItemsError,
    firstItemId: userItems[0]?.id,
    firstItemName: userItems[0]?.name
  });
  
  // Selected items state - auto-select first item
  const [selectedUserItemId, setSelectedUserItemId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('matches');
  const [selectedLocation, setSelectedLocation] = useState('nationwide');
  
  // Matches undo state - will be set by the Matches component
  const [matchesUndoAvailable, setMatchesUndoAvailable] = useState(false);
  const [matchesUndoFn, setMatchesUndoFn] = useState<(() => void) | null>(null);
  
  // Auto-select first item when userItems are loaded
  useEffect(() => {
    console.log('🔍 AUTO-SELECT: useEffect triggered', {
      userItemsLength: userItems.length,
      selectedUserItemId,
      firstItemId: userItems[0]?.id,
      firstItemName: userItems[0]?.name
    });
    if (userItems.length > 0 && !selectedUserItemId) {
      console.log('🔍 AUTO-SELECT: Setting selected item to:', userItems[0].id, userItems[0].name);
      setSelectedUserItemId(userItems[0].id);
    }
  }, [userItems, selectedUserItemId]);
  
  // Get selected user item
  const selectedUserItem = userItems.find(item => item.id === selectedUserItemId) || null;
  
  console.log('🔍 SELECTION DEBUG:', {
    selectedUserItemId,
    selectedUserItem: selectedUserItem ? { id: selectedUserItem.id, name: selectedUserItem.name } : null,
    userItemsCount: userItems.length,
    firstUserItem: userItems[0] ? { id: userItems[0].id, name: userItems[0].name } : null
  });
  
  // Get matches for selected item (real matches from DB)
  const { matches: dbMatches, loading: matchesLoading, error: matchesError } = useMatches(selectedUserItem, selectedLocation);

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

  // Handle report functionality
  const handleReport = (itemId: string) => {
    setItemToReport(itemId);
    setReportModalOpen(true);
  };

  const handleCloseReportModal = () => {
    setReportModalOpen(false);
    setItemToReport(null);
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

  // Handle matches undo availability callback
  const handleMatchesUndoAvailable = useCallback((available: boolean, undoFn: (() => void) | null) => {
    setMatchesUndoAvailable(available);
    setMatchesUndoFn(() => undoFn);
  }, []);

  // Unified undo handler that works based on active tab
  const handleUndo = () => {
    if (activeTab === 'friends') {
      handleUndoFriendAction();
    } else if (activeTab === 'matches' && matchesUndoFn) {
      matchesUndoFn();
    }
  };

  // Check if undo is available based on active tab
  const isUndoAvailable = () => {
    if (activeTab === 'friends') {
      return lastFriendActions.length > 0;
    } else if (activeTab === 'matches') {
      return matchesUndoAvailable;
    }
    return false;
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
                              onReport={handleReport}
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
                          onLocationChange={(value) => {
                            console.log('Location changed to:', value);
                            setSelectedLocation(value);
                          }}
                          initialValue={selectedLocation}
                          className="hidden md:block"
                        />
                      )}
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
                  
                  {/* Location selector below tabs - only shown on mobile for matches tab */}
                  {activeTab === 'matches' && (
                    <div className="mb-4 md:hidden">
                      <HeaderLocationSelector 
                        onLocationChange={(value) => {
                          console.log('Location changed to:', value);
                          setSelectedLocation(value);
                        }}
                        initialValue={selectedLocation}
                      />
                    </div>
                  )}
                  
                  
                   <TabsContent value="matches" className="flex-1 mt-0">
                     {selectedUserItem ? (
                        <Matches
                          matches={matches}
                          selectedItemName={selectedUserItem.name}
                          selectedItemId={selectedUserItem.id}
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
                       <div className="h-full flex flex-col">
                       {friendItemsLoading ? (
                         <div className="overflow-x-auto overflow-y-hidden p-2">
                           <div className="flex gap-2 min-w-max">
                             {Array.from({ length: 3 }).map((_, index) => (
                               <div key={`friend-skeleton-${index}`} className="flex-shrink-0 w-64">
                                 <Card className="overflow-hidden">
                                   <Skeleton className="aspect-[4/3] w-full" />
                                   <div className="p-3">
                                     <Skeleton className="h-4 w-3/4 mx-auto" />
                                   </div>
                                 </Card>
                               </div>
                             ))}
                           </div>
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
                                  onLike={(id, global) => handleLikeFriendItem(id, global)}
                                  onReject={(id, global) => handleRejectFriendItem(id, global)}
                                  onReport={handleReport}
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
      
      {/* Report Item Modal */}
      <ReportItemModal
        isOpen={reportModalOpen}
        onClose={handleCloseReportModal}
        itemId={itemToReport || ''}
        itemName={
          itemToReport 
            ? (friendItems.find(item => item.id === itemToReport)?.name || 
               userItems.find(item => item.id === itemToReport)?.name || 
               'Unknown Item')
            : ''
        }
      />
    </div>
  );
};

export default Test;
