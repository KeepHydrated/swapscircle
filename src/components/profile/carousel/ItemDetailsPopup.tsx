
import React from 'react';
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
  showProfileInfo = true
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
      <DialogOverlay className="bg-black/80" />
      <DialogContent className={`max-w-3xl p-0 border-none bg-white rounded-lg overflow-hidden ${className}`}>
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
