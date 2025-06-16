import React, { useState, useEffect, useRef } from 'react';
import { MatchItem } from '@/types/item';
import ItemDetailsModal from '@/components/profile/carousel/ItemDetailsModal';
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
  const [itemsPerRow, setItemsPerRow] = useState(2);
  
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
    handleClosePopup,
    setSelectedMatch
  } = useMatchActions(matches, onSelectMatch);
  
  // Filter out removed/matched items
  const displayedMatches = matches.filter(match => 
    !removedItems.includes(match.id) && !match.liked
  );

  // Find current index in displayed matches
  const currentMatchIndex = selectedMatch 
    ? displayedMatches.findIndex(match => match.id === selectedMatch.id)
    : -1;

  // Navigation functions - update selectedMatchId to leverage effect
  const navigateToPrevMatch = () => {
    if (currentMatchIndex > 0) {
      const prevMatch = displayedMatches[currentMatchIndex - 1];
      if (prevMatch) {
        onSelectMatch(prevMatch.id);
      }
    }
  };

  const navigateToNextMatch = () => {
    if (currentMatchIndex < displayedMatches.length - 1) {
      const nextMatch = displayedMatches[currentMatchIndex + 1];
      if (nextMatch) {
        onSelectMatch(nextMatch.id);
      }
    }
  };
  
  // Always use 2 items per row for consistent smaller sizing
  useEffect(() => {
    setItemsPerRow(2);
  }, []);

  // Handle click outside to close details
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectedMatchId) {
        // Check if the click is outside both the matches container and the details
        const isOutsideMatches = matchesContainerRef.current && !matchesContainerRef.current.contains(event.target as Node);
        const isOutsideDetails = detailsRef.current && !detailsRef.current.contains(event.target as Node);
        
        if (isOutsideMatches && isOutsideDetails) {
          // Don't clear the selection completely anymore
          // Just close the popup by setting selectedMatch to null
          setSelectedMatch(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedMatchId, onSelectMatch, setSelectedMatch]);

  // Effect to update selectedMatch when matches or selectedMatchId change
  useEffect(() => {
    if (selectedMatchId && matches.length > 0) {
      const match = matches.find(m => m.id === selectedMatchId);
      if (match) {
        setSelectedMatch(match);
      }
    }
  }, [matches, selectedMatchId, setSelectedMatch]);

  return (
    <div className="w-full flex flex-col h-full">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Matches for <span className="text-primary">{selectedItemName}</span>
      </h2>
      
      {displayedMatches.length === 0 ? (
        <div className="text-center text-gray-500 py-8 flex-1 flex flex-col justify-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-base font-medium mb-1">No matches found</p>
          <p className="text-sm">Try updating your preferences or check back later</p>
        </div>
      ) : (
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
      )}
      
      {/* Popup for displaying match details */}
      {selectedMatch && (
        <ItemDetailsModal
          item={selectedMatch}
          isOpen={!!selectedMatch}
          onClose={handleClosePopup}
          onLikeClick={handlePopupLikeClick}
          onNavigatePrev={navigateToPrevMatch}
          onNavigateNext={navigateToNextMatch}
          currentIndex={currentMatchIndex}
          totalItems={displayedMatches.length}
        />
      )}
    </div>
  );
};

export default Matches;
