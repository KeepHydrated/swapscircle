
import React from 'react';
import { Heart, X, Edit, Copy, Trash2 } from 'lucide-react';
import { MatchItem } from '@/types/item';

interface ActionButtonsProps {
  item: MatchItem;
  onLikeClick?: (item: MatchItem) => void;
  onClose: () => void;
  onEditClick?: () => void;
  onDuplicateClick?: () => void;
  onDeleteClick?: () => void;
  canEdit?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  item, 
  onLikeClick, 
  onClose, 
  onEditClick, 
  onDuplicateClick, 
  onDeleteClick,
  canEdit = false 
}) => {
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLikeClick) {
      onLikeClick(item);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEditClick) {
      onEditClick();
    }
  };

  const handleDuplicateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDuplicateClick) {
      onDuplicateClick();
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteClick) {
      onDeleteClick();
    }
  };

  return (
    <div className="absolute right-4 top-4 flex items-center space-x-2 z-10">
      {canEdit ? (
        // Edit buttons for own items
        <>
          <button 
            onClick={handleEditClick}
            className="rounded-full bg-white p-1.5 shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Edit item"
          >
            <Edit className="h-5 w-5 text-gray-600" />
          </button>
          <button 
            onClick={handleDuplicateClick}
            className="rounded-full bg-white p-1.5 shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Duplicate item"
          >
            <Copy className="h-5 w-5 text-gray-600" />
          </button>
          <button 
            onClick={handleDeleteClick}
            className="rounded-full bg-white p-1.5 shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Delete item"
          >
            <Trash2 className="h-5 w-5 text-gray-600" />
          </button>
        </>
      ) : (
        // Like button for other people's items
        <button 
          onClick={handleLikeClick}
          className="rounded-full bg-white p-1.5 shadow-md hover:bg-gray-100 transition-colors"
          aria-label="Like item"
        >
          <Heart 
            className={`h-5 w-5 ${item.liked ? "text-red-500 fill-red-500" : "text-gray-600"}`}
          />
        </button>
      )}
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
