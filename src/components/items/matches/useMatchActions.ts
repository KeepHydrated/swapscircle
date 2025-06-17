
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

  // Helper: load liked status for all UUID-backed matches
  const loadLikedStatus = async () => {
    if (!user || !supabaseConfigured || matches.length === 0) {
      setLikedItems({});
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
      }
    }
    setLikedItems(likedStatus);
  };

  // Load liked status on mount and when user/supabase/matches change
  useEffect(() => {
    loadLikedStatus();
    // eslint-disable-next-line
  }, [matches, user, supabaseConfigured]);

  // Handle liking/unliking an item with mutual matching logic
  const handleLike = async (id: string) => {
    if (!user) {
      toast.error('Please log in to like items');
      return;
    }

    const isCurrentlyLiked = likedItems[id];

    if (supabaseConfigured && isValidUUID(id)) {
      // Optimistically update
      setLikedItems(prev => ({ ...prev, [id]: !isCurrentlyLiked }));

      let result = false;
      try {
        if (isCurrentlyLiked) {
          result = await unlikeItem(id);
        } else {
          result = await likeItem(id);
        }
      } catch (error) {
        console.error('DB like/unlike error:', error);
        result = false;
      }

      // Always reload DB status to reflect true value
      await loadLikedStatus();

      // Handle mutual match result
      if (result && typeof result === 'object' && result.success && !isCurrentlyLiked) {
        if (result.isMatch) {
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
