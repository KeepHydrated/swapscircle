
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
  handleLike: (id: string) => void;
  handleReject: (id: string) => void;
  handleUndo: () => void;
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
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  const [removedItems, setRemovedItems] = useState<string[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchItem | null>(null);
  const [lastActions, setLastActions] = useState<{ type: 'like' | 'reject'; itemId: string; wasLiked?: boolean }[]>([]);
  const navigate = useNavigate();

  // Load actual liked status from database for this specific matching session
  const loadLikedStatus = async () => {
    console.log('DEBUG: loadLikedStatus called with matches:', matches.length);
    
    if (!user || !supabaseConfigured || matches.length === 0) {
      console.log('DEBUG: Early return - no user, supabase, or matches');
      const initialLikedStatus: Record<string, boolean> = {};
      matches.forEach(match => {
        initialLikedStatus[match.id] = false;
      });
      setLikedItems(initialLikedStatus);
      return;
    }
    
    console.log('DEBUG: Loading liked status for matches:', matches.map(m => m.id));
    
    const likedStatus: Record<string, boolean> = {};
    for (const match of matches) {
      if (isValidUUID(match.id)) {
        try {
          const liked = await isItemLiked(match.id);
          likedStatus[match.id] = liked;
          console.log(`DEBUG: Item ${match.id} liked status: ${liked}`);
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
    setLikedItems(likedStatus);
  };

  useEffect(() => {
    loadLikedStatus();
    // eslint-disable-next-line
  }, [matches, user, supabaseConfigured]);

  const handleLike = async (id: string) => {
    console.log('🚀 handleLike called with id:', id);
    console.log('🚀 User:', user?.id);
    console.log('🚀 Supabase configured:', supabaseConfigured);
    
    if (!user) {
      toast.error('Please log in to like items');
      return;
    }

    const isCurrentlyLiked = likedItems[id];

    // Track the action for undo (keep only last 3 actions)
    setLastActions(prev => {
      const newAction = { type: 'like' as const, itemId: id, wasLiked: isCurrentlyLiked };
      const updated = [newAction, ...prev];
      return updated.slice(0, 3); // Keep only last 3 actions
    });

    if (supabaseConfigured && isValidUUID(id)) {
      // Optimistically update
      setLikedItems(prev => ({ ...prev, [id]: !isCurrentlyLiked }));

      try {
        let result;
        if (isCurrentlyLiked) {
          result = await unlikeItem(id);
          console.log('🔄 Unlike result:', result);
        } else {
          result = await likeItem(id, selectedItemId);
          console.log('🔄 Like result:', result);
        }

        // Keep the optimistic update - no need to reload from DB

        // Handle mutual match result - check if result is an object with match data
        console.log('🔍 Checking mutual match result:', { result, isCurrentlyLiked });
        if (result && typeof result === 'object' && 'success' in result && result.success && !isCurrentlyLiked) {
          console.log('✅ Result has success=true, checking for match data...');
          if ('isMatch' in result && result.isMatch && 'matchData' in result && result.matchData) {
            console.log('🎉 MUTUAL MATCH DETECTED!', result.matchData);
            toast.success('It\'s a match! Redirecting to messages...');
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
          }
        } else {
          console.log('❌ Result check failed:', { 
            hasResult: !!result, 
            isObject: typeof result === 'object',
            hasSuccess: result && 'success' in result,
            successValue: result && 'success' in result ? result.success : 'N/A',
            isCurrentlyLiked 
          });
        }
      } catch (error) {
        console.error('DB like/unlike error:', error);
        // Revert optimistic update on error
        setLikedItems(prev => ({ ...prev, [id]: isCurrentlyLiked }));
      }
      return;
    }

    // For mock/demo items (non-UUID): do only local toggle
    setLikedItems(prev => ({ ...prev, [id]: !isCurrentlyLiked }));
    toast.info('Like/unlike works only for real items (not demo items)!');
  };

  // Handle rejecting an item (removing it from matches)
  const handleReject = async (id: string) => {
    console.log('DEBUG: handleReject called with id:', id);
    
    if (!user) {
      toast.error('Please log in to reject items');
      return;
    }

    // Track the action for undo (keep only last 3 actions)
    setLastActions(prev => {
      const newAction = { type: 'reject' as const, itemId: id };
      const updated = [newAction, ...prev];
      return updated.slice(0, 3); // Keep only last 3 actions
    });

    // Optimistically update local state
    setRemovedItems(prev => [...prev, id]);

    if (supabaseConfigured && isValidUUID(id)) {
      try {
        console.log('DEBUG: About to call rejectItem for:', id, 'myItemId:', selectedItemId);
        const result = await rejectItem(id, selectedItemId);
        console.log('DEBUG: rejectItem result:', result);
        
        if (result) {
          toast.success('Item removed from matches');
          // Refresh matches to apply bidirectional filtering
          if (onRefreshMatches) {
            setTimeout(() => onRefreshMatches(), 500); // Small delay to ensure DB is updated
          }
        } else {
          // Revert optimistic update on error
          setRemovedItems(prev => prev.filter(itemId => itemId !== id));
          toast.error('Failed to reject item');
        }
      } catch (error) {
        console.error('DB reject error:', error);
        // Revert optimistic update on error
        setRemovedItems(prev => prev.filter(itemId => itemId !== id));
        toast.error('Failed to reject item');
      }
    } else {
      toast.success('Item removed from matches');
    }
  };

  // Handle undo last action
  const handleUndo = async () => {
    if (lastActions.length === 0) return;

    const actionToUndo = lastActions[0]; // Get most recent action

    if (actionToUndo.type === 'like') {
      // Undo like action - revert to previous liked state
      setLikedItems(prev => ({ 
        ...prev, 
        [actionToUndo.itemId]: actionToUndo.wasLiked || false 
      }));
      toast.success('Like action undone');
    } else if (actionToUndo.type === 'reject') {
      // Undo reject action - restore item to matches
      setRemovedItems(prev => prev.filter(id => id !== actionToUndo.itemId));
      
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
    setLastActions(prev => prev.slice(1));
  };

  const handleOpenModal = (id: string) => {
    const match = matches.find(m => m.id === id);
    if (match) {
      setSelectedMatch(match);
    }
  };

  const handlePopupLikeClick = (item: MatchItem) => {
    handleLike(item.id);
    setSelectedMatch(null);
  };

  const handleClosePopup = () => {
    setSelectedMatch(null);
  };

  return {
    likedItems,
    removedItems,
    selectedMatch,
    lastActions,
    handleLike,
    handleReject,
    handleUndo,
    handleOpenModal,
    handlePopupLikeClick,
    handleClosePopup,
    setSelectedMatch
  };
};
