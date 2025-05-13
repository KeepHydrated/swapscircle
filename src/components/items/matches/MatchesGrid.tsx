
import React from 'react';
import ItemCard from '../ItemCard';
import { Card } from '@/components/ui/card';
import ItemDetails from '@/components/messages/details/ItemDetails';
import { MatchItem } from '@/types/item';

interface MatchesGridProps {
  displayedMatches: MatchItem[];
  selectedMatchId: string | null;
  selectedIndex: number;
  selectedRowIndex: number;
  itemsPerRow: number;
  onSelectItem: (id: string) => void;
  onLike: (id: string) => void;
  likedItems: Record<string, boolean>;
  detailsRef: React.RefObject<HTMLDivElement>;
}

const MatchesGrid: React.FC<MatchesGridProps> = ({
  displayedMatches,
  selectedMatchId,
  selectedIndex,
  selectedRowIndex,
  itemsPerRow,
  onSelectItem,
  onLike,
  likedItems,
  detailsRef
}) => {
  // Calculate which row has the selected item
  const getRowIndex = (index: number) => {
    return Math.floor(index / itemsPerRow);
  };
  
  // Render function to create the grid with details injected after the selected row
  const renderGrid = () => {
    let result = [];
    let currentRow = -1;
    
    for (let i = 0; i < displayedMatches.length; i++) {
      const match = displayedMatches[i];
      const rowIndex = getRowIndex(i);
      
      // Check if we're starting a new row
      if (rowIndex !== currentRow) {
        currentRow = rowIndex;
      }
      
      // Add the current item
      result.push(
        <ItemCard
          key={match.id}
          id={match.id}
          name={match.name}
          image={match.image}
          isMatch={true}
          liked={likedItems[match.id] || match.liked}
          isSelected={selectedMatchId === match.id}
          onSelect={onSelectItem}
          onLike={onLike}
        />
      );
      
      // If this is the last item in a row AND it's the selected row, add details
      if (selectedRowIndex === rowIndex && 
          ((i + 1) % itemsPerRow === 0 || i === displayedMatches.length - 1)) {
        // Add details component spanning the full width
        result.push(
          <div key={`details-${selectedMatchId}`} className="col-span-2 md:col-span-3" ref={detailsRef}>
            <Card className="overflow-hidden mt-2 mb-4">
              <ItemDetails name={displayedMatches[selectedIndex]?.name || ''} />
            </Card>
          </div>
        );
      }
    }
    
    return result;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pr-2">
      {renderGrid()}
    </div>
  );
};

export default MatchesGrid;
