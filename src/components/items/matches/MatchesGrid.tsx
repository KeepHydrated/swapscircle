
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
  return (
    <div className={`grid ${itemsPerRow === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-6 pr-2`} ref={detailsRef}>
      {displayedMatches.map(match => (
        <div key={match.id} className="transform transition-all duration-200 hover:scale-105">
          <ItemCard
            id={match.id}
            name={match.name}
            image={match.image}
            isMatch={true}
            liked={likedItems[match.id] || match.liked}
            isSelected={selectedMatchId === match.id}
            onSelect={onSelectItem}
            onLike={onLike}
          />
        </div>
      ))}
    </div>
  );
};

export default MatchesGrid;
