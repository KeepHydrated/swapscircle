import React from 'react';
import { ChevronLeft, ChevronRight, X, Heart } from 'lucide-react';
import { MatchItem } from '@/types/item';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface ItemDetailsModalProps {
  item: MatchItem | null;
  isOpen: boolean;
  onClose: () => void;
  onLikeClick?: (item: MatchItem) => void;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  currentIndex?: number;
  totalItems?: number;
  showProfileInfo?: boolean;
}

const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({
  item,
  isOpen,
  onClose,
  onLikeClick,
  onNavigatePrev,
  onNavigateNext,
  currentIndex,
  totalItems,
  showProfileInfo = true
}) => {
  if (!item) return null;

  const handleLikeClick = () => {
    if (onLikeClick && item) {
      onLikeClick(item);
    }
  };

  // Trade button handler for this modal
  const handleTradeNow = () => {
    toast({
      title: "Trade request started!",
      description: "You’ve started a trade request for this item.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="max-w-4xl w-[95vw] max-h-[90vh] p-0 overflow-hidden"
        aria-describedby="item-description"
      >
        
        <DialogTitle className="sr-only">{item.name}</DialogTitle>
        <DialogDescription id="item-description" className="sr-only">
          Item details for {item.name}
        </DialogDescription>
        
        {/* Close button - top right, smaller size */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-20"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        {/* Navigation buttons */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          {onNavigatePrev && (
            <button
              onClick={onNavigatePrev}
              className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Previous item"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          {onNavigateNext && (
            <button
              onClick={onNavigateNext}
              className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Next item"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>

        {/* Position indicator */}
        {currentIndex !== undefined && totalItems !== undefined && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-full px-3 py-1 text-sm font-medium shadow-md z-10">
            {currentIndex + 1} / {totalItems}
          </div>
        )}

        <div className="flex flex-col md:flex-row h-[80vh]">
          {/* Image Section with like button on the right */}
          <div className="md:w-3/5 bg-black relative">
            <img 
              src={item.image} 
              alt={item.name}
              className="w-full h-full object-cover"
            />
            {/* Like button positioned on the right side of the image */}
            {onLikeClick && (
              <button
                onClick={handleLikeClick}
                className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
                aria-label={item.liked ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart 
                  className={`w-6 h-6 ${item.liked ? "text-red-500 fill-red-500" : "text-gray-600"}`}
                />
              </button>
            )}
          </div>

          {/* Content Section */}
          <div className="md:w-2/5 p-6 bg-white overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              {item.name}
            </h2>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 text-sm">
                  This is a high-quality {item.name.toLowerCase()} in excellent condition. 
                  Perfect for anyone looking for this type of item.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="text-xs">
                  <span className="font-medium text-gray-900">Condition:</span>
                  <div className="text-gray-600">Like New</div>
                </div>
                <div className="text-xs">
                  <span className="font-medium text-gray-900">Category:</span>
                  <div className="text-gray-600">{item.category || 'General'}</div>
                </div>
              </div>

              {/* Owner Info - only show if showProfileInfo is true */}
              {showProfileInfo && (
                <div className="border-t pt-4 mt-6">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">EW</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Emma Wilson</h3>
                      <div className="flex text-yellow-400 text-xs">
                        ★★★★★ <span className="text-gray-500 ml-1">(42 reviews)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Member since 2023</span>
                    <span>2.3 mi away</span>
                    <span>~1hr response</span>
                  </div>
                </div>
              )}
              
              {/* Trade Now Button */}
              <div className="mt-7 flex justify-center">
                <button
                  onClick={handleTradeNow}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-full shadow-md transition-colors w-full max-w-xs active:scale-[0.97]"
                >
                  Trade Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemDetailsModal;
