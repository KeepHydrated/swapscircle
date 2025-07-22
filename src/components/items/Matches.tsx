
import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import { MatchItem } from '@/types/item';
import { Button } from '@/components/ui/button';
import ItemDetailsModal from '@/components/profile/carousel/ItemDetailsModal';
import MatchesContainer from './matches/MatchesContainer';
import { useMatchActions } from './matches/useMatchActions';
import HeaderLocationSelector from '@/components/layout/HeaderLocationSelector';

interface MatchesProps {
  matches: MatchItem[];
  selectedItemName: string;
  onUndoAvailable?: (available: boolean, undoFn: (() => void) | null) => void;
  loading?: boolean; // Add loading prop to prevent flashing
}

const Matches: React.FC<MatchesProps> = ({
  matches,
  selectedItemName,
  onUndoAvailable,
  loading = false
}) => {
  // Get match actions from our custom hook
  const {
    likedItems,
    removedItems,
    selectedMatch,
    lastActions,
    handleLike,
    handleReject,
    handleUndo,
    handleOpenModal,
    handlePopupLikeClick,
    handleClosePopup,
    setSelectedMatch
  } = useMatchActions(matches);
  
  // Notify parent about undo availability whenever lastActions changes
  useEffect(() => {
    console.log('DEBUG: Matches useEffect - lastActions:', lastActions);
    console.log('DEBUG: Matches useEffect - onUndoAvailable prop:', onUndoAvailable);
    if (onUndoAvailable) {
      console.log('DEBUG: Calling onUndoAvailable with:', lastActions.length > 0, lastActions.length > 0 ? 'handleUndo function' : null);
      onUndoAvailable(lastActions.length > 0, lastActions.length > 0 ? handleUndo : null);
    } else {
      console.log('DEBUG: onUndoAvailable prop is not provided');
    }
  }, [lastActions, onUndoAvailable, handleUndo]);
  
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

  // Don't render anything while loading to prevent flashing
  if (loading) {
    return (
      <div className="w-full flex flex-col h-full">
        <div className="text-center text-gray-500 py-8 flex-1 flex flex-col justify-center">
          <div className="text-4xl mb-3">⏳</div>
          <p className="text-base font-medium mb-1">Loading matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col h-full">
      
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
          key={`${selectedMatch.id}-${selectedMatch.image}`} // Prevent flashing with stable key
          item={selectedMatch}
          isOpen={!!selectedMatch}
          onClose={handleClosePopup}
          onLikeClick={handlePopupLikeClick}
          onNavigatePrev={navigateToPrevMatch}
          onNavigateNext={navigateToNextMatch}
          currentIndex={currentMatchIndex}
          totalItems={displayedMatches.length}
          skipDataFetch={true} // Skip API calls since we already have match data
        />
      )}
    </div>
  );
};

export default Matches;
