
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ItemImageCarouselProps {
  images: string[];
  itemName: string;
}

const ItemImageCarousel: React.FC<ItemImageCarouselProps> = ({ images, itemName }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };
  
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className="md:w-[55%] bg-gray-100 relative">
      <img 
        src={images[currentImageIndex]} 
        alt={`${itemName} - image ${currentImageIndex + 1}`} 
        className="w-full h-full object-contain"
      />
      
      {/* Image navigation buttons - only show if multiple images */}
      {images.length > 1 && (
        <>
          <button 
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 flex items-center justify-center hover:bg-white transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>
          
          <button 
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 flex items-center justify-center hover:bg-white transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5 text-gray-800" />
          </button>
          
          {/* Image counter */}
          <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs rounded-full px-2 py-1">
            {currentImageIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
};

export default ItemImageCarousel;
