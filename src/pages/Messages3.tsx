import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import Header from '@/components/layout/Header';
import HeaderLocationSelector from '@/components/layout/HeaderLocationSelector';

import { useUserItems } from '@/hooks/useUserItems';
import ItemCard from '@/components/items/ItemCard';
import ExploreItemModal from '@/components/items/ExploreItemModal';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { likeItem, unlikeItem, fetchItemsWhoLikedMyItem } from '@/services/authService';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import SupportChat from '@/components/chat/SupportChat';

const Messages3: React.FC = () => {
  // User's authentication and navigation
  const { user, supabaseConfigured } = useAuth();
  const navigate = useNavigate();
  
  // Selected items state - needs to be declared early
  const [selectedUserItemId, setSelectedUserItemId] = useState<string>('');
  
  // Items that liked the user's items
  const [likedItems, setLikedItems] = useState([]);
  const [likedItemsLoading, setLikedItemsLoading] = useState(false);
  const [rejectedLikedItems, setRejectedLikedItems] = useState<string[]>([]);
  const [lastLikedActions, setLastLikedActions] = useState<{ type: 'like' | 'reject'; itemId: string; wasLiked?: boolean }[]>([]);

  // Modal state
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch items that have liked the selected user item
  const fetchLikedItems = async (itemId: string) => {
    if (!user || !itemId) {
      setLikedItems([]);
      return;
    }
    
    setLikedItemsLoading(true);
    try {
      console.log('🔍 Fetching items that liked item:', itemId);
      const itemsWhoLiked = await fetchItemsWhoLikedMyItem(itemId);
      console.log('📋 Items that liked this item:', itemsWhoLiked);
      setLikedItems(itemsWhoLiked);
    } catch (error) {
      console.error('Error fetching liked items:', error);
      setLikedItems([]);
    } finally {
      setLikedItemsLoading(false);
    }
  };

  // Fetch liked items when user or selected item changes
  useEffect(() => {
    if (user && supabaseConfigured && selectedUserItemId) {
      fetchLikedItems(selectedUserItemId);
    } else {
      setLikedItems([]);
    }
  }, [user, supabaseConfigured, selectedUserItemId]);

  // Define handler for liking items with mutual matching
  const handleLikeItem = async (itemId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const currentItem = likedItems.find(item => item.id === itemId);
    if (!currentItem) return;

    // Track the action for undo (keep only last 3 actions)
    setLastLikedActions(prev => {
      const newAction = { type: 'like' as const, itemId, wasLiked: currentItem.liked };
      const updated = [newAction, ...prev];
      return updated.slice(0, 3); // Keep only last 3 actions
    });

    // Optimistically update UI
    setLikedItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, liked: !item.liked } : item
      )
    );

    try {
      const isCurrentlyLiked = currentItem.liked;
      let result;
      
      if (isCurrentlyLiked) {
        result = await unlikeItem(itemId);
        toast.success("Item unliked");
      } else {
        result = await likeItem(itemId);
        
        // Check for mutual match result
        if (result && typeof result === 'object' && 'success' in result && result.success) {
          if ('isMatch' in result && result.isMatch && 'matchData' in result && result.matchData) {
            // Keep single match toast handled in authService; just navigate
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
            toast.success("Item liked");
          }
        }
      }
    } catch (error) {
      console.error('Error liking item:', error);
      // Revert optimistic update on error
      setLikedItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, liked: currentItem.liked } : item
        )
      );
      toast.error('Failed to update like status');
    }
  };

  // Handle rejecting items
  const handleRejectItem = (itemId: string) => {
    // Track the action for undo (keep only last 3 actions)
    setLastLikedActions(prev => {
      const newAction = { type: 'reject' as const, itemId };
      const updated = [newAction, ...prev];
      return updated.slice(0, 3); // Keep only last 3 actions
    });
    setRejectedLikedItems(prev => [...prev, itemId]);
    toast.success('Item removed');
  };

  // Handle undo for items
  const handleUndoAction = () => {
    if (lastLikedActions.length === 0) return;

    const actionToUndo = lastLikedActions[0]; // Get most recent action

    if (actionToUndo.type === 'like') {
      // Undo like action - revert to previous liked state
      setLikedItems(prev =>
        prev.map(item =>
          item.id === actionToUndo.itemId 
            ? { ...item, liked: actionToUndo.wasLiked || false }
            : item
        )
      );
      toast.success('Like action undone');
    } else if (actionToUndo.type === 'reject') {
      // Undo reject action - restore item
      setRejectedLikedItems(prev => prev.filter(id => id !== actionToUndo.itemId));
      toast.success('Reject action undone');
    }

    // Remove the undone action from the list
    setLastLikedActions(prev => prev.slice(1));
  };

  // User's items
  const { items: userItems, loading: userItemsLoading, error: userItemsError } = useUserItems(false);
  
  // Auto-select first item when userItems are loaded
  useEffect(() => {
    if (userItems.length > 0 && !selectedUserItemId) {
      setSelectedUserItemId(userItems[0].id);
    }
  }, [userItems, selectedUserItemId]);

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

  // Get displayed items (excluding rejected ones)
  const displayedItems = likedItems.filter(item => !rejectedLikedItems.includes(item.id));
  
  // Find current index in displayed items
  const currentItemIndex = selectedItem 
    ? displayedItems.findIndex(item => item.id === selectedItem.id)
    : -1;

  // Navigation functions for items
  const navigateToPrevItem = () => {
    if (currentItemIndex > 0) {
      const prevItem = displayedItems[currentItemIndex - 1];
      if (prevItem) {
        setSelectedItem(prevItem);
      }
    }
  };

  const navigateToNextItem = () => {
    if (currentItemIndex < displayedItems.length - 1) {
      const nextItem = displayedItems[currentItemIndex + 1];
      if (nextItem) {
        setSelectedItem(nextItem);
      }
    }
  };

  // Check if undo is available
  const isUndoAvailable = () => {
    return lastLikedActions.length > 0;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex-1 p-4 md:p-6 flex flex-col h-full">

        {/* Main Content */}
        <div className="flex-1 min-h-0">
          {user && supabaseConfigured ? (
            <div className="grid grid-cols-1 gap-6 h-full">
              {/* Your Items Section */}
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
                    <p className="text-sm">Post an item to see who likes it!</p>
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

              {/* Who Liked You Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-medium text-gray-600">See Who's Liked You</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUndoAction}
                      disabled={!isUndoAvailable()}
                      className="flex items-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span className="hidden md:inline">Undo</span>
                    </Button>
                  </div>
                  
                  <div className="flex-1 min-h-0">
                    {likedItemsLoading ? (
                      <div className="flex-1 flex justify-center items-center">
                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    ) : likedItems.length === 0 ? (
                      <div className="flex-1 flex flex-col justify-center items-center text-center text-gray-500 py-8">
                        <div className="text-4xl mb-3">💝</div>
                        <p className="text-base font-medium mb-1">No one has liked your items yet</p>
                        <p className="text-sm">Post more items to get more likes!</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto overflow-y-hidden p-2">
                        <div className="flex gap-2 min-w-max">
                          {likedItems
                            .filter(item => !rejectedLikedItems.includes(item.id))
                            .map((item) => (
                            <div key={item.id} className="flex-shrink-0 w-64 transform transition-all duration-200 hover:scale-105">
                              <ItemCard
                                id={item.id}
                                name={item.name}
                                image={item.image}
                                liked={item.liked}
                                onSelect={() => handleOpenItemModal(item)}
                                onLike={() => handleLikeItem(item.id)}
                                onReject={() => handleRejectItem(item.id)}
                                showLikeButton={true}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="text-4xl mb-3">🔐</div>
              <p className="text-base font-medium mb-1">Please log in</p>
              <p className="text-sm">Sign in to see who's liked your items</p>
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
        onLike={() => selectedItem && handleLikeItem(selectedItem.id)}
        onNavigatePrev={navigateToPrevItem}
        onNavigateNext={navigateToNextItem}
        currentIndex={currentItemIndex}
        totalItems={displayedItems.length}
      />
      <SupportChat />
    </div>
  );
};

export default Messages3;
