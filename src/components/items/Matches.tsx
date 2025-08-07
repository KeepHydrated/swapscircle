
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { RotateCcw } from 'lucide-react';
import { MatchItem } from '@/types/item';
import { Button } from '@/components/ui/button';
import MatchesCarousel from './MatchesCarousel';
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
  
  // Debug logging
  console.log('🔍 Matches component render:', {
    selectedItemId,
    syncedItemId,
    matchesLength: matches.length,
    loading,
    selectedItemName,
    isItemChanging
  });
  
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
    handleReport,
    handleClosePopup,
    setSelectedMatch
  } = useMatchActions(matches, onRefreshMatches, selectedItemId);
  
  // Debug when matches prop changes
  useEffect(() => {
    console.log('🔍 Matches prop changed:', {
      selectedItemId,
      matchesLength: matches.length,
      matches: matches.map(m => ({ id: m.id, name: m.name }))
    });
  }, [matches, selectedItemId]);
  
  // Update syncedItemId and clear isItemChanging when data is ready
  useEffect(() => {
    if (selectedItemId && !isLoadingLikedStatus && !loading) {
      console.log('🔍 Data is ready, syncing itemId:', {
        selectedItemId,
        syncedItemId,
        wasChanging: isItemChanging
      });
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
  
  console.log('🔍 Display logic:', {
    loading,
    isLoadingLikedStatus,
    selectedItemId,
    syncedItemId,
    isItemChanging,
    isTransitioning,
    matchesLength: matches.length,
    displayedMatchesLength: isTransitioning ? 0 : matches.filter(match => 
      !removedItems.includes(match.id) && !likedItems[match.id]
    ).length
  });
  
  const displayedMatches = isTransitioning ? [] : matches.filter(match => 
    !removedItems.includes(match.id) && !likedItems[match.id]
  );


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
          <MatchesCarousel
            items={displayedMatches}
            onLikeItem={handleLike}
            onRejectItem={handleReject}
            onReport={handleReport}
            likedItems={likedItems}
          />
        </div>
      ) : null}
      
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
