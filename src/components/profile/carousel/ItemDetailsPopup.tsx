
import React from 'react';
import { MatchItem } from '@/types/item';
import {
  Dialog,
  DialogContent,
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

  return (
    <>
      {/* Custom overlay that doesn't interfere with navigation buttons */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40"
          onClick={onClose}
        />
      )}
      
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent 
          className={`max-w-3xl p-0 border-none bg-white rounded-lg overflow-hidden z-50 relative ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          <DialogTitle className="sr-only">{item.name}</DialogTitle>
          
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
    </>
  );
};

export default ItemDetailsPopup;
