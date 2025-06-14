
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MatchItem } from '@/types/item';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
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

  // Debug: log when the dialog opens
  React.useEffect(() => {
    if (isOpen) {
      console.log("[ItemDetailsPopup] Modal OPEN for item:", item);
      // Extra debug
      (window as any).__lastItemDetailsPopupOpened = item;
    }
  }, [isOpen, item]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      {/* VISIBLE DEBUG ONLY */}
      <DialogContent
        className={`
          max-w-[1200px] w-[99vw] md:w-[1050px]
          max-h-[93vh] min-h-[580px] flex flex-col justify-center
          relative bg-white rounded-2xl shadow-2xl p-0 border-4 border-red-500
          ${className}
          animate-fade-in
        `}
        style={{
          overflow: "visible",
          zIndex: 50000, // maximize zIndex
          backgroundColor: "rgba(255,255,255,0.98)" // make sure it's NOT transparent
        }}
      >
        <div style={{
          color: 'red',
          fontSize: 40,
          textAlign: 'center',
          fontWeight: 900,
          border: '4px solid orange',
          margin: 8,
          background: 'rgba(255,255,0,0.1)',
          borderRadius: 12
        }}>
          DEBUG: MODAL IS OPEN!
        </div>
        <DialogTitle className="sr-only">{item.name}</DialogTitle>
        <DialogDescription>
          Details and actions for item: {item.name}
        </DialogDescription>
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
        <div className="flex flex-col md:flex-row h-[520px] md:h-[540px]">
          {/* Left: Images */}
          <ItemImageCarousel
            images={images}
            itemName={item.name}
            className="md:w-[54%] w-full h-64 md:h-full rounded-l-2xl object-cover"
          />
          {/* Right: Info */}
          <div className="flex-1 flex items-center justify-center px-8 py-5">
            <ItemDetailsContent 
              name={item.name} 
              showProfileInfo={showProfileInfo} 
            />
          </div>
        </div>
        {showNavigation && (
          <>
            <button
              onClick={handleNavigatePrev}
              className="
                absolute
                z-50
                top-1/2
                left-0
                -translate-y-1/2
                -translate-x-1/2
                w-16 h-16
                bg-white border border-gray-200 rounded-full shadow-xl
                flex items-center justify-center
                hover:bg-gray-50
                transition-colors
                focus:outline-none focus:ring-2 focus:ring-primary
                pointer-events-auto
              "
              aria-label="Previous match"
              style={{
                minWidth: 56, minHeight: 56
              }}
            >
              <ChevronLeft className="w-8 h-8 text-gray-700" />
            </button>
            <button
              onClick={handleNavigateNext}
              className="
                absolute
                z-50
                top-1/2
                right-0
                -translate-y-1/2
                translate-x-1/2
                w-16 h-16
                bg-white border border-gray-200 rounded-full shadow-xl
                flex items-center justify-center
                hover:bg-gray-50
                transition-colors
                focus:outline-none focus:ring-2 focus:ring-primary
                pointer-events-auto
              "
              aria-label="Next match"
              style={{
                minWidth: 56, minHeight: 56
              }}
            >
              <ChevronRight className="w-8 h-8 text-gray-700" />
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ItemDetailsPopup;
