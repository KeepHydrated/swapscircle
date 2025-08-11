
import React from 'react';
import { MatchItem } from '@/types/item';
import ItemCard from '@/components/items/ItemCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface MatchesCarouselProps {
  items: MatchItem[];
  likedItems: Record<string, boolean>;
  onOpenModal: (id: string) => void;
  onLike: (id: string, global?: boolean) => void;
  onReject: (id: string, global?: boolean) => void;
  onReport: (id: string) => void;
}

const MatchesCarousel: React.FC<MatchesCarouselProps> = ({
  items,
  likedItems,
  onOpenModal,
  onLike,
  onReject,
  onReport,
}) => {
  return (
    <div className="relative w-full h-full">
      <Carousel
        opts={{
          align: 'start',
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {items.map((match) => (
            <CarouselItem key={match.id} className="pl-2 md:pl-4 basis-auto">
              <div className="w-48">
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
            </CarouselItem>) )}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
    </div>
  );
};

export default MatchesCarousel;
