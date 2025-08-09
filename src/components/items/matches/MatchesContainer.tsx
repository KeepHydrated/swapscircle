
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
  onLike: (id: string, global?: boolean) => void;
  onReject: (id: string, global?: boolean) => void;
  onReport: (id: string) => void;
}

const MatchesContainer: React.FC<MatchesContainerProps> = ({
  displayedMatches,
  likedItems,
  onOpenModal,
  onLike,
  onReject,
  onReport
}) => {
  const detailsRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  console.log('🔍 MATCHES CONTAINER: isMobile detected:', isMobile);

  if (isMobile) {
    console.log('🔍 MATCHES CONTAINER: Rendering MobileMatchesView');
  } else {
    console.log('🔍 MATCHES CONTAINER: Rendering MatchesGrid');
  }

  if (isMobile) {
    return (
      <MobileMatchesView
        matches={displayedMatches}
        likedItems={likedItems}
        onLike={onLike}
        onReject={onReject}
        onReport={onReport}
        onOpenModal={onOpenModal}
      />
    );
  }

  return (
    <div className="relative h-full overflow-x-auto overflow-y-hidden"> {/* Show horizontal scrollbar */}
      <div className="min-h-full">
        <MatchesGrid
          displayedMatches={displayedMatches}
          onOpenModal={onOpenModal}
          onLike={onLike}
          onReject={onReject}
          onReport={onReport}
          likedItems={likedItems}
          detailsRef={detailsRef}
        />
      </div>
    </div>
  );
};

export default MatchesContainer;
