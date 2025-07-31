import React, { useState } from 'react';
import { Heart, X, ChevronDown, User, Users } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface MatchActionSelectorProps {
  itemId: string;
  liked?: boolean;
  onLike: (id: string, global?: boolean) => void;
  onReject: (id: string, global?: boolean) => void;
  compact?: boolean;
  className?: string;
}

const MatchActionSelector: React.FC<MatchActionSelectorProps> = ({
  itemId,
  liked,
  onLike,
  onReject,
  compact = false,
  className = ""
}) => {
  const [showActions, setShowActions] = useState(false);
  const buttonSize = compact ? 'w-6 h-6' : 'w-8 h-8';
  const iconSize = compact ? 'h-3 w-3' : 'h-4 w-4';

  const handleLikeClick = (e: React.MouseEvent, global: boolean = false) => {
    e.stopPropagation();
    onLike(itemId, global);
    setShowActions(false);
  };

  const handleRejectClick = (e: React.MouseEvent, global: boolean = false) => {
    e.stopPropagation();
    onReject(itemId, global);
    setShowActions(false);
  };

  return (
    <div className={`flex gap-1 ${className}`}>
      {/* Reject Action */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`flex items-center justify-center ${buttonSize} rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg transition-all duration-200 hover:scale-110 group`}
            aria-label="Reject options"
          >
            <X className={`${iconSize} text-gray-400 group-hover:text-red-500 transition-colors`} />
            <ChevronDown className="h-2 w-2 text-gray-400 ml-0.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={(e) => handleRejectClick(e, false)} className="cursor-pointer">
            <User className="h-4 w-4 mr-2" />
            Reject for selected item only
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => handleRejectClick(e, true)} className="cursor-pointer">
            <Users className="h-4 w-4 mr-2" />
            Reject for all my items
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Like Action */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`flex items-center justify-center ${buttonSize} rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg transition-all duration-200 hover:scale-110 group`}
            aria-label="Like options"
          >
            <Heart 
              className={`${iconSize} transition-colors ${liked ? "text-red-500" : "text-gray-400 group-hover:text-red-500"}`}
              fill={liked ? "red" : "none"}
            />
            <ChevronDown className="h-2 w-2 text-gray-400 ml-0.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={(e) => handleLikeClick(e, false)} className="cursor-pointer">
            <User className="h-4 w-4 mr-2" />
            Like for selected item only
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => handleLikeClick(e, true)} className="cursor-pointer">
            <Users className="h-4 w-4 mr-2" />
            Like for all my items
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MatchActionSelector;