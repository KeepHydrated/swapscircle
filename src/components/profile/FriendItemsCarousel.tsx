
import React, { useState, useEffect, useRef } from 'react';
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
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<'left' | 'right'>('left');
  const carouselRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  const handleLikeClick = (e: React.MouseEvent, item: MatchItem) => {
    e.stopPropagation(); // Prevent triggering selection when clicking heart
    onLikeItem(item.id);
    
    toast({
      title: item.liked ? "Removed from favorites" : "Added to favorites",
      description: `${item.name} has been ${item.liked ? "removed from" : "added to"} your favorites.`
    });
  };

  const handleItemClick = (itemId: string, itemElement: HTMLElement) => {
    // Calculate if the item is in the left or right half of the screen
    if (itemElement) {
      const rect = itemElement.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const isOnRightSide = (rect.left + rect.width/2) > windowWidth/2;
      setDropdownPosition(isOnRightSide ? 'right' : 'left');
    }
    
    setSelectedItemId(prevId => prevId === itemId ? null : itemId);
  };

  // Close the dropdown when clicking outside of the carousel or details panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectedItemId) {
        // Check if the click is outside both the carousel and the details panel
        const isOutsideCarousel = carouselRef.current && !carouselRef.current.contains(event.target as Node);
        const isOutsideDetails = detailsRef.current && !detailsRef.current.contains(event.target as Node);
        
        if (isOutsideCarousel && isOutsideDetails) {
          setSelectedItemId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedItemId]);

  const selectedItem = items.find(item => item.id === selectedItemId);

  return (
    <div className="relative w-full">
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
      <div ref={carouselRef}>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {items.map((item) => (
              <CarouselItem key={item.id} className="basis-full sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
                <Card 
                  className={`overflow-hidden cursor-pointer transition-all ${
                    selectedItemId === item.id ? 'ring-2 ring-primary shadow-md' : ''
                  }`}
                  onClick={(e) => handleItemClick(item.id, e.currentTarget)}
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
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80" />
          <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80" />
        </Carousel>
      </div>

      {/* Item details panel that appears when an item is selected */}
      {selectedItem && (
        <div className={`flex ${dropdownPosition === 'left' ? 'justify-start' : 'justify-end'} w-full`}>
          <div 
            ref={detailsRef} 
            className="mt-4 bg-white rounded-lg border p-6 animate-fade-in w-full md:w-1/2"
          >
            <h2 className="text-2xl font-bold mb-2">{selectedItem.name}</h2>
            
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <p className="text-gray-700">
                Like new condition. This item has been gently used and well maintained. Perfect for
                anyone looking for a high-quality {selectedItem.name.toLowerCase()} at a great value.
              </p>
            </div>
            
            <hr className="my-4" />
            
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <span className="text-gray-800 text-sm">Brand New</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                  <span className="text-blue-600 text-xs">⌂</span>
                </div>
                <span className="text-gray-800 text-sm">Home & Garden</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                  <span className="text-purple-600 text-xs">𝍢</span>
                </div>
                <span className="text-gray-800 text-sm">Kitchen Appliances</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                  <span className="text-green-600 text-xs">$</span>
                </div>
                <span className="text-gray-800 text-sm">$100 - $250</span>
              </div>
            </div>
            
            <hr className="my-4" />
            
            <div className="flex items-center mt-2">
              <div className="flex-shrink-0 mr-4">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&h=250&auto=format&fit=crop"
                  alt="Owner" 
                  className="w-12 h-12 rounded-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold mr-2">Emma Wilson</h3>
                  <div className="flex text-amber-400">★★★★★</div>
                  <span className="text-gray-500 text-xs ml-1">(42 reviews)</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="mr-1">📅</span>
                    <span>Since 2023</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">📍</span>
                    <span>2.3 mi away</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">🕒</span>
                    <span>Response: ~1 hour</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendItemsCarousel;
