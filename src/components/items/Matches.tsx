
import React, { useState, useEffect, useRef } from 'react';
import { MatchItem } from '@/types/item';
import ItemDetailsModal from '@/components/profile/carousel/ItemDetailsModal';
import MatchesContainer from './matches/MatchesContainer';
import { useMatchActions } from './matches/useMatchActions';
import HeaderLocationSelector from '@/components/layout/HeaderLocationSelector';

interface MatchesProps {
  matches: MatchItem[];
  selectedItemName: string;
}

const Matches: React.FC<MatchesProps> = ({
  matches,
  selectedItemName
}) => {
  // Get match actions from our custom hook
  const {
    likedItems,
    removedItems,
    selectedMatch,
    handleLike,
    handleReject,
    handleOpenModal,
    handlePopupLikeClick,
    handleClosePopup,
    setSelectedMatch
  } = useMatchActions(matches);
  
  // Filter out removed/liked items
  const displayedMatches = matches.filter(match => 
    !removedItems.includes(match.id) && !likedItems[match.id]
  );

  // Find current index in displayed matches
  const currentMatchIndex = selectedMatch 
    ? displayedMatches.findIndex(match => match.id === selectedMatch.id)
    : -1;

  // Navigation functions
  const navigateToPrevMatch = () => {
    if (currentMatchIndex > 0) {
      const prevMatch = displayedMatches[currentMatchIndex - 1];
      if (prevMatch) {
        setSelectedMatch(prevMatch);
      }
    }
  };

  const navigateToNextMatch = () => {
    if (currentMatchIndex < displayedMatches.length - 1) {
      const nextMatch = displayedMatches[currentMatchIndex + 1];
      if (nextMatch) {
        setSelectedMatch(nextMatch);
      }
    }
  };

  return (
    <div className="w-full flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Matches for <span className="text-primary">{selectedItemName}</span>
        </h2>
        <HeaderLocationSelector 
          onLocationChange={(value) => console.log('Location changed to:', value)}
        />
      </div>
      
      {displayedMatches.length === 0 ? (
        <div className="text-center text-gray-500 py-8 flex-1 flex flex-col justify-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-base font-medium mb-1">No matches found</p>
          <p className="text-sm">Try updating your preferences or check back later</p>
        </div>
      ) : (
        <div className="flex-grow">
          <MatchesContainer
            displayedMatches={displayedMatches}
            likedItems={likedItems}
            onOpenModal={handleOpenModal}
            onLike={handleLike}
            onReject={handleReject}
          />
        </div>
      )}
      
      {/* Modal for displaying match details */}
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
