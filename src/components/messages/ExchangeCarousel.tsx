
import React, { useState, useEffect } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import useEmblaCarousel from "embla-carousel-react";

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
    <div className="h-full flex flex-col justify-center">
      <div className="w-full max-w-5xl mx-auto">
        {/* Using direct embla carousel reference for more control */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex cursor-grab active:cursor-grabbing">
            {exchangePairs.map((pair) => (
              <div key={pair.id} className="min-w-0 shrink-0 grow-0 basis-1/3 md:basis-1/4 lg:basis-1/4 px-1">
                <div 
                  className={`flex items-center justify-between cursor-pointer p-1.5 rounded-md h-10 ${selectedPairId === pair.id ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                  onClick={() => onPairSelect(pair.partnerId, pair.id)}
                >
                  {/* First item */}
                  <div className="flex items-center w-[45%]">
                    <Avatar className="h-7 w-7 mr-1.5 bg-gray-100">
                      <AvatarImage src={pair.item1.image} alt={pair.item1.name} />
                      <AvatarFallback>{pair.item1.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs truncate text-gray-700">{pair.item1.name}</span>
                  </div>
                  
                  {/* Exchange icon */}
                  <div className="flex items-center justify-center h-4 w-4 rounded-full bg-blue-100">
                    <ArrowLeftRight className="h-2.5 w-2.5 text-blue-600" />
                  </div>
                  
                  {/* Second item */}
                  <div className="flex items-center justify-end w-[45%]">
                    <span className="text-xs truncate text-gray-700 text-right mr-1.5">{pair.item2.name}</span>
                    <Avatar className="h-7 w-7 bg-gray-100">
                      <AvatarImage src={pair.item2.image} alt={pair.item2.name} />
                      <AvatarFallback>{pair.item2.name[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Custom slider indicator */}
        <div className="flex justify-center items-center px-4 mt-0.5">
          <div className="w-full max-w-md mx-auto">
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
