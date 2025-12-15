
import { useState, useEffect, useCallback } from 'react';
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
  const navigate = useNavigate();
  
  // Simple state - like the home page MatchesSection
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  const [removedItems, setRemovedItems] = useState<string[]>([]);
  const [lastActions, setLastActions] = useState<{ type: 'like' | 'reject'; itemId: string; wasLiked?: boolean }[]>([]);
  const [isLoadingLikedStatus, setIsLoadingLikedStatus] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<MatchItem | null>(null);
  const [loadedForItemId, setLoadedForItemId] = useState<string | undefined>(undefined);

  // Load liked status from database - only on initial load or when selectedItemId changes
  useEffect(() => {
    // Skip if already loaded for this item
    if (loadedForItemId === selectedItemId) {
      return;
    }

    const loadLikedStatus = async () => {
      if (matches.length === 0) {
        setIsLoadingLikedStatus(false);
        return;
      }
      
      setIsLoadingLikedStatus(true);
      
      if (!user || !supabaseConfigured) {
        const initialStatus: Record<string, boolean> = {};
        matches.forEach(match => {
          initialStatus[match.id] = false;
        });
        setLikedItems(initialStatus);
        setIsLoadingLikedStatus(false);
        setLoadedForItemId(selectedItemId);
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
      
      setLikedItems(likedStatus);
      setIsLoadingLikedStatus(false);
      setLoadedForItemId(selectedItemId);
    };

    loadLikedStatus();
  }, [matches.length, user, supabaseConfigured, selectedItemId, loadedForItemId]);

  // Reset state when selectedItemId changes
  useEffect(() => {
    if (selectedItemId !== loadedForItemId && loadedForItemId !== undefined) {
      setRemovedItems([]);
      setLastActions([]);
    }
  }, [selectedItemId, loadedForItemId]);

  const handleLike = useCallback(async (id: string, global?: boolean) => {
    console.log('💖 handleLike called:', { id, global, currentLikedState: likedItems[id] });
    
    if (!user) {
      navigate('/auth');
      return;
    }

    const isCurrentlyLiked = likedItems[id] ?? false;
    const newLikedState = !isCurrentlyLiked;
    
    console.log('💖 Toggling from', isCurrentlyLiked, 'to', newLikedState);

    // Optimistic update - update state immediately
    setLikedItems(prev => ({ ...prev, [id]: newLikedState }));
    setLastActions(prev => [{ type: 'like' as const, itemId: id, wasLiked: isCurrentlyLiked }, ...prev].slice(0, 3));

    if (supabaseConfigured && isValidUUID(id)) {
      try {
        let result;
        if (isCurrentlyLiked) {
          result = await unlikeItem(id, global ? undefined : selectedItemId);
        } else {
          result = await likeItem(id, global ? undefined : selectedItemId);
        }

        // Handle mutual match result
        if (result && typeof result === 'object' && 'success' in result && result.success && !isCurrentlyLiked) {
          if ('isMatch' in result && result.isMatch && 'matchData' in result && result.matchData) {
            if (onRefreshMatches) {
              setTimeout(() => {
                console.log('🔄 REFRESHING MATCHES after mutual match creation');
                onRefreshMatches();
              }, 1000);
            }
            
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
        // Revert on error
        setLikedItems(prev => ({ ...prev, [id]: isCurrentlyLiked }));
      }
    }
  }, [user, likedItems, supabaseConfigured, selectedItemId, onRefreshMatches, navigate]);

  const handleReject = useCallback(async (id: string, global?: boolean) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Optimistic update
    setRemovedItems(prev => [...prev, id]);
    setLastActions(prev => [{ type: 'reject' as const, itemId: id }, ...prev].slice(0, 3));

    if (supabaseConfigured && isValidUUID(id)) {
      try {
        const result = await rejectItem(id, global ? undefined : selectedItemId);
        
        if (result && onRefreshMatches) {
          setTimeout(() => onRefreshMatches(), 500);
        } else if (!result) {
          // Revert on failure
          setRemovedItems(prev => prev.filter(itemId => itemId !== id));
        }
      } catch (error) {
        console.error('DB reject error:', error);
        setRemovedItems(prev => prev.filter(itemId => itemId !== id));
      }
    }
  }, [user, supabaseConfigured, selectedItemId, onRefreshMatches, navigate]);

  const handleUndo = useCallback(async () => {
    if (lastActions.length === 0) return;

    const actionToUndo = lastActions[0];

    if (actionToUndo.type === 'like') {
      setLikedItems(prev => ({ ...prev, [actionToUndo.itemId]: actionToUndo.wasLiked || false }));
      toast.success('Like action undone');
    } else if (actionToUndo.type === 'reject') {
      setRemovedItems(prev => prev.filter(id => id !== actionToUndo.itemId));
      
      if (supabaseConfigured && isValidUUID(actionToUndo.itemId)) {
        try {
          await undoRejectItem(actionToUndo.itemId, selectedItemId);
        } catch (error) {
          console.error('Error undoing rejection in database:', error);
        }
      }
      
      toast.success('Reject action undone');
    }

    setLastActions(prev => prev.slice(1));
  }, [lastActions, supabaseConfigured, selectedItemId]);

  const handleOpenModal = useCallback((id: string) => {
    const match = matches.find(m => m.id === id);
    if (match) {
      setSelectedMatch(match);
    }
  }, [matches]);

  const handlePopupLikeClick = useCallback((item: MatchItem) => {
    handleLike(item.id);
    setSelectedMatch(null);
  }, [handleLike]);

  const handleClosePopup = useCallback(() => {
    setSelectedMatch(null);
  }, []);

  const handleReport = useCallback((id: string) => {
    const match = matches.find(m => m.id === id);
    if (match) {
      setSelectedMatch({ ...match, isReportModal: true } as any);
    }
  }, [matches]);

  return {
    likedItems,
    removedItems,
    selectedMatch,
    lastActions,
    isLoadingLikedStatus,
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
