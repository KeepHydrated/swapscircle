
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
  onUndoAvailable?: (available: boolean, undoFn: (() => void) | null) => void;
  loading?: boolean; // Add loading prop to prevent flashing
  onRefreshMatches?: () => void;
  viewMode?: 'slider' | 'grid';
  location?: string;
}

const Matches: React.FC<MatchesProps> = ({
  matches,
  selectedItemName,
  selectedItemId,
  onUndoAvailable,
  loading = false,
  onRefreshMatches,
  viewMode = 'slider',
  location = 'nationwide'
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
    !removedItems.includes(match.id)
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
      
      {isTransitioning ? (
        // Show skeleton loading state during transitions
        <div className="overflow-x-auto overflow-y-hidden p-2">
          <div className="flex gap-2 min-w-max">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="flex-shrink-0 w-48 sm:w-56 md:w-64">
                <div className="bg-muted rounded-lg border border-border overflow-hidden animate-pulse">
                  <div className="relative aspect-[4/3] bg-muted-foreground/10" />
                  <div className="p-4">
                    <div className="h-4 bg-muted-foreground/10 rounded w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : displayedMatches.length === 0 ? (
        <div className="overflow-x-auto overflow-y-hidden p-2">
          <div className="flex gap-2 min-w-max">
            {[
              { name: "Mountain Bike - Trek", image: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91" },
              { name: "Digital Camera - Canon", image: "https://images.unsplash.com/photo-1526413232644-8a40f03cc03b" },
              { name: "Electric Guitar - Fender", image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d" },
              { name: "Standing Desk - Adjustable", image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2" },
            ].map((item, idx) => (
              <div key={idx} className="flex-shrink-0 w-48 sm:w-56 md:w-64">
                <div className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all">
                  <div className="relative aspect-[4/3]">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    <div className="absolute top-1.5 left-1.5">
                      <button className="w-8 h-8 bg-background/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-background transition-all duration-200 hover:scale-110">
                        <svg className="w-4 h-4 text-foreground" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                        </svg>
                      </button>
                    </div>
                    <div className="absolute top-1.5 right-1.5 flex gap-1">
                      <button className="w-8 h-8 bg-background/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-background transition-all duration-200 hover:scale-110">
                        <svg className="w-4 h-4 text-muted-foreground hover:text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                      <button className="w-8 h-8 bg-background/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-background transition-all duration-200 hover:scale-110">
                        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold truncate">{item.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            viewMode={viewMode}
            location={location}
          />
        </div>
      )}
      
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
