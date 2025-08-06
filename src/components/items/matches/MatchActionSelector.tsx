import React from 'react';
import { MoreVertical, Users, Flag } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface MoreActionsMenuProps {
  itemId: string;
  onLikeAll: (id: string) => void;
  onRejectAll: (id: string) => void;
  onReport: (id: string) => void;
  compact?: boolean;
  className?: string;
}

const MoreActionsMenu: React.FC<MoreActionsMenuProps> = ({
  itemId,
  onLikeAll,
  onRejectAll,
  onReport,
  compact = false,
  className = ""
}) => {
  const buttonSize = compact ? 'w-6 h-6' : 'w-8 h-8';
  const iconSize = compact ? 'h-3 w-3' : 'h-4 w-4';

  const handleLikeAllClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLikeAll(itemId);
  };

  const handleRejectAllClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRejectAll(itemId);
  };

  const handleReportClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReport(itemId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`flex items-center justify-center ${buttonSize} rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg transition-all duration-200 hover:scale-110 group ${className}`}
          aria-label="More options"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className={`${iconSize} text-gray-400 group-hover:text-gray-600 transition-colors`} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-lg z-50">
        <DropdownMenuItem onClick={handleLikeAllClick} className="cursor-pointer">
          <Users className="h-4 w-4 mr-2 text-green-600" />
          Accept for all of my items
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleRejectAllClick} className="cursor-pointer">
          <Users className="h-4 w-4 mr-2 text-red-600" />
          Reject for all of my items
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleReportClick} className="cursor-pointer text-red-600">
          <Flag className="h-4 w-4 mr-2" />
          Report item
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MoreActionsMenu;