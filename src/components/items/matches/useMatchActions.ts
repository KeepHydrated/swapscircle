
import { useState, useEffect } from 'react';
import { MatchItem } from '@/types/item';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { likeItem, unlikeItem, isItemLiked } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';

export interface UseMatchActionsResult {
  likedItems: Record<string, boolean>;
  removedItems: string[];
  selectedMatch: MatchItem | null;
  handleLike: (id: string) => void;
  handleItemSelect: (id: string) => void;
  handlePopupLikeClick: (item: MatchItem) => void;
  handleClosePopup: () => void;
  setSelectedMatch: (match: MatchItem | null) => void;
}

export const useMatchActions = (
  matches: MatchItem[],
  onSelectMatch: (id: string) => void
): UseMatchActionsResult => {
  const { user, supabaseConfigured } = useAuth();
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  const [removedItems, setRemovedItems] = useState<string[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchItem | null>(null);
  const navigate = useNavigate();

  // Load liked status for all matches on component mount
  useEffect(() => {
    const loadLikedStatus = async () => {
      if (!user || !supabaseConfigured || matches.length === 0) {
        return;
      }

      const likedStatus: Record<string, boolean> = {};
      
      for (const match of matches) {
        const liked = await isItemLiked(match.id);
        likedStatus[match.id] = liked;
      }

      setLikedItems(likedStatus);
    };

    loadLikedStatus();
  }, [matches, user, supabaseConfigured]);

  // Handle liking an item
  const handleLike = async (id: string) => {
    if (!user) {
      toast.error('Please log in to like items');
      return;
    }

    const isCurrentlyLiked = likedItems[id];
    
    // Optimistic update
    setLikedItems(prev => ({ ...prev, [id]: !isCurrentlyLiked }));
    
    try {
      let success = false;
      
      if (isCurrentlyLiked) {
        success = await unlikeItem(id);
      } else {
        success = await likeItem(id);
      }

      if (success && !isCurrentlyLiked) {
        // If successfully liked, show match message and navigate
        const match = matches.find(m => m.id === id);
        if (match) {
          toast(`You matched with ${match.name}! Check your messages.`);
          
          setTimeout(() => {
            navigate('/messages', { 
              state: { 
                likedItem: {
                  ...match,
                  liked: true
                } 
              }
            });
          }, 1000);
        }
      }

      if (!success) {
        // Revert optimistic update on failure
        setLikedItems(prev => ({ ...prev, [id]: isCurrentlyLiked }));
      }
    } catch (error) {
      // Revert optimistic update on error
      setLikedItems(prev => ({ ...prev, [id]: isCurrentlyLiked }));
      console.error('Error handling like:', error);
    }
  };

  // Handle selecting an item with popup display
  const handleItemSelect = (id: string) => {
    const match = matches.find(m => m.id === id);
    if (match) {
      setSelectedMatch(match);
      onSelectMatch(id);
    }
  };
  
  // Handle popup like click
  const handlePopupLikeClick = (item: MatchItem) => {
    handleLike(item.id);
    setSelectedMatch(null);
  };
  
  // Close the popup
  const handleClosePopup = () => {
    setSelectedMatch(null);
  };

  return {
    likedItems,
    removedItems,
    selectedMatch,
    handleLike,
    handleItemSelect,
    handlePopupLikeClick,
    handleClosePopup,
    setSelectedMatch
  };
};
