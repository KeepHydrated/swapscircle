
import React from 'react';
import { Heart, X } from 'lucide-react';
import { MatchItem } from '@/types/item';

interface ActionButtonsProps {
  item: MatchItem;
  onLikeClick?: (item: MatchItem) => void;
  onClose: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ item, onLikeClick, onClose }) => {
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLikeClick) {
      onLikeClick(item);
    }
  };

  return (
    <div className="absolute right-4 top-4 flex items-center space-x-2 z-10">
      <button 
        onClick={handleLikeClick}
        className="rounded-full bg-white p-1.5 shadow-md hover:bg-gray-100 transition-colors"
        aria-label="Like item"
      >
        <Heart 
          className={`h-5 w-5 ${item.liked ? "text-red-500 fill-red-500" : "text-gray-600"}`}
        />
      </button>
      <button 
        onClick={onClose}
        className="rounded-full bg-white p-1.5 shadow-md hover:bg-gray-100 transition-colors"
        aria-label="Close dialog"
      >
        <X className="h-5 w-5 text-gray-600" />
      </button>
    </div>
  );
};

export default ActionButtons;
