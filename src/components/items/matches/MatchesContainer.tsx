
import React, { useRef } from 'react';
import { MatchItem } from '@/types/item';
import { ScrollArea } from '@/components/ui/scroll-area';
import MatchesGrid from './MatchesGrid';
import { MobileMatchesView } from './MobileMatchesView';
import { useIsMobile } from '@/hooks/use-mobile'; // Fixed import

interface MatchesContainerProps {
  displayedMatches: MatchItem[];
  likedItems: Record<string, boolean>;
  onOpenModal: (id: string) => void;
  onLike: (id: string) => void;
  onReject: (id: string) => void;
}

const MatchesContainer: React.FC<MatchesContainerProps> = ({
  displayedMatches,
  likedItems,
  onOpenModal,
  onLike,
  onReject
}) => {
  const detailsRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobileMatchesView
        matches={displayedMatches}
        likedItems={likedItems}
        onLike={onLike}
        onReject={onReject}
        onOpenModal={onOpenModal}
      />
    );
  }

  return (
    <div className="relative">
      <div className="overflow-x-auto overflow-y-hidden h-auto">
        <MatchesGrid
          displayedMatches={displayedMatches}
          onOpenModal={onOpenModal}
          onLike={onLike}
          onReject={onReject}
          likedItems={likedItems}
          detailsRef={detailsRef}
        />
      </div>
    </div>
  );
};

export default MatchesContainer;
