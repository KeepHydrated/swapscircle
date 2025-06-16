
import React, { useRef } from 'react';
import { MatchItem } from '@/types/item';
import { ScrollArea } from '@/components/ui/scroll-area';
import MatchesGrid from './MatchesGrid';

interface MatchesContainerProps {
  displayedMatches: MatchItem[];
  likedItems: Record<string, boolean>;
  onOpenModal: (id: string) => void;
  onLike: (id: string) => void;
}

const MatchesContainer: React.FC<MatchesContainerProps> = ({
  displayedMatches,
  likedItems,
  onOpenModal,
  onLike
}) => {
  const detailsRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative">
      <ScrollArea ref={scrollAreaRef} className="h-[calc(100vh-280px)]">
        <MatchesGrid
          displayedMatches={displayedMatches}
          onOpenModal={onOpenModal}
          onLike={onLike}
          likedItems={likedItems}
          detailsRef={detailsRef}
        />
      </ScrollArea>
    </div>
  );
};

export default MatchesContainer;
