
import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { MatchItem } from '@/types/item';
import ItemDetailsPopover from './ItemDetailsPopover';

interface FriendItemsCarouselProps {
  items: MatchItem[];
  onLikeItem: (itemId: string) => void;
  title?: string;
}

const FriendItemsCarousel: React.FC<FriendItemsCarouselProps> = ({ 
  items, 
  onLikeItem,
  title = "Your Friend's Items"
}) => {
  const [selectedItem, setSelectedItem] = useState<MatchItem | null>(null);

  const handleLikeClick = (e: React.MouseEvent, item: MatchItem) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent item selection when clicking like button
    onLikeItem(item.id);
    
    toast({
      title: item.liked ? "Removed from favorites" : "Added to favorites",
      description: `${item.name} has been ${item.liked ? "removed from" : "added to"} your favorites.`
    });
  };

  const handleItemClick = (item: MatchItem) => {
    setSelectedItem(item);
  };

  return (
    <div className="relative">
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {items.map((item) => (
            <CarouselItem key={item.id} className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
              <ItemDetailsPopover item={item}>
                <Card 
                  className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="relative">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full aspect-[4/3] object-cover"
                    />
                    <button 
                      className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
                      onClick={(e) => handleLikeClick(e, item)}
                    >
                      <Heart 
                        className={`h-5 w-5 ${item.liked ? "text-red-500 fill-red-500" : "text-gray-400"}`}
                      />
                    </button>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-center truncate">{item.name}</h3>
                  </div>
                </Card>
              </ItemDetailsPopover>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80" />
        <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80" />
      </Carousel>
    </div>
  );
};

export default FriendItemsCarousel;
