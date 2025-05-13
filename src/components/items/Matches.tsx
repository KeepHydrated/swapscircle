
import React, { useState, useEffect, useRef } from 'react';
import ItemCard from './ItemCard';
import ItemDetails from '@/components/messages/details/ItemDetails';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import ItemDetailsPopup from '@/components/profile/carousel/ItemDetailsPopup';
import { MatchItem } from '@/types/item';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MatchesProps {
  matches: MatchItem[];
  selectedItemName: string;
  selectedMatchId: string | null;
  onSelectMatch: (id: string) => void;
}

const Matches: React.FC<MatchesProps> = ({ 
  matches, 
  selectedItemName, 
  selectedMatchId, 
  onSelectMatch 
}) => {
  // State to keep track of viewport size
  const [itemsPerRow, setItemsPerRow] = useState(3);
  // State to track liked items
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  // State to track removed items
  const [removedItems, setRemovedItems] = useState<string[]>([]);
  // State to track which match is being viewed in the popup
  const [selectedMatch, setSelectedMatch] = useState<MatchItem | null>(null);
  const navigate = useNavigate();
  
  // Refs for click outside detection
  const matchesContainerRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  
  // Update itemsPerRow based on window size
  useEffect(() => {
    const handleResize = () => {
      setItemsPerRow(window.innerWidth >= 768 ? 3 : 2);
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle click outside to close details
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectedMatchId) {
        // Check if the click is outside both the matches container and the details
        const isOutsideMatches = matchesContainerRef.current && !matchesContainerRef.current.contains(event.target as Node);
        const isOutsideDetails = detailsRef.current && !detailsRef.current.contains(event.target as Node);
        
        if (isOutsideMatches && isOutsideDetails) {
          onSelectMatch(''); // Clear selection when clicking outside
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedMatchId, onSelectMatch]);

  // Calculate the row index for an item
  const getRowIndex = (index: number) => {
    return Math.floor(index / itemsPerRow);
  };
  
  // Filter out removed/matched items
  const displayedMatches = matches.filter(match => 
    !removedItems.includes(match.id) && !match.liked
  );

  // Find the index of the selected match in displayed matches
  const selectedIndex = selectedMatchId 
    ? displayedMatches.findIndex(match => match.id === selectedMatchId) 
    : -1;
  
  // Calculate which row has the selected item
  const selectedRowIndex = selectedIndex !== -1 
    ? getRowIndex(selectedIndex) 
    : -1;
    
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
        // Add item to removed list
        setRemovedItems(prev => [...prev, id]);
        
        toast(`You matched with ${match.name}! Check your messages.`);
        // Navigate to messages with the liked item info
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
    const match = displayedMatches.find(m => m.id === id);
    if (match) {
      setSelectedMatch(match);
    }
    
    // Still call the original onSelectMatch function for existing functionality
    onSelectMatch(id);
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
    // Also clear the selected match in the parent component
    onSelectMatch('');
  };

  // Render function to create the grid with details injected after the selected row
  const renderGrid = () => {
    let result = [];
    let currentRow = -1;
    
    for (let i = 0; i < displayedMatches.length; i++) {
      const match = displayedMatches[i];
      const rowIndex = getRowIndex(i);
      
      // Check if we're starting a new row
      if (rowIndex !== currentRow) {
        currentRow = rowIndex;
      }
      
      // Add the current item
      result.push(
        <ItemCard
          key={match.id}
          id={match.id}
          name={match.name}
          image={match.image}
          isMatch={true}
          liked={likedItems[match.id] || match.liked}
          isSelected={selectedMatchId === match.id}
          onSelect={handleItemSelect}
          onLike={handleLike}
        />
      );
      
      // If this is the last item in a row AND it's the selected row, add details
      if (selectedRowIndex === rowIndex && 
          ((i + 1) % itemsPerRow === 0 || i === displayedMatches.length - 1)) {
        // Add details component spanning the full width
        result.push(
          <div key={`details-${selectedMatchId}`} className="col-span-2 md:col-span-3" ref={detailsRef}>
            <Card className="overflow-hidden mt-2 mb-4">
              <ItemDetails name={displayedMatches[selectedIndex]?.name || ''} />
            </Card>
          </div>
        );
      }
    }
    
    return result;
  };

  return (
    <div className="lg:w-1/2 flex flex-col h-full">
      <h2 className="text-2xl font-bold mb-4">
        Matches for {selectedItemName || 'Selected Item'}
      </h2>
      <ScrollArea className="flex-grow">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pr-2" ref={matchesContainerRef}>
          {renderGrid()}
        </div>
      </ScrollArea>
      
      {/* Popup for displaying match details */}
      {selectedMatch && (
        <ItemDetailsPopup
          item={selectedMatch}
          isOpen={!!selectedMatch}
          onClose={handleClosePopup}
          onLikeClick={handlePopupLikeClick}
        />
      )}
    </div>
  );
};

export default Matches;
