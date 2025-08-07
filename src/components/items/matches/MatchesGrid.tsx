
import React from 'react';
import ItemCard from '../ItemCard';
import { MatchItem } from '@/types/item';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

interface MatchesGridProps {
  displayedMatches: MatchItem[];
  onOpenModal: (id: string) => void;
  onLike: (id: string, global?: boolean) => void;
  onReject: (id: string, global?: boolean) => void;
  onReport: (id: string) => void;
  likedItems: Record<string, boolean>;
  detailsRef: React.RefObject<HTMLDivElement>;
}

const MatchesGrid: React.FC<MatchesGridProps> = ({
  displayedMatches,
  onOpenModal,
  onLike,
  onReject,
  onReport,
  likedItems,
  detailsRef
}) => {
  return (
    <div className="relative w-full" ref={detailsRef}>
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2">
          {displayedMatches.map(match => {
            console.log('🔍 MatchesGrid: Rendering match', { id: match.id, name: match.name, isMatch: true });
            return (
              <CarouselItem key={match.id} className="pl-2 basis-auto">
                <div className="w-64">
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
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
    </div>
  );
};

export default MatchesGrid;
