
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

  // Helper function to update state for current item - uses functional update to avoid stale state
  const updateCurrentState = (
    updater: Partial<typeof currentState> | ((prev: typeof currentState) => Partial<typeof currentState>)
  ) => {
    setStateByItem(prev => {
      const prevState = prev[stateKey] || {
        likedItems: {},
        removedItems: [],
        lastActions: [],
        isLoadingLikedStatus: false
      };
      const updates = typeof updater === 'function' ? updater(prevState) : updater;
      return {
        ...prev,
        [stateKey]: { ...prevState, ...updates }
      };
    });
  };

  // Track if we've already loaded status for this stateKey to avoid overwriting optimistic updates
  const [loadedKeys, setLoadedKeys] = useState<Set<string>>(new Set());

  // Load actual liked status from database for this specific matching session
  const loadLikedStatus = async () => {
    // If no matches, don't set loading state - just set empty state immediately
    if (matches.length === 0) {
      updateCurrentState({ likedItems: {}, isLoadingLikedStatus: false });
      return;
    }
    
    // Set loading state only when we have matches to process
    updateCurrentState({ isLoadingLikedStatus: true });
    
    if (!user || !supabaseConfigured) {
      const initialLikedStatus: Record<string, boolean> = {};
      matches.forEach(match => {
        initialLikedStatus[match.id] = false;
      });
      updateCurrentState({ likedItems: initialLikedStatus, isLoadingLikedStatus: false });
      return;
    }
    
    const likedStatus: Record<string, boolean> = {};
    for (const match of matches) {
      if (isValidUUID(match.id)) {
        try {
          const liked = await isItemLiked(match.id, selectedItemId);
          likedStatus[match.id] = liked;
        } catch (e) {
          likedStatus[match.id] = false;
        }
      } else {
        likedStatus[match.id] = false;
      }
    }
    
    updateCurrentState({ likedItems: likedStatus, isLoadingLikedStatus: false });
  };

  useEffect(() => {
    // Only load liked status on initial mount for this stateKey, not on every re-render
    // This prevents overwriting optimistic updates when user likes an item
    if (loadedKeys.has(stateKey)) {
      return;
    }
    
    loadLikedStatus();
    setLoadedKeys(prev => new Set(prev).add(stateKey));
    // eslint-disable-next-line
  }, [matches.length, user, supabaseConfigured, selectedItemId, stateKey]);

  const handleLike = async (id: string, global?: boolean) => {
    console.log('💖 handleLike called:', { id, global, stateKey });
    
    if (!user) {
      navigate('/auth');
      return;
    }

    // Get current liked state from stateByItem directly to avoid stale closure
    const currentLikedState = stateByItem[stateKey]?.likedItems?.[id] ?? false;
    console.log('💖 currentLikedState:', currentLikedState, 'will toggle to:', !currentLikedState);

    // Track the action for undo using functional update
    setStateByItem(prev => {
      const prevState = prev[stateKey] || { likedItems: {}, removedItems: [], lastActions: [], isLoadingLikedStatus: false };
      const wasLiked = prevState.likedItems[id] ?? false;
      return {
        ...prev,
        [stateKey]: {
          ...prevState,
          lastActions: [{ type: 'like' as const, itemId: id, wasLiked }, ...prevState.lastActions].slice(0, 3),
          likedItems: { ...prevState.likedItems, [id]: !wasLiked }
        }
      };
    });

    if (supabaseConfigured && isValidUUID(id)) {
      try {
        let result;
        if (currentLikedState) {
          result = await unlikeItem(id, global ? undefined : selectedItemId);
        } else {
          result = await likeItem(id, global ? undefined : selectedItemId);
        }

        // Handle mutual match result - check if result is an object with match data
        if (result && typeof result === 'object' && 'success' in result && result.success && !currentLikedState) {
          if ('isMatch' in result && result.isMatch && 'matchData' in result && result.matchData) {
            // Refresh matches after a small delay to ensure DB is fully updated
            if (onRefreshMatches) {
              setTimeout(() => {
                console.log('🔄 REFRESHING MATCHES after mutual match creation');
                onRefreshMatches();
              }, 1000);
            }
            
            // Only navigate to messages if there's a confirmed mutual match
            setTimeout(() => {
              navigate('/messages', {
                state: {
                  newMatch: true,
                  matchData: result.matchData,
                },
              });
            }, 2000);
          }
        }
      } catch (error) {
        console.error('DB like/unlike error:', error);
        // Revert optimistic update on error
        setStateByItem(prev => {
          const prevState = prev[stateKey] || { likedItems: {}, removedItems: [], lastActions: [], isLoadingLikedStatus: false };
          return {
            ...prev,
            [stateKey]: {
              ...prevState,
              likedItems: { ...prevState.likedItems, [id]: currentLikedState }
            }
          };
        });
      }
      return;
    }

    // For mock/demo items - state already updated above
  };

  // Handle rejecting an item (removing it from matches)
  const handleReject = async (id: string, global?: boolean) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Track the action for undo using functional update
    updateCurrentState(prev => ({
      lastActions: [{ type: 'reject' as const, itemId: id }, ...prev.lastActions].slice(0, 3)
    }));

    // Optimistically update local state using functional update
    updateCurrentState(prev => ({ 
      removedItems: [...prev.removedItems, id] 
    }));

    if (supabaseConfigured && isValidUUID(id)) {
      try {
        const result = await rejectItem(id, global ? undefined : selectedItemId);
        
        if (result) {
          // Refresh matches to apply bidirectional filtering
          if (onRefreshMatches) {
            setTimeout(() => onRefreshMatches(), 500); // Small delay to ensure DB is updated
          }
        } else {
          // Revert optimistic update on error using functional update
          updateCurrentState(prev => ({ 
            removedItems: prev.removedItems.filter(itemId => itemId !== id) 
          }));
        }
      } catch (error) {
        console.error('DB reject error:', error);
        // Revert optimistic update on error using functional update
        updateCurrentState(prev => ({ 
          removedItems: prev.removedItems.filter(itemId => itemId !== id) 
        }));
      }
    }
  };

  // Handle undo last action
  const handleUndo = async () => {
    if (currentState.lastActions.length === 0) return;

    const actionToUndo = currentState.lastActions[0]; // Get most recent action

    if (actionToUndo.type === 'like') {
      // Undo like action - revert to previous liked state using functional update
      updateCurrentState(prev => ({ 
        likedItems: { ...prev.likedItems, [actionToUndo.itemId]: actionToUndo.wasLiked || false } 
      }));
      toast.success('Like action undone');
    } else if (actionToUndo.type === 'reject') {
      // Undo reject action - restore item to matches using functional update
      updateCurrentState(prev => ({ 
        removedItems: prev.removedItems.filter(id => id !== actionToUndo.itemId) 
      }));
      
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

    // Remove the undone action from the list using functional update
    updateCurrentState(prev => ({ 
      lastActions: prev.lastActions.slice(1) 
    }));
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
