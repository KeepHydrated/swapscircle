
import { useState, useEffect } from 'react';
import { MatchItem } from '@/types/item';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { likeItem, unlikeItem, isItemLiked } from '@/services/authService';
import { rejectItem, undoRejectItem } from '@/services/rejectionService';
import { useAuth } from '@/context/AuthContext';

// Helper to determine if a string is a valid UUID (for DB-backed items)
const isValidUUID = (str: string) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
};

export interface UseMatchActionsResult {
  likedItems: Record<string, boolean>;
  removedItems: string[];
  selectedMatch: MatchItem | null;
  lastActions: { type: 'like' | 'reject'; itemId: string; wasLiked?: boolean }[];
  isLoadingLikedStatus: boolean;
  handleLike: (id: string, global?: boolean) => void;
  handleReject: (id: string, global?: boolean) => void;
  handleUndo: () => void;
  handleReport: (id: string) => void;
  handleOpenModal: (id: string) => void;
  handlePopupLikeClick: (item: MatchItem) => void;
  handleClosePopup: () => void;
  setSelectedMatch: (match: MatchItem | null) => void;
}

export const useMatchActions = (
  matches: MatchItem[],
  onRefreshMatches?: () => void,
  selectedItemId?: string
): UseMatchActionsResult => {
  const { user, supabaseConfigured } = useAuth();
  // Key the state to selectedItemId to ensure isolation between different items
  const stateKey = selectedItemId || 'default';
  const [stateByItem, setStateByItem] = useState<Record<string, {
    likedItems: Record<string, boolean>;
    removedItems: string[];
    lastActions: { type: 'like' | 'reject'; itemId: string; wasLiked?: boolean }[];
    isLoadingLikedStatus: boolean;
  }>>({});
  
  const currentState = stateByItem[stateKey] || {
    likedItems: {},
    removedItems: [],
    lastActions: [],
    isLoadingLikedStatus: matches.length > 0 // Only set loading to true if there are actually matches to load
  };

  const [selectedMatch, setSelectedMatch] = useState<MatchItem | null>(null);
  const navigate = useNavigate();

  // Helper function to update state for current item
  const updateCurrentState = (updates: Partial<typeof currentState>) => {
    setStateByItem(prev => ({
      ...prev,
      [stateKey]: { ...currentState, ...updates }
    }));
  };

  // Load actual liked status from database for this specific matching session
  const loadLikedStatus = async () => {
    console.log('DEBUG: loadLikedStatus called with matches:', matches.length);
    
    // If no matches, don't set loading state - just set empty state immediately
    if (matches.length === 0) {
      console.log('DEBUG: No matches to load, setting empty state immediately');
      updateCurrentState({ likedItems: {}, isLoadingLikedStatus: false });
      return;
    }
    
    // Set loading state only when we have matches to process
    updateCurrentState({ isLoadingLikedStatus: true });
    
    if (!user || !supabaseConfigured) {
      console.log('DEBUG: Early return - no user or supabase');
      const initialLikedStatus: Record<string, boolean> = {};
      matches.forEach(match => {
        initialLikedStatus[match.id] = false;
      });
      updateCurrentState({ likedItems: initialLikedStatus, isLoadingLikedStatus: false });
      return;
    }
    
    console.log('DEBUG: Loading liked status for matches:', matches.map(m => m.id));
    
    const likedStatus: Record<string, boolean> = {};
    for (const match of matches) {
      if (isValidUUID(match.id)) {
        try {
          const liked = await isItemLiked(match.id, selectedItemId);
          likedStatus[match.id] = liked;
          console.log(`DEBUG: Item ${match.id} liked status: ${liked} for selectedItem: ${selectedItemId}`);
        } catch (e) {
          likedStatus[match.id] = false;
          console.log(`DEBUG: Error checking liked status for ${match.id}:`, e);
        }
      } else {
        likedStatus[match.id] = false;
        console.log(`DEBUG: Invalid UUID for ${match.id}`);
      }
    }
    
    console.log('DEBUG: Final liked status:', JSON.stringify(likedStatus, null, 2));
    updateCurrentState({ likedItems: likedStatus, isLoadingLikedStatus: false });
  };

  useEffect(() => {
    console.log('🚨 FLASH DEBUG: useMatchActions effect triggered:', {
      matchesLength: matches.length,
      userId: user?.id,
      supabaseConfigured,
      selectedItemId,
      stateKey
    });
    loadLikedStatus();
    // eslint-disable-next-line
  }, [matches, user, supabaseConfigured, selectedItemId, stateKey]);

  const handleLike = async (id: string, global?: boolean) => {
    console.log('🚀 handleLike called with id:', id);
    console.log('🚀 User:', user?.id);
    console.log('🚀 Supabase configured:', supabaseConfigured);
    
    if (!user) {
      navigate('/auth');
      return;
    }

    const isCurrentlyLiked = currentState.likedItems[id];

    // Track the action for undo (keep only last 3 actions)
    const newAction = { type: 'like' as const, itemId: id, wasLiked: isCurrentlyLiked };
    const updatedActions = [newAction, ...currentState.lastActions].slice(0, 3);
    updateCurrentState({ lastActions: updatedActions });

    if (supabaseConfigured && isValidUUID(id)) {
      // Optimistically update
      updateCurrentState({ 
        likedItems: { ...currentState.likedItems, [id]: !isCurrentlyLiked } 
      });

      try {
        let result;
        if (isCurrentlyLiked) {
          result = await unlikeItem(id, global ? undefined : selectedItemId);
          console.log('🔄 Unlike result:', result);
        } else {
          result = await likeItem(id, global ? undefined : selectedItemId);
          console.log('🔄 Like result:', result);
        }

        // Keep the optimistic update - no need to reload from DB
        
        // Show appropriate success message
        if (!isCurrentlyLiked) {
          const likeMessage = global ? 'Item liked for all your items' : 'Item liked!';
          // Don't show like message if we're about to show match message
        }

        // Handle mutual match result - check if result is an object with match data
        console.log('🔍 Checking mutual match result:', { result, isCurrentlyLiked });
        if (result && typeof result === 'object' && 'success' in result && result.success && !isCurrentlyLiked) {
          console.log('✅ Result has success=true, checking for match data...');
          if ('isMatch' in result && result.isMatch && 'matchData' in result && result.matchData) {
            console.log('🎉 MUTUAL MATCH DETECTED!', result.matchData);
            // Only navigate to messages if there's a confirmed mutual match
            setTimeout(() => {
              console.log('🚀 Navigating to messages with match data');
              navigate('/messages', {
                state: {
                  newMatch: true,
                  matchData: result.matchData,
                },
              });
            }, 2000); // Give user time to see the success message
          } else {
            console.log('❌ No mutual match detected');
            // Show like message since no match occurred
            const likeMessage = global ? 'Item liked for all your items' : 'Item liked!';
            toast.success(likeMessage);
          }
        } else {
          console.log('❌ Result check failed:', { 
            hasResult: !!result, 
            isObject: typeof result === 'object',
            hasSuccess: result && 'success' in result,
            successValue: result && 'success' in result ? result.success : 'N/A',
            isCurrentlyLiked 
          });
          
          // Show like message if no match occurred
          if (!isCurrentlyLiked) {
            const likeMessage = global ? 'Item liked for all your items' : 'Item liked!';
            toast.success(likeMessage);
          }
        }
      } catch (error) {
        console.error('DB like/unlike error:', error);
        // Revert optimistic update on error
        updateCurrentState({ 
          likedItems: { ...currentState.likedItems, [id]: isCurrentlyLiked } 
        });
      }
      return;
    }

    // For mock/demo items (non-UUID): do only local toggle
    updateCurrentState({ 
      likedItems: { ...currentState.likedItems, [id]: !isCurrentlyLiked } 
    });
    toast.info('Like/unlike works only for real items (not demo items)!');
  };

  // Handle rejecting an item (removing it from matches)
  const handleReject = async (id: string, global?: boolean) => {
    console.log('DEBUG: handleReject called with id:', id);
    
    if (!user) {
      navigate('/auth');
      return;
    }

    // Track the action for undo (keep only last 3 actions)
    const newAction = { type: 'reject' as const, itemId: id };
    const updatedActions = [newAction, ...currentState.lastActions].slice(0, 3);
    updateCurrentState({ lastActions: updatedActions });

    // Optimistically update local state
    updateCurrentState({ 
      removedItems: [...currentState.removedItems, id] 
    });

    if (supabaseConfigured && isValidUUID(id)) {
      try {
        console.log('DEBUG: About to call rejectItem for:', id, 'myItemId:', global ? undefined : selectedItemId);
        const result = await rejectItem(id, global ? undefined : selectedItemId);
        console.log('DEBUG: rejectItem result:', result);
        
        if (result) {
          const message = global ? 'Item rejected for all your items' : 'Item removed from matches';
          toast.success(message);
          // Refresh matches to apply bidirectional filtering
          if (onRefreshMatches) {
            setTimeout(() => onRefreshMatches(), 500); // Small delay to ensure DB is updated
          }
        } else {
          // Revert optimistic update on error
          updateCurrentState({ 
            removedItems: currentState.removedItems.filter(itemId => itemId !== id) 
          });
          toast.error('Failed to reject item');
        }
      } catch (error) {
        console.error('DB reject error:', error);
        // Revert optimistic update on error
        updateCurrentState({ 
          removedItems: currentState.removedItems.filter(itemId => itemId !== id) 
        });
        toast.error('Failed to reject item');
      }
    } else {
      toast.success('Item removed from matches');
    }
  };

  // Handle undo last action
  const handleUndo = async () => {
    if (currentState.lastActions.length === 0) return;

    const actionToUndo = currentState.lastActions[0]; // Get most recent action

    if (actionToUndo.type === 'like') {
      // Undo like action - revert to previous liked state
      updateCurrentState({ 
        likedItems: { ...currentState.likedItems, [actionToUndo.itemId]: actionToUndo.wasLiked || false } 
      });
      toast.success('Like action undone');
    } else if (actionToUndo.type === 'reject') {
      // Undo reject action - restore item to matches
      updateCurrentState({ 
        removedItems: currentState.removedItems.filter(id => id !== actionToUndo.itemId) 
      });
      
      // Also undo in database if it was persisted
      if (supabaseConfigured && isValidUUID(actionToUndo.itemId)) {
        try {
          await undoRejectItem(actionToUndo.itemId, selectedItemId);
        } catch (error) {
          console.error('Error undoing rejection in database:', error);
        }
      }
      
      toast.success('Reject action undone');
    }

    // Remove the undone action from the list
    updateCurrentState({ 
      lastActions: currentState.lastActions.slice(1) 
    });
  };

  const handleOpenModal = (id: string) => {
    console.log('🔍 MODAL DEBUG: handleOpenModal called with id:', id);
    const match = matches.find(m => m.id === id);
    console.log('🔍 MODAL DEBUG: Found match:', match);
    if (match) {
      console.log('🔍 MODAL DEBUG: Setting selected match:', match);
      setSelectedMatch(match);
    } else {
      console.log('🔍 MODAL DEBUG: No match found for id:', id);
    }
  };

  const handlePopupLikeClick = (item: MatchItem) => {
    handleLike(item.id);
    setSelectedMatch(null);
  };

  const handleClosePopup = () => {
    setSelectedMatch(null);
  };

  const handleReport = (id: string) => {
    const match = matches.find(m => m.id === id);
    if (match) {
      // Set a special state to trigger the report modal
      setSelectedMatch({ ...match, isReportModal: true } as any);
    }
  };

  return {
    likedItems: currentState.likedItems,
    removedItems: currentState.removedItems,
    selectedMatch,
    lastActions: currentState.lastActions,
    isLoadingLikedStatus: currentState.isLoadingLikedStatus,
    handleLike,
    handleReject,
    handleUndo,
    handleOpenModal,
    handlePopupLikeClick,
    handleClosePopup,
    handleReport,
    setSelectedMatch
  };
};
