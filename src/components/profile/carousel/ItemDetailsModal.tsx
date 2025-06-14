
import React from 'react';
import { ChevronLeft, ChevronRight, X, Heart } from 'lucide-react';
import { MatchItem } from '@/types/item';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface ItemDetailsModalProps {
  item: MatchItem | null;
  isOpen: boolean;
  onClose: () => void;
  onLikeClick?: (item: MatchItem) => void;
}

const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({
  item,
  isOpen,
  onClose,
  onLikeClick
}) => {
  if (!item) return null;

  const handleLikeClick = () => {
    if (onLikeClick && item) {
      onLikeClick(item);
    }
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
        
        {/* Close and Like buttons */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={handleLikeClick}
            className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label={item.liked ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart 
              className={`w-5 h-5 ${item.liked ? "text-red-500 fill-red-500" : "text-gray-600"}`}
            />
          </button>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row h-[80vh]">
          {/* Image Section */}
          <div className="md:w-3/5 bg-black relative">
            <img 
              src={item.image} 
              alt={item.name}
              className="w-full h-full object-cover"
            />
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

              {/* Owner Info */}
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
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemDetailsModal;
