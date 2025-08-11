
import React from 'react';
import { MatchItem } from '@/types/item';
import MatchesCarousel from './MatchesCarousel';
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
  const isMobile = useIsMobile();


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
    <div className="relative h-full">
      <MatchesCarousel
        items={displayedMatches}
        likedItems={likedItems}
        onOpenModal={onOpenModal}
        onLike={onLike}
        onReject={onReject}
        onReport={onReport}
      />
    </div>
  );
};

export default MatchesContainer;
