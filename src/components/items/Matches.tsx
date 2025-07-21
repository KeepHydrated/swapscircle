
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
}

const Matches: React.FC<MatchesProps> = ({
  matches,
  selectedItemName,
  onUndoAvailable
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
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedMatch.name}</h2>
              <button 
                onClick={handleClosePopup}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video bg-gray-200 rounded mb-4">
              <img 
                src={selectedMatch.image} 
                alt={selectedMatch.name}
                className="w-full h-full object-cover rounded"
              />
            </div>
            <p>{selectedMatch.description || "No description"}</p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handlePopupLikeClick(selectedMatch)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                ❤️ Like
              </button>
              <button
                onClick={handleClosePopup}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Matches;
