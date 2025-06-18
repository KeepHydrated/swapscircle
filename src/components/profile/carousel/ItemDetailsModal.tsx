
import React from 'react';
import { Dialog, DialogContent, DialogOverlay, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X, Heart, ArrowLeft, ArrowRight, Tag, Camera, Shield, DollarSign } from "lucide-react";
import { MatchItem } from '@/types/item';

interface ItemDetailsModalProps {
  item: MatchItem | null;
  isOpen: boolean;
  onClose: () => void;
  onLikeClick: (item: MatchItem) => void;
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
  showProfileInfo = true,
}) => {
  if (!item) return null;

  const handleLikeClick = () => {
    onLikeClick(item);
  };

  const canNavigatePrev = onNavigatePrev && typeof currentIndex === 'number' && currentIndex > 0;
  const canNavigateNext = onNavigateNext && typeof currentIndex === 'number' && typeof totalItems === 'number' && currentIndex < totalItems - 1;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogOverlay className="bg-black/80" />
      <DialogContent className="max-w-4xl w-[97vw] p-0 border-0 rounded-xl bg-transparent shadow-none relative flex items-center justify-center min-h-[92vh]">
        {/* Hidden accessibility elements */}
        <DialogTitle className="sr-only">{item.name}</DialogTitle>
        <DialogDescription className="sr-only">
          Item details for {item.name}. {item.description || "Item details and information."}
        </DialogDescription>

        {/* Navigation buttons - positioned in the dark overlay area, outside the white box */}
        {canNavigatePrev && (
          <button
            onClick={onNavigatePrev}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors z-30"
            aria-label="Previous item"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
        )}

        {canNavigateNext && (
          <button
            onClick={onNavigateNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors z-30"
            aria-label="Next item"
          >
            <ArrowRight className="w-6 h-6 text-gray-700" />
          </button>
        )}

        {/* Main content container - the white box */}
        <div className="flex w-full max-w-4xl h-[540px] md:h-[520px] bg-white rounded-2xl overflow-hidden relative animate-fade-in mx-8">
          {/* Like button - positioned to the left of close button */}
          <button
            onClick={handleLikeClick}
            className="absolute top-3 right-12 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-20"
            aria-label={item.liked ? "Unlike" : "Like"}
          >
            <Heart
              className={`w-4 h-4 ${item.liked ? "text-red-500" : "text-gray-600"}`}
              fill={item.liked ? "red" : "none"}
            />
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-20"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>

          {/* Image */}
          <div className="relative w-1/2 h-full flex-shrink-0 bg-black/10">
            <img
              src={item.image}
              alt={item.name}
              className="object-cover w-full h-full"
            />
          </div>
          
          {/* Details */}
          <div className="flex-1 flex flex-col px-8 py-7 justify-start overflow-y-auto">
            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-6">
              {item.name}
            </h2>
            
            {/* Description */}
            <p className="text-gray-700 text-base mb-6 leading-relaxed">
              {item.description ||
                "Beautiful vintage 35mm film camera in excellent working condition. Perfect for photography enthusiasts."}
            </p>
            
            {/* Tags in 2x2 grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 text-gray-600">
                <Tag className="w-4 h-4" />
                <span className="text-sm">{item.category || "Electronics"}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Camera className="w-4 h-4" />
                <span className="text-sm">{item.tags?.[0] || "Cameras"}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Shield className="w-4 h-4" />
                <span className="text-sm">{item.condition || "Excellent"}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">$150 - $200</span>
              </div>
            </div>
            
            {/* User profile info - only show if showProfileInfo is true */}
            {showProfileInfo && (
              <div className="flex gap-3 items-center mt-auto pt-6">
                <img
                  src="https://randomuser.me/api/portraits/women/44.jpg"
                  alt="User"
                  className="w-11 h-11 rounded-full border object-cover"
                />
                <div>
                  <span className="font-semibold text-gray-900">
                    Sarah Chen
                  </span>
                  <span className="ml-2 text-yellow-500 text-xs font-semibold">
                    ★ 4.8{" "}
                    <span className="text-gray-400 font-normal ml-1">
                      (42)
                    </span>
                  </span>
                  <div className="flex text-xs text-gray-500 mt-1 gap-4">
                    <span>Since 2023</span>
                    <span>· 2.3 mi away</span>
                    <span>· ~1 hr response</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemDetailsModal;
