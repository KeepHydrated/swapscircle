
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MatchItem } from '@/types/item';
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
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
  currentIndex,
  totalItems
}) => {
  // For multiple images (dummy data as example)
  const images = [
    item.image,
    'https://images.unsplash.com/photo-1721322800607-8c38375eef04',
    'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9'
  ];

  // Handle like click with popup closing
  const handleLikeClick = (item: MatchItem) => {
    if (onLikeClick) {
      onLikeClick(item);
    }
  };

  const showNavigation = onNavigatePrev && onNavigateNext && totalItems && totalItems > 1;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogOverlay className="bg-black/80" />
      
      <DialogContent className={`max-w-3xl p-0 border-none bg-white rounded-lg overflow-hidden relative ${className}`}>
        <DialogTitle className="sr-only">{item.name}</DialogTitle>
        
        {/* Navigation buttons positioned inside the modal content */}
        {showNavigation && (
          <>
            <button
              onClick={onNavigatePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors z-[60] border border-gray-200"
              aria-label="Previous match"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            
            <button
              onClick={onNavigateNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors z-[60] border border-gray-200"
              aria-label="Next match"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </>
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
            showProfileInfo={showProfileInfo} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemDetailsPopup;
