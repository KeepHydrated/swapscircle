
import React from 'react';
import ItemCard from '../ItemCard';
import { MatchItem } from '@/types/item';

interface MatchesGridProps {
  displayedMatches: MatchItem[];
  onOpenModal: (id: string) => void;
  onLike: (id: string) => void;
  onReject: (id: string) => void;
  likedItems: Record<string, boolean>;
  detailsRef: React.RefObject<HTMLDivElement>;
}

const MatchesGrid: React.FC<MatchesGridProps> = ({
  displayedMatches,
  onOpenModal,
  onLike,
  onReject,
  likedItems,
  detailsRef
}) => {
  return (
    <div className="flex gap-2 min-w-max p-2" ref={detailsRef}>
      {displayedMatches.map(match => (
        <div key={match.id} className="flex-shrink-0 w-64 transform transition-all duration-200 hover:scale-105">
          <ItemCard
            id={match.id}
            name={match.name}
            image={match.image}
            isMatch={true}
            liked={likedItems[match.id] || match.liked}
            onSelect={onOpenModal}
            onLike={onLike}
            onReject={onReject}
          />
        </div>
      ))}
    </div>
  );
};

export default MatchesGrid;
