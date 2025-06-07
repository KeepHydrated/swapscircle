
import React, { useRef } from 'react';
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
  
  // Find the index of the selected match in displayed matches
  const selectedIndex = selectedMatchId 
    ? displayedMatches.findIndex(match => match.id === selectedMatchId) 
    : -1;
  
  // Calculate which row has the selected item
  const selectedRowIndex = selectedIndex !== -1 
    ? Math.floor(selectedIndex / itemsPerRow) 
    : -1;

  return (
    <ScrollArea className="h-[calc(100vh-240px)]">
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
  );
};

export default MatchesContainer;
