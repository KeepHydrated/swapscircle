
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

  const handleLikeClick = (item: MatchItem) => {
    if (onLikeClick) {
      onLikeClick(item);
    }
  };

  const showNavigation = onNavigatePrev && onNavigateNext && totalItems && totalItems > 1;

  const handleNavigatePrev = () => {
    if (onNavigatePrev) {
      onNavigatePrev();
    }
  };

  const handleNavigateNext = () => {
    if (onNavigateNext) {
      onNavigateNext();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* Overlay: pure black */}
      <DialogOverlay className="bg-black/100" />
      {/* Use a transparent Content, no padding, to build our own card centered inside */}
      <DialogContent
        asChild
        className={`
          fixed inset-0 flex items-center justify-center
          p-0 border-0 bg-transparent shadow-none 
          z-50
          ${className}
        `}
      >
        <div className="w-full h-full flex items-center justify-center relative pointer-events-none">
          {/* Centered Card */}
          <div
            className="
              relative pointer-events-auto
              bg-white rounded-2xl shadow-2xl
              max-w-4xl w-[98vw] md:w-[830px] 
              max-h-[90vh] min-h-[540px] flex flex-col
              justify-center
              overflow-visible
              animate-fade-in
            "
            style={{ zIndex: 20 }}
          >
            <DialogTitle className="sr-only">{item.name}</DialogTitle>
            {/* Action Buttons inside card, top-right */}
            <ActionButtons 
              item={item} 
              onLikeClick={handleLikeClick} 
              onClose={onClose}
              onEditClick={onEditClick}
              onDuplicateClick={onDuplicateClick}
              onDeleteClick={onDeleteClick}
              canEdit={canEdit}
            />
            {/* Card Main Content: Row with images and info */}
            <div className="flex flex-col md:flex-row h-[500px] md:h-[520px]">
              {/* Left: Images */}
              <ItemImageCarousel
                images={images}
                itemName={item.name}
                className="md:w-[54%] w-full h-60 md:h-full rounded-l-2xl object-cover"
              />
              {/* Right: Info, Centered vertically and horizontally */}
              <div className="flex-1 flex items-center justify-center px-6 py-3">
                <ItemDetailsContent 
                  name={item.name} 
                  showProfileInfo={showProfileInfo} 
                />
              </div>
            </div>
          </div>
          {/* Navigation arrows: On the sides of the card, attached from outside, perfectly centered */}
          {showNavigation && (
            <>
              {/* Arrow LEFT: On the immediate left OUTSIDE the card */}
              <button
                onClick={handleNavigatePrev}
                className="
                  absolute
                  top-1/2
                  left-1/2
                  -translate-y-1/2
                  -translate-x-[calc(50%_+_490px)] md:-translate-x-[calc(50%_+_465px)]
                  w-14 h-14
                  bg-white border border-gray-200 rounded-full shadow-lg
                  flex items-center justify-center
                  hover:bg-gray-50
                  z-50 transition-colors
                  focus:outline-none focus:ring-2 focus:ring-primary
                  pointer-events-auto
                "
                aria-label="Previous match"
                style={{
                  // These are fallback for precise positioning beside .max-w-4xl card (w-[830px]), but flexible for mobile
                  minWidth: 48, minHeight: 48
                }}
              >
                <ChevronLeft className="w-7 h-7 text-gray-700" />
              </button>
              {/* Arrow RIGHT: On the immediate right OUTSIDE the card */}
              <button
                onClick={handleNavigateNext}
                className="
                  absolute
                  top-1/2
                  left-1/2
                  -translate-y-1/2
                  translate-x-[calc(50%_+_490px)] md:translate-x-[calc(50%_+_465px)]
                  w-14 h-14
                  bg-white border border-gray-200 rounded-full shadow-lg
                  flex items-center justify-center
                  hover:bg-gray-50
                  z-50 transition-colors
                  focus:outline-none focus:ring-2 focus:ring-primary
                  pointer-events-auto
                "
                aria-label="Next match"
                style={{
                  minWidth: 48, minHeight: 48
                }}
              >
                <ChevronRight className="w-7 h-7 text-gray-700" />
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemDetailsPopup;

