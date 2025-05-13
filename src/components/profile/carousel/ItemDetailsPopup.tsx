
import React, { useState } from 'react';
import { Check, Home, Utensils, DollarSign, MapPin, Clock, Calendar, X, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { MatchItem } from '@/types/item';
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';

interface ItemDetailsPopupProps {
  item: MatchItem;
  isOpen: boolean;
  onClose: () => void;
  onLikeClick?: (item: MatchItem) => void;
  className?: string;
  canEdit?: boolean;
}

const ItemDetailsPopup: React.FC<ItemDetailsPopupProps> = ({ 
  item, 
  isOpen,
  onClose,
  onLikeClick,
  className = '',
  canEdit = false
}) => {
  // For multiple images (dummy data as example)
  const images = [
    item.image,
    'https://images.unsplash.com/photo-1721322800607-8c38375eef04',
    'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9'
  ];
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLikeClick) {
      onLikeClick(item);
    }
  };
  
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };
  
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogOverlay className="bg-black/80" />
      <DialogContent className={`max-w-4xl p-0 border-none bg-white rounded-lg overflow-hidden ${className}`}>
        <DialogTitle className="sr-only">{item.name}</DialogTitle>
        
        {/* Action buttons - Like button now on the left of the X button */}
        <div className="absolute right-4 top-4 flex items-center space-x-2 z-10">
          <button 
            onClick={handleLikeClick}
            className="rounded-full bg-white p-1.5 shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Like item"
          >
            <Heart 
              className={`h-5 w-5 ${item.liked ? "text-red-500 fill-red-500" : "text-gray-600"}`}
            />
          </button>
          <button 
            onClick={onClose}
            className="rounded-full bg-white p-1.5 shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row h-[60vh] max-h-[550px]">
          {/* Left side - Image Carousel (now more narrow) */}
          <div className="md:w-[55%] bg-gray-100 relative">
            <img 
              src={images[currentImageIndex]} 
              alt={`${item.name} - image ${currentImageIndex + 1}`} 
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
          
          {/* Right side - Item details (now wider relative to image) */}
          <div className="md:w-[45%] flex flex-col">
            <ScrollArea className="flex-grow">
              <div className="p-6 pt-12"> {/* More padding on top */}
                <h2 className="text-xl font-bold mb-3">{item.name}</h2>
                
                <div className="bg-gray-50 p-3 rounded-md mb-4">
                  <p className="text-gray-700 text-sm">
                    Like new condition. This item has been gently used and well maintained. Perfect for
                    anyone looking for a high-quality {item.name.toLowerCase()} at a great value.
                  </p>
                </div>
                
                <hr className="my-4" />
                
                {/* Aligned vertically - First row */}
                <div className="flex gap-4 mb-3">
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-1.5">
                      <Check className="w-2.5 h-2.5 text-green-600" />
                    </div>
                    <span className="text-gray-800 text-xs">Brand New</span>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-1.5">
                      <Home className="w-2.5 h-2.5 text-blue-600" />
                    </div>
                    <span className="text-gray-800 text-xs">Home & Garden</span>
                  </div>
                </div>
                
                {/* Aligned vertically - Second row */}
                <div className="flex gap-4 mb-3">
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center mr-1.5">
                      <Utensils className="w-2.5 h-2.5 text-purple-600" />
                    </div>
                    <span className="text-gray-800 text-xs">Kitchen</span>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-1.5">
                      <DollarSign className="w-2.5 h-2.5 text-green-600" />
                    </div>
                    <span className="text-gray-800 text-xs">$100-$250</span>
                  </div>
                </div>
                
                <hr className="my-4" />
                
                {/* User profile section with vertical layout for user details */}
                <div className="mt-4">
                  <div className="flex flex-col">
                    {/* Profile image and name/rating row */}
                    <div className="mb-3 flex">
                      <div className="flex-shrink-0 mr-3">
                        <img 
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&h=250&auto=format&fit=crop"
                          alt="Owner" 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <div className="flex items-center">
                          <h3 className="text-sm font-semibold mr-2">Emma Wilson</h3>
                          <div className="flex text-amber-400 text-xs">★★★★★ <span className="text-gray-500 ml-1">(42)</span></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* User details stacked vertically below the profile pic */}
                    <div className="flex flex-col space-y-1.5 text-xs text-gray-600 ml-1">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span>Since 2023</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span>2.3 mi away</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span>~1 hour</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemDetailsPopup;
