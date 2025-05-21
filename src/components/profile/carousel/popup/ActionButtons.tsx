
import React from 'react';
import { X, Heart, Edit, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  return (
    <div className="absolute top-0 right-0 left-0 z-50 flex justify-between p-3">
      <div className="flex gap-2">
        {onLikeClick && (
          <Button
            onClick={handleLikeClick}
            className={`rounded-full p-2 h-auto w-auto ${
              item.liked
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-white hover:bg-gray-100 text-gray-700'
            }`}
            title={item.liked ? 'Unlike' : 'Like'}
          >
            <Heart
              className={`h-5 w-5 ${item.liked ? 'fill-white' : ''}`}
            />
          </Button>
        )}

        {/* Edit buttons - only show if canEdit is true */}
        {canEdit && (
          <>
            {onEditClick && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditClick();
                }}
                className="rounded-full p-2 h-auto w-auto bg-white hover:bg-gray-100 text-gray-700"
                title="Edit"
              >
                <Edit className="h-5 w-5" />
              </Button>
            )}
            
            {onDuplicateClick && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicateClick();
                }}
                className="rounded-full p-2 h-auto w-auto bg-white hover:bg-gray-100 text-gray-700"
                title="Duplicate"
              >
                <Copy className="h-5 w-5" />
              </Button>
            )}
            
            {onDeleteClick && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteClick();
                }}
                className="rounded-full p-2 h-auto w-auto bg-white hover:bg-gray-100 text-red-600"
                title="Delete"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            )}
          </>
        )}
      </div>

      {/* Close button - always visible */}
      <Button
        onClick={onClose}
        className="rounded-full p-2 h-auto w-auto bg-white hover:bg-gray-100 text-gray-700"
        title="Close"
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default ActionButtons;
