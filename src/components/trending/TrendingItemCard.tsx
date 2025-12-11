import React, { useState } from 'react';
import { Heart, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TrendingItemCardProps {
  item: {
    id: string;
    name: string;
    description?: string;
    image_url: string;
    category?: string;
    condition?: string;
    price_range_min?: number;
    price_range_max?: number;
  };
  isLiked?: boolean;
  onClick?: () => void;
  onLike?: () => void;
  onTrade?: () => void;
}

export const TrendingItemCard: React.FC<TrendingItemCardProps> = ({ 
  item, 
  isLiked = false,
  onClick, 
  onLike,
  onTrade 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = () => {
    if (item.price_range_min && item.price_range_max) {
      return `$${item.price_range_min} - $${item.price_range_max}`;
    }
    if (item.price_range_min) {
      return `$${item.price_range_min}+`;
    }
    if (item.price_range_max) {
      return `Up to $${item.price_range_max}`;
    }
    return null;
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike?.();
  };

  const handleTradeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTrade?.();
  };
  
  return (
    <div 
      className="relative rounded-xl overflow-hidden shadow-md bg-card cursor-pointer group h-72 sm:h-80 flex flex-col"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative flex-1 overflow-hidden">
        <img 
          src={item.image_url} 
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Action buttons on hover */}
        <div className={`absolute top-3 right-3 flex gap-2 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={handleTradeClick}
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <button
            onClick={handleLikeClick}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors ${
              isLiked 
                ? 'bg-red-500 text-white' 
                : 'bg-background/90 text-foreground hover:bg-background'
            }`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 h-20 flex flex-col justify-center">
        <h3 className="font-semibold text-sm line-clamp-1">{item.name}</h3>
        <div className="flex items-center gap-2 mt-1.5">
          {formatPrice() && (
            <span className="text-xs text-muted-foreground">{formatPrice()}</span>
          )}
          {item.condition && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {item.condition}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
