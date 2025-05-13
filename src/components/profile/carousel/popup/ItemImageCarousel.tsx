
import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

interface ItemImageCarouselProps {
  images: string[];
  itemName: string;
  className?: string;
}

const ItemImageCarousel: React.FC<ItemImageCarouselProps> = ({ 
  images, 
  itemName,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);
  
  // Update current index when slide changes
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setCurrentIndex]);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className={`relative flex flex-col ${className}`}>
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {images.map((image, index) => (
            <div key={index} className="flex-[0_0_100%] h-full min-w-0 flex items-center justify-center" style={{ height: "100%" }}>
              <div 
                style={{ 
                  backgroundImage: `url(${image})`,
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  width: "100%",
                  height: "100%"
                }} 
                aria-label={`${itemName} image ${index + 1}`}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Navigation arrows */}
      <button 
        className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white shadow-md flex items-center justify-center"
        onClick={scrollPrev}
        aria-label="Previous image"
      >
        <ChevronLeft className="h-4 w-4 text-gray-600" />
      </button>
      <button 
        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white shadow-md flex items-center justify-center"
        onClick={scrollNext}
        aria-label="Next image"
      >
        <ChevronRight className="h-4 w-4 text-gray-600" />
      </button>
      
      {/* Image counter */}
      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};

export default ItemImageCarousel;
