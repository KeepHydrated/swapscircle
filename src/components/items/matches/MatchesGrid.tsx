
import React from 'react';
import ItemCard from '../ItemCard';
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
  itemsPerRow,
  onSelectItem,
  onLike,
  likedItems,
  detailsRef
}) => {
  // Simply render all matches in a grid with no details section
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pr-2" ref={detailsRef}>
      {displayedMatches.map(match => (
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
      ))}
    </div>
  );
};

export default MatchesGrid;
