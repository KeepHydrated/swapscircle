
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
  
  // Notify parent about undo availability whenever lastActions changes
  useEffect(() => {
    if (onUndoAvailable) {
      onUndoAvailable(lastActions.length > 0, lastActions.length > 0 ? handleUndo : null);
    }
  }, [lastActions, onUndoAvailable, handleUndo]);
  
  // Filter out both removed and liked items - but only if liked status is loaded
  const displayedMatches = isLoadingLikedStatus ? [] : matches.filter(match => 
    !removedItems.includes(match.id) && !likedItems[match.id]
  );

  console.log('🚨 FLASH DEBUG: Matches component state:', JSON.stringify({
    selectedItemName,
    selectedItemId,
    totalMatches: matches.length,
    isLoadingLikedStatus,
    isGeneralLoading: loading,
    removedItems,
    likedItems,
    displayedMatches: displayedMatches.length,
    matchIds: matches.map(m => m.id),
    filteredOutByLikes: isLoadingLikedStatus ? [] : matches.filter(m => likedItems[m.id]).map(m => m.id),
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

  // Show skeleton loading while fetching matches, but not when just switching between items
  if (loading || (isLoadingLikedStatus && matches.length > 0)) {
    return (
      <div className="w-full flex flex-col h-full">
        <div className="flex gap-2 min-w-max p-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-64">
              <div className="bg-card rounded-lg overflow-hidden shadow-sm border animate-pulse">
                <div className="h-40 bg-muted"></div>
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
            onReport={handleReport}
          />
        </div>
      )}
      
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
