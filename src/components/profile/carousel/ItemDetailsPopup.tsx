
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogOverlay className="bg-black/80" />
      <DialogContent className={`max-w-4xl p-0 border-none bg-white rounded-lg overflow-hidden ${className}`}>
        <DialogTitle className="sr-only">{item.name}</DialogTitle>
        
        {/* Action buttons component */}
        <ActionButtons 
          item={item} 
          onLikeClick={onLikeClick} 
          onClose={onClose}
        />
        
        <div className="flex flex-col md:flex-row h-[60vh] max-h-[550px]">
          {/* Left side - Image Carousel */}
          <ItemImageCarousel images={images} itemName={item.name} />
          
          {/* Right side - Item details */}
          <ItemDetailsContent name={item.name} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemDetailsPopup;
