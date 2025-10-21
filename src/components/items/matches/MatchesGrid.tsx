
import React from 'react';
import ItemCard from '../ItemCard';
import { MatchItem } from '@/types/item';

interface MatchesGridProps {
  displayedMatches: MatchItem[];
  onOpenModal: (id: string) => void;
  onLike: (id: string, global?: boolean) => void;
  onReject: (id: string, global?: boolean) => void;
  onReport: (id: string) => void;
  likedItems: Record<string, boolean>;
  detailsRef: React.RefObject<HTMLDivElement>;
  location?: string;
}

const MatchesGrid: React.FC<MatchesGridProps> = ({
  displayedMatches,
  onOpenModal,
  onLike,
  onReject,
  onReport,
  likedItems,
  detailsRef,
  location = 'nationwide'
}) => {
  return (
    <div className="relative w-full" ref={detailsRef}>
      <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
         {displayedMatches.map(match => (
            <div key={match.id} className="flex-shrink-0 w-64">
               <ItemCard
                id={match.id}
                name={match.name}
                image={match.image}
                isMatch={true}
                liked={likedItems[match.id] || match.liked}
                onSelect={onOpenModal}
                onLike={(id, global) => onLike(id, global)}
                onReject={(id, global) => onReject(id, global)}
                onReport={onReport}
                category={match.category}
                tags={match.tags}
                distance={location === 'local' ? match.distance : undefined}
                userProfile={match.userProfile}
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export default MatchesGrid;
