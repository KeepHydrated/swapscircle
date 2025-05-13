import React, { useState, useEffect, useRef } from 'react';
import { MatchItem } from '@/types/item';
import ItemDetailsPopup from '@/components/profile/carousel/ItemDetailsPopup';
import MatchesContainer from './matches/MatchesContainer';
import { useMatchActions } from './matches/useMatchActions';

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
  
  // Refs for click outside detection
  const matchesContainerRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  // Get match actions from our custom hook
  const {
    likedItems,
    removedItems,
    selectedMatch,
    handleLike,
    handleItemSelect,
    handlePopupLikeClick,
    handleClosePopup
  } = useMatchActions(matches, onSelectMatch);
  
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
  
  // Filter out removed/matched items
  const displayedMatches = matches.filter(match => 
    !removedItems.includes(match.id) && !match.liked
  );

  return (
    <div className="lg:w-1/2 flex flex-col h-full">
      <h2 className="text-2xl font-bold mb-4">
        Matches for {selectedItemName || 'Selected Item'}
      </h2>
      <div ref={matchesContainerRef} className="flex-grow">
        <MatchesContainer
          displayedMatches={displayedMatches}
          selectedMatchId={selectedMatchId}
          itemsPerRow={itemsPerRow}
          likedItems={likedItems}
          onSelectItem={handleItemSelect}
          onLike={handleLike}
        />
      </div>
      
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
