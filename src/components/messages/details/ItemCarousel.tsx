
import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem,
  type CarouselApi
} from '@/components/ui/carousel';

interface ItemCarouselProps {
  imageUrls: string[];
}

const ItemCarousel = ({ imageUrls }: ItemCarouselProps) => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  useEffect(() => {
    if (!api) return;
    
    const onSelect = () => {
      setSelectedIndex(api.selectedScrollSnap());
    };
    
    api.on('select', onSelect);
    onSelect();
    
    return () => {
      api.off('select', onSelect);
    };
  }, [api]);
  
  const scrollPrev = () => api && api.scrollPrev();
  const scrollNext = () => api && api.scrollNext();
  
  return (
    <>
      {/* Main image container with navigation buttons */}
      <div className="relative h-56 bg-gray-100 overflow-hidden">
        <Carousel setApi={setApi} opts={{ align: "center", loop: true }} className="h-full">
          <CarouselContent className="h-full">
            {imageUrls.map((url, index) => (
              <CarouselItem key={index} className="h-full">
                <div 
                  className="w-full h-full bg-center bg-cover bg-no-repeat flex items-center justify-center text-gray-400"
                  style={{ backgroundImage: `url(${url})` }}
                >
                  {!url && <span>Image {index + 1}</span>}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        
        {/* Navigation buttons */}
        <button 
          onClick={scrollPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <button 
          onClick={scrollNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50"
          aria-label="Next image"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
        
        {/* Image counter */}
        <div className="absolute bottom-2 right-2 bg-gray-800 bg-opacity-70 text-white text-sm rounded-full px-2 py-0.5">
          {selectedIndex + 1}/{imageUrls.length}
        </div>
      </div>
      
      {/* Thumbnail strip */}
      <div className="p-2 flex overflow-x-auto bg-white border-t border-gray-100">
        {imageUrls.map((url, index) => (
          <div 
            key={index}
            onClick={() => api?.scrollTo(index)} 
            className={`flex-shrink-0 w-16 h-16 mx-1 cursor-pointer ${selectedIndex === index ? 'border-2 border-blue-500' : 'border border-gray-200'}`}
          >
            <div 
              className="w-full h-full bg-center bg-cover flex items-center justify-center text-gray-400"
              style={{ backgroundImage: `url(${url})` }}
            >
              {!url && <span>Image {index + 1}</span>}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ItemCarousel;
