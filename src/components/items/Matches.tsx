
import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import { MatchItem } from '@/types/item';
import { Button } from '@/components/ui/button';
import ItemDetailsModal from '@/components/profile/carousel/ItemDetailsModal';
import MatchesContainer from './matches/MatchesContainer';
import { useMatchActions } from './matches/useMatchActions';
import { ReportItemModal } from './ReportItemModal';
import HeaderLocationSelector from '@/components/layout/HeaderLocationSelector';

interface MatchesProps {
  matches: MatchItem[];
  selectedItemName: string;
  selectedItemId?: string;
  onUndoAvailable?: (available: boolean, undoFn: (() => void) | null) => void;
  loading?: boolean; // Add loading prop to prevent flashing
  onRefreshMatches?: () => void;
}

const Matches: React.FC<MatchesProps> = ({
  matches,
  selectedItemName,
  selectedItemId,
  onUndoAvailable,
  loading = false,
  onRefreshMatches
}) => {
  // Track if matches have been updated for current selected item
  const [lastSelectedItemId, setLastSelectedItemId] = useState<string | undefined>(selectedItemId);
  // Get match actions from our custom hook
  const {
    likedItems,
    removedItems,
    selectedMatch,
    lastActions,
    isLoadingLikedStatus,
    handleLike,
    handleReject,
    handleUndo,
    handleOpenModal,
    handlePopupLikeClick,
    handleClosePopup,
    handleReport,
    setSelectedMatch
  } = useMatchActions(matches, onRefreshMatches, selectedItemId);
  
  // Track when selectedItemId changes to detect transitions
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionStartTime, setTransitionStartTime] = useState<number>(0);
  
  // Update tracking when selectedItemId changes
  useEffect(() => {
    if (selectedItemId !== lastSelectedItemId) {
      console.log('🚨 TRANSITION START:', {
        from: lastSelectedItemId,
        to: selectedItemId,
        timestamp: Date.now()
      });
      setIsTransitioning(true);
      setTransitionStartTime(Date.now());
      setLastSelectedItemId(selectedItemId);
    }
  }, [selectedItemId, lastSelectedItemId]);
  
  // Clear transition when matches update for the new item
  useEffect(() => {
    if (isTransitioning && transitionStartTime > 0) {
      console.log('🚨 MATCHES EFFECT:', {
        selectedItemId,
        matchesLength: matches.length,
        timeSinceTransition: Date.now() - transitionStartTime,
        isTransitioning
      });
      // Clear transition immediately when matches update
      setIsTransitioning(false);
    }
  }, [matches, selectedItemId, isTransitioning, transitionStartTime]);
  
  // Notify parent about undo availability whenever lastActions changes
  useEffect(() => {
    if (onUndoAvailable) {
      onUndoAvailable(lastActions.length > 0, lastActions.length > 0 ? handleUndo : null);
    }
  }, [lastActions, onUndoAvailable, handleUndo]);
  
  // Hide matches during transitions, while loading, or if they don't belong to current item
  const displayedMatches = (isTransitioning || isLoadingLikedStatus) ? [] : matches.filter(match => 
    !removedItems.includes(match.id) && !likedItems[match.id]
  );

  console.log('🚨 FLASH DEBUG: Matches component state:', JSON.stringify({
    selectedItemName,
    selectedItemId,
    lastSelectedItemId,
    isTransitioning,
    totalMatches: matches.length,
    isLoadingLikedStatus,
    isGeneralLoading: loading,
    removedItems,
    likedItems,
    displayedMatches: displayedMatches.length,
    matchIds: matches.map(m => m.id),
    filteredOutByLikes: matches.filter(m => likedItems[m.id]).map(m => m.id),
    filteredOutByRemoved: matches.filter(m => removedItems.includes(m.id)).map(m => m.id)
  }, null, 2));

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

  // Don't render if we have no selected item
  if (!selectedItemName) {
    return (
      <div className="w-full flex flex-col h-full">
        <div className="text-center text-gray-500 py-8 flex-1 flex flex-col justify-center">
          <div className="text-4xl mb-3">📱</div>
          <p className="text-base font-medium mb-1">Select an item to see matches</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col h-full">
      
      {(displayedMatches.length === 0 && !isLoadingLikedStatus && !isTransitioning) ? (
        <div className="text-center text-gray-500 py-8 flex-1 flex flex-col justify-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-base font-medium mb-1">No matches found</p>
          <p className="text-sm">Try updating your preferences or check back later</p>
        </div>
      ) : displayedMatches.length > 0 ? (
        <div className="flex-grow">
          <MatchesContainer
            displayedMatches={displayedMatches}
            likedItems={likedItems}
            onOpenModal={handleOpenModal}
            onLike={handleLike}
            onReject={handleReject}
            onReport={handleReport}
          />
        </div>
      ) : null}
      
      {/* Modal for displaying match details */}
      {selectedMatch && !(selectedMatch as any).isReportModal && (
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
          preloadedUserProfile={selectedMatch.userProfile ? {
            name: selectedMatch.userProfile.name,
            username: selectedMatch.userProfile.username,
            avatar_url: selectedMatch.userProfile.avatar_url || '',
            created_at: '2025-01-01T00:00:00Z' // Default since we don't have this in match data
          } : undefined}
        />
      )}

      {/* Report Item Modal */}
      {selectedMatch && (selectedMatch as any).isReportModal && (
        <ReportItemModal
          isOpen={true}
          onClose={handleClosePopup}
          itemId={selectedMatch.id}
          itemName={selectedMatch.name}
        />
      )}
    </div>
  );
};

export default Matches;
