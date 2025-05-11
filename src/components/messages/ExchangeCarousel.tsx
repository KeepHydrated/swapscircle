
import React from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem 
} from '@/components/ui/carousel';

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
  return (
    <div className="h-full flex items-center w-full">
      <div className="w-full max-w-5xl mx-auto">
        <Carousel
          opts={{
            align: "start",
            loop: true,
            dragFree: true,
          }}
        >
          <CarouselContent className="px-4">
            {exchangePairs.map((pair) => (
              <CarouselItem key={pair.id} className="basis-1/3 md:basis-1/4 lg:basis-1/5 pl-4 pr-8">
                <div 
                  className={`flex items-center cursor-pointer rounded-lg ${
                    selectedPairId === pair.id 
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onPairSelect(pair.partnerId, pair.id)}
                >
                  <div className="flex items-center p-3 w-full">
                    {/* First item */}
                    <div className="flex flex-col items-center flex-1">
                      <Avatar className="h-10 w-10 bg-gray-100">
                        <AvatarImage src={pair.item1.image} alt={pair.item1.name} />
                        <AvatarFallback className="text-lg font-medium">{pair.item1.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-blue-600 font-medium mt-2 text-center">
                        {pair.item1.name}
                      </span>
                    </div>
                    
                    {/* Exchange icon */}
                    <div className="flex items-center justify-center mx-3">
                      <ArrowLeftRight className="h-5 w-5 text-blue-400" />
                    </div>
                    
                    {/* Second item */}
                    <div className="flex flex-col items-center flex-1">
                      <Avatar className="h-10 w-10 bg-gray-100">
                        <AvatarImage src={pair.item2.image} alt={pair.item2.name} />
                        <AvatarFallback className="text-lg font-medium">{pair.item2.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600 font-medium mt-2 text-center">
                        {pair.item2.name}
                      </span>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
};

export default ExchangeCarousel;
