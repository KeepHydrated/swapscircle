
import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MatchItem } from '@/types/item';
import { ScrollArea } from '@/components/ui/scroll-area';
import MatchesGrid from './MatchesGrid';

interface MatchesContainerProps {
  displayedMatches: MatchItem[];
  selectedMatchId: string | null;
  itemsPerRow: number;
  likedItems: Record<string, boolean>;
  onSelectItem: (id: string) => void;
  onLike: (id: string) => void;
}

const MatchesContainer: React.FC<MatchesContainerProps> = ({
  displayedMatches,
  selectedMatchId,
  itemsPerRow,
  likedItems,
  onSelectItem,
  onLike
}) => {
  const detailsRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Find the index of the selected match in displayed matches
  const selectedIndex = selectedMatchId 
    ? displayedMatches.findIndex(match => match.id === selectedMatchId) 
    : -1;
  
  // Calculate which row has the selected item
  const selectedRowIndex = selectedIndex !== -1 
    ? Math.floor(selectedIndex / itemsPerRow) 
    : -1;

  const scrollLeft = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollBy({ left: -300, behavior: 'smooth' });
      }
    }
  };

  const scrollRight = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollBy({ left: 300, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="relative">
      <ScrollArea ref={scrollAreaRef} className="h-[calc(100vh-240px)]">
        <MatchesGrid
          displayedMatches={displayedMatches}
          selectedMatchId={selectedMatchId}
          selectedIndex={selectedIndex}
          selectedRowIndex={selectedRowIndex}
          itemsPerRow={itemsPerRow}
          onSelectItem={onSelectItem}
          onLike={onLike}
          likedItems={likedItems}
          detailsRef={detailsRef}
        />
      </ScrollArea>
      
      {/* Navigation arrows */}
      {displayedMatches.length > itemsPerRow && (
        <>
          <button
            onClick={scrollLeft}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors z-10 border border-gray-200"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          
          <button
            onClick={scrollRight}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors z-10 border border-gray-200"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </>
      )}
    </div>
  );
};

export default MatchesContainer;
