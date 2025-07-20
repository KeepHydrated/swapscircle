
import { useState, useEffect } from 'react';
import { MatchItem } from '@/types/item';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { likeItem, unlikeItem, isItemLiked } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';

// Helper to determine if a string is a valid UUID (for DB-backed items)
const isValidUUID = (str: string) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
};

export interface UseMatchActionsResult {
  likedItems: Record<string, boolean>;
  removedItems: string[];
  selectedMatch: MatchItem | null;
  handleLike: (id: string) => void;
  handleOpenModal: (id: string) => void;
  handlePopupLikeClick: (item: MatchItem) => void;
  handleClosePopup: () => void;
  setSelectedMatch: (match: MatchItem | null) => void;
}

export const useMatchActions = (
  matches: MatchItem[]
): UseMatchActionsResult => {
  const { user, supabaseConfigured } = useAuth();
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  const [removedItems, setRemovedItems] = useState<string[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchItem | null>(null);
  const navigate = useNavigate();

  // Load actual liked status from database for this specific matching session
  const loadLikedStatus = async () => {
    if (!user || !supabaseConfigured || matches.length === 0) {
      const initialLikedStatus: Record<string, boolean> = {};
      matches.forEach(match => {
        initialLikedStatus[match.id] = false;
      });
      setLikedItems(initialLikedStatus);
      return;
    }
    
    const likedStatus: Record<string, boolean> = {};
    for (const match of matches) {
      if (isValidUUID(match.id)) {
        try {
          const liked = await isItemLiked(match.id);
          likedStatus[match.id] = liked;
        } catch (e) {
          likedStatus[match.id] = false;
        }
      } else {
        likedStatus[match.id] = false;
      }
    }
    setLikedItems(likedStatus);
  };

  useEffect(() => {
    loadLikedStatus();
    // eslint-disable-next-line
  }, [matches, user, supabaseConfigured]);

  // Handle liking/unliking an item with mutual matching logic
  const handleLike = async (id: string) => {
    console.log('DEBUG CLICK: ========== LIKE BUTTON CLICKED ==========');
    console.log('DEBUG CLICK: handleLike called with id:', id);
    console.log('DEBUG CLICK: Current user:', user?.id);
    console.log('DEBUG CLICK: Supabase configured:', supabaseConfigured);
    
    if (!user) {
      console.log('DEBUG CLICK: No user - showing login error');
      toast.error('Please log in to like items');
      return;
    }

    const isCurrentlyLiked = likedItems[id];

    if (supabaseConfigured && isValidUUID(id)) {
      // Optimistically update
      setLikedItems(prev => ({ ...prev, [id]: !isCurrentlyLiked }));

      try {
        let result;
        if (isCurrentlyLiked) {
          result = await unlikeItem(id);
        } else {
          result = await likeItem(id);
        }

        // Keep the optimistic update - no need to reload from DB

        // Handle mutual match result - check if result is an object with match data
        if (result && typeof result === 'object' && 'success' in result && result.success && !isCurrentlyLiked) {
          if ('isMatch' in result && result.isMatch && 'matchData' in result && result.matchData) {
            // Only navigate to messages if there's a confirmed mutual match
            setTimeout(() => {
              navigate('/messages', {
                state: {
                  newMatch: true,
                  matchData: result.matchData,
                },
              });
            }, 2000); // Give user time to see the success message
          }
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
    handleLike,
    handleOpenModal,
    handlePopupLikeClick,
    handleClosePopup,
    setSelectedMatch
  };
};
