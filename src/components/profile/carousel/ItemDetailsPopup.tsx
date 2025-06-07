
import React from 'react';
import { MatchItem } from '@/types/item';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import ItemImageCarousel from './popup/ItemImageCarousel';
import ItemDetailsContent from './popup/ItemDetailsContent';
import ActionButtons from './popup/ActionButtons';

interface ItemDetailsPopupProps {
  item: MatchItem;
  isOpen: boolean;
  onClose: () => void;
  onLikeClick?: (item: MatchItem) => void;
  onEditClick?: () => void;
  onDuplicateClick?: () => void;
  onDeleteClick?: () => void;
  className?: string;
  canEdit?: boolean;
  showProfileInfo?: boolean;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  showNavigation?: boolean;
  currentIndex?: number;
  totalItems?: number;
}

const ItemDetailsPopup: React.FC<ItemDetailsPopupProps> = ({ 
  item, 
  isOpen,
  onClose,
  onLikeClick,
  onEditClick,
  onDuplicateClick,
  onDeleteClick,
  className = '',
  canEdit = false,
  showProfileInfo = true,
  onNavigatePrev,
  onNavigateNext,
  showNavigation = false,
  currentIndex = 0,
  totalItems = 0
}) => {
  // For multiple images (use item image and some defaults)
  const images = [
    item.image,
    'https://images.unsplash.com/photo-1597600159211-d6c104f408d1', // Additional sample image
    'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9'  // Additional sample image
  ];

  // Handle like click with popup closing
  const handleLikeClick = (item: MatchItem) => {
    if (onLikeClick) {
      onLikeClick(item);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogOverlay className="bg-black/80 flex items-center justify-center" />
      <DialogContent className={`max-w-3xl p-0 border-none bg-white rounded-lg overflow-hidden relative ${className} fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]`}>
        <DialogTitle className="sr-only">{item.name}</DialogTitle>
        
        {/* Navigation arrows - positioned outside the modal content */}
        {showNavigation && onNavigatePrev && (
          <Button
            variant="outline"
            size="icon"
            onClick={onNavigatePrev}
            className="absolute left-[-60px] top-1/2 -translate-y-1/2 z-50 h-12 w-12 rounded-full bg-white shadow-lg hover:bg-gray-50"
            aria-label="Previous item"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}
        
        {showNavigation && onNavigateNext && (
          <Button
            variant="outline"
            size="icon"
            onClick={onNavigateNext}
            className="absolute right-[-60px] top-1/2 -translate-y-1/2 z-50 h-12 w-12 rounded-full bg-white shadow-lg hover:bg-gray-50"
            aria-label="Next item"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        )}
        
        {/* Item counter */}
        {showNavigation && totalItems > 1 && (
          <div className="absolute bottom-[-50px] left-1/2 -translate-x-1/2 bg-white rounded-full px-4 py-2 text-sm font-medium shadow-md z-50">
            {currentIndex + 1} / {totalItems}
          </div>
        )}
        
        {/* Action buttons component */}
        <ActionButtons 
          item={item} 
          onLikeClick={handleLikeClick} 
          onClose={onClose}
          onEditClick={onEditClick}
          onDuplicateClick={onDuplicateClick}
          onDeleteClick={onDeleteClick}
          canEdit={canEdit}
        />
        
        <div className="flex flex-col md:flex-row h-[60vh] max-h-[550px] overflow-hidden">
          {/* Left side - Image Carousel with reduced width */}
          <ItemImageCarousel images={images} itemName={item.name} className="md:w-[50%]" />
          
          {/* Right side - Item details with showProfileInfo prop */}
          <ItemDetailsContent 
            name={item.name}
            description={item.description || "No description available."}
            category={item.category || "Uncategorized"}
            condition={item.condition || "Not specified"}
            tags={item.tags || []}
            priceRange={item.priceRange || "Not specified"}
            showProfileInfo={showProfileInfo} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemDetailsPopup;
