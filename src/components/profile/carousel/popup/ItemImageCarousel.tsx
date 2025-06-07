
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className={`relative bg-black flex flex-col ${className}`}>
      {/* Main image container */}
      <div className="flex-1 flex items-center justify-center">
        <img 
          src={images[currentImageIndex]} 
          alt={itemName} 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Navigation arrows at bottom */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-4 z-10">
          <button
            onClick={goToPrevious}
            className="w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          
          <button
            onClick={goToNext}
            className="w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>
        </div>
      )}
      
      {/* Image counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 right-4 bg-black/60 text-white text-sm px-2 py-1 rounded">
          {currentImageIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
};

export default ItemImageCarousel;
