
import { useState } from 'react';
import { MatchItem } from '@/types/item';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

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
  // State to track liked items
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  // State to track removed items
  const [removedItems, setRemovedItems] = useState<string[]>([]);
  // State to track which match is being viewed in the popup
  const [selectedMatch, setSelectedMatch] = useState<MatchItem | null>(null);
  const navigate = useNavigate();

  // Handle liking an item
  const handleLike = (id: string) => {
    // Toggle the liked state
    const newLikedItems = { 
      ...likedItems, 
      [id]: !likedItems[id] 
    };
    setLikedItems(newLikedItems);
    
    // If newly liked, show toast and navigate to messages
    if (newLikedItems[id]) {
      const match = matches.find(m => m.id === id);
      if (match) {
        toast(`You matched with ${match.name}! Check your messages.`);
        
        setTimeout(() => {
          navigate('/messages', { 
            state: { 
              likedItem: {
                ...match,
                liked: true  // Ensure the item is marked as liked
              } 
            }
          });
        }, 1000);
      }
    }
  };

  // Handle selecting an item with popup display
  const handleItemSelect = (id: string) => {
    // Find the selected match
    const match = matches.find(m => m.id === id);
    if (match) {
      setSelectedMatch(match);
      
      // Call the original onSelectMatch function to select the match
      onSelectMatch(id);
    }
  };
  
  // Handle popup like click
  const handlePopupLikeClick = (item: MatchItem) => {
    // Use the existing handleLike function
    handleLike(item.id);
    
    // Close the popup
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
