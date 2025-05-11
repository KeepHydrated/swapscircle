
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
  
  const handleCloseDetails = () => {
    setSelectedItem(null);
  };

  return (
    <div className="relative">
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
      <div className="flex gap-6 items-start">
        <div className={`${selectedItem ? 'w-2/3' : 'w-full'} transition-all duration-300`}>
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
                      className={`overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${
                        selectedItem?.id === item.id ? 'ring-2 ring-blue-500' : ''
                      }`}
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
        
        {selectedItem && (
          <div className="w-1/3 bg-white rounded-lg shadow-md overflow-hidden animate-in fade-in-0 slide-in-from-right-5 duration-300">
            <div className="p-4 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{selectedItem.name}</h3>
                <button 
                  onClick={handleCloseDetails} 
                  className="text-gray-400 hover:text-gray-600"
                >
                  &times;
                </button>
              </div>
            </div>
            
            <div className="relative h-48 bg-gray-100">
              <img 
                src={selectedItem.image} 
                alt={selectedItem.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 right-2">
                <button 
                  className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLikeItem(selectedItem.id);
                  }}
                >
                  <Heart 
                    className={`h-5 w-5 ${selectedItem.liked ? "text-red-500 fill-red-500" : "text-gray-400"}`}
                  />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
                <p className="text-gray-700 text-sm">
                  Like new condition. This {selectedItem.name.toLowerCase()} has been gently used and well maintained. 
                  Perfect for anyone looking for a high-quality item at a great value.
                </p>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Details</h4>
                <ul className="text-sm">
                  <li className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Condition</span>
                    <span className="font-medium">Excellent</span>
                  </li>
                  <li className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Category</span>
                    <span className="font-medium capitalize">{selectedItem.category || "General"}</span>
                  </li>
                  <li className="flex justify-between py-1">
                    <span className="text-gray-500">Owner</span>
                    <span className="font-medium">Emma Wilson</span>
                  </li>
                </ul>
              </div>
              
              <button 
                className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                onClick={() => {
                  toast({
                    title: "Message sent",
                    description: `You requested to trade for ${selectedItem.name}.`
                  });
                  handleCloseDetails();
                }}
              >
                Message about this item
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendItemsCarousel;
