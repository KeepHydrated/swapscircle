
import React, { useRef, useState, useEffect } from 'react';
import { MatchItem } from '@/types/item';
import { ScrollArea } from '@/components/ui/scroll-area';
import MatchesGrid from './MatchesGrid';
import { MobileMatchesView } from './MobileMatchesView';
import { useIsMobile } from '@/hooks/use-mobile';
import ItemCard from '../ItemCard';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';

interface MatchesContainerProps {
  displayedMatches: MatchItem[];
  likedItems: Record<string, boolean>;
  onOpenModal: (id: string) => void;
  onLike: (id: string, global?: boolean) => void;
  onReject: (id: string, global?: boolean) => void;
  onReport: (id: string) => void;
  viewMode?: 'slider' | 'grid';
}

const MatchesContainer: React.FC<MatchesContainerProps> = ({
  displayedMatches,
  likedItems,
  onOpenModal,
  onLike,
  onReject,
  onReport,
  viewMode = 'slider'
}) => {
  const detailsRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const gridScrollRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Handle scroll for back-to-top button
  useEffect(() => {
    const scrollContainer = gridScrollRef.current;
    if (!scrollContainer || viewMode !== 'grid') return;

    const handleScroll = () => {
      setShowScrollTop(scrollContainer.scrollTop > 300);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [viewMode]);

  const scrollToTop = () => {
    gridScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };


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

  // Grid view layout
  if (viewMode === 'grid') {
    return (
      <div ref={gridScrollRef} className="relative h-full overflow-y-auto">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-2">
          {displayedMatches.map(match => (
            <div key={match.id} className="w-full">
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
                userProfile={match.userProfile}
              />
            </div>
          ))}
        </div>
        
        {/* Back to top button */}
        {showScrollTop && (
          <Button
            onClick={scrollToTop}
            size="icon"
            className="fixed bottom-20 right-6 z-40 rounded-full shadow-lg"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        )}
      </div>
    );
  }

  // Slider view layout (default)
  return (
    <div className="relative h-full overflow-x-auto overflow-y-hidden">
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
