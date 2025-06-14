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

  // Add debugging
  // console.log('ItemDetailsPopup props:', {
  //   showNavigation,
  //   currentIndex,
  //   totalItems,
  //   hasNavigatePrev: !!onNavigatePrev,
  //   hasNavigateNext: !!onNavigateNext
  // });

  // Handle navigation with debugging
  const handleNavigatePrev = () => {
    // console.log('Prev button clicked');
    if (onNavigatePrev) {
      onNavigatePrev();
    }
  };

  const handleNavigateNext = () => {
    // console.log('Next button clicked');
    if (onNavigateNext) {
      onNavigateNext();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogOverlay className="bg-black/80" />
        <DialogContent
          className={`
            relative 
            max-w-3xl 
            w-full
            p-0 
            border-none
            bg-white
            rounded-lg
            overflow-hidden
            left-1/2 top-1/2
            -translate-x-1/2 -translate-y-1/2
            fixed
            shadow-lg
            ${className}
          `}
        >
          <DialogTitle className="sr-only">{item.name}</DialogTitle>
          
          {/* Navigation arrows: positioned outside the modal border, centered vertically */}
          {showNavigation && isOpen && (
            <>
              {/* Left arrow */}
              <button
                onClick={handleNavigatePrev}
                className="
                  absolute
                  -left-7
                  top-1/2
                  -translate-y-1/2
                  w-12 h-12
                  bg-white shadow-lg border border-gray-200
                  rounded-full flex items-center justify-center
                  hover:bg-gray-50
                  z-[70] transition-colors
                  focus:outline-none focus:ring-2 focus:ring-primary
                "
                aria-label="Previous match"
              >
                <ChevronLeft className="w-7 h-7 text-gray-700" />
              </button>
              {/* Right arrow */}
              <button
                onClick={handleNavigateNext}
                className="
                  absolute
                  -right-7
                  top-1/2
                  -translate-y-1/2
                  w-12 h-12
                  bg-white shadow-lg border border-gray-200
                  rounded-full flex items-center justify-center
                  hover:bg-gray-50
                  z-[70] transition-colors
                  focus:outline-none focus:ring-2 focus:ring-primary
                "
                aria-label="Next match"
              >
                <ChevronRight className="w-7 h-7 text-gray-700" />
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
            {/* Left side - Image Carousel */}
            <ItemImageCarousel
              images={images}
              itemName={item.name}
              className="md:w-[50%]"
            />
            
            {/* Right side - Item details */}
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
