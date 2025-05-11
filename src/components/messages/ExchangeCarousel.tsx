
import React, { useState, useEffect } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import useEmblaCarousel from "embla-carousel-react";
import { toast } from "sonner";

interface ExchangePair {
  id: number;
  item1: { name: string; image: string };
  item2: { name: string; image: string };
  partnerId: string;
}

interface ExchangeCarouselProps {
  exchangePairs: ExchangePair[];
  selectedPairId: number | null;
  onPairSelect: (partnerId: string, pairId: number) => void;
}

const ExchangeCarousel: React.FC<ExchangeCarouselProps> = ({
  exchangePairs,
  selectedPairId,
  onPairSelect
}) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    dragFree: true,
  });

  // Update active slide index when carousel scrolls
  useEffect(() => {
    if (!emblaApi) return;
    
    const onScroll = () => {
      const currentIndex = emblaApi.selectedScrollSnap();
      setActiveSlideIndex(currentIndex);
    };
    
    emblaApi.on('scroll', onScroll);
    // Initial call to set the correct starting position
    onScroll();
    
    return () => {
      emblaApi.off('scroll', onScroll);
    };
  }, [emblaApi]);

  return (
    <div className="w-full py-6 border-b border-gray-200">
      <div className="w-full max-w-5xl mx-auto">
        {/* Using direct embla carousel reference for more control */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex cursor-grab active:cursor-grabbing">
            {exchangePairs.map((pair) => (
              <div key={pair.id} className="min-w-0 shrink-0 grow-0 basis-1/3 md:basis-1/4 lg:basis-1/4 pl-4 pr-4">
                <div 
                  className={`flex flex-row items-center justify-between cursor-pointer p-3 rounded-md ${selectedPairId === pair.id ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                  onClick={() => onPairSelect(pair.partnerId, pair.id)}
                >
                  {/* First item */}
                  <div className="flex flex-col items-center w-1/3">
                    <Avatar className="h-14 w-14 bg-gray-100">
                      <AvatarImage src={pair.item1.image} alt={pair.item1.name} />
                      <AvatarFallback>{pair.item1.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs mt-1 truncate w-full text-center text-gray-700">{pair.item1.name}</span>
                  </div>
                  
                  {/* Exchange icon */}
                  <div className="flex items-center justify-center h-8 w-8 mx-1 rounded-full bg-blue-100">
                    <ArrowLeftRight className="h-4 w-4 text-blue-600" />
                  </div>
                  
                  {/* Second item */}
                  <div className="flex flex-col items-center w-1/3">
                    <Avatar className="h-14 w-14 bg-gray-100">
                      <AvatarImage src={pair.item2.image} alt={pair.item2.name} />
                      <AvatarFallback>{pair.item2.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs mt-1 truncate w-full text-center text-gray-700">{pair.item2.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Custom slider indicator */}
        <div className="flex justify-center items-center mt-4 px-4">
          <div className="w-full max-w-md mx-auto px-4">
            {/* Custom slider that matches the image */}
            <div className="relative h-1 bg-gray-200 rounded-full">
              <div 
                className="absolute h-1 bg-gray-500 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(activeSlideIndex + 1) * (100 / (exchangePairs.length / 3))}%`,
                  maxWidth: '100%' 
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExchangeCarousel;
