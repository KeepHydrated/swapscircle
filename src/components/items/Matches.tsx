
import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  userTradeItem?: MatchItem; // The item the user is offering for trade
  onUndoAvailable?: (available: boolean, undoFn: (() => void) | null) => void;
  loading?: boolean; // Add loading prop to prevent flashing
  onRefreshMatches?: () => void;
}

const Matches: React.FC<MatchesProps> = ({
  matches,
  selectedItemName,
  selectedItemId,
  userTradeItem,
  onUndoAvailable,
  loading = false,
  onRefreshMatches
}) => {
  // Force loading state on any selectedItemId change until data syncs
  const [isItemChanging, setIsItemChanging] = useState(false);
  const [syncedItemId, setSyncedItemId] = useState<string | undefined>(selectedItemId);
  
  // Immediately detect item changes at render time (before useEffect)
  if (selectedItemId !== syncedItemId) {
    console.log('🚨 ITEM CHANGE DETECTED AT RENDER:', {
      from: syncedItemId,
      to: selectedItemId,
      matchesLength: matches.length
    });
    // Force loading state immediately
    if (!isItemChanging) {
      setIsItemChanging(true);
    }
  }
  
  
  
  // Get match actions from our custom hook - fixed flashing issue
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
  
  
  // Update syncedItemId and clear isItemChanging when data is ready
  useEffect(() => {
    if (selectedItemId && !isLoadingLikedStatus && !loading) {
      setSyncedItemId(selectedItemId);
      setIsItemChanging(false);
    }
  }, [selectedItemId, isLoadingLikedStatus, loading, syncedItemId, isItemChanging]);
  
  // Notify parent about undo availability whenever lastActions changes
  useEffect(() => {
    if (onUndoAvailable) {
      onUndoAvailable(lastActions.length > 0, lastActions.length > 0 ? handleUndo : null);
    }
  }, [lastActions, onUndoAvailable, handleUndo]);
  
  // Hide content during transitions
  const isTransitioning = loading || isLoadingLikedStatus || isItemChanging;
  
  
  const displayedMatches = isTransitioning ? [] : matches.filter(match => 
    !removedItems.includes(match.id) && !likedItems[match.id]
  );

  // Find current index in displayed matches
  const currentMatchIndex = selectedMatch 
    ? displayedMatches.findIndex(match => match.id === selectedMatch.id)
    : -1;

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
      
      {(displayedMatches.length === 0 && !isTransitioning) ? (
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
          onLikeAll={(id) => handleLike(id, true)}
          onRejectAll={(id) => handleReject(id, true)}
          onReport={handleReport}
          userTradeItem={userTradeItem}
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
