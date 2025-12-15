
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Check, X, Repeat, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import TradeItemSelectionModal from '@/components/trade/TradeItemSelectionModal';
import { Item } from '@/types/item';

interface ItemCardProps {
  id: string;
  name: string;
  image: string;
  image_urls?: string[];
  isSelected?: boolean;
  isMatch?: boolean;
  liked?: boolean;
  onSelect: (id: string) => void;
  onLike?: (id: string, global?: boolean) => void;
  onReject?: (id: string, global?: boolean) => void;
  onReport?: (id: string) => void;
  showLikeButton?: boolean;
  compact?: boolean;
  disableClick?: boolean;
  disableLike?: boolean;
  category?: string;
  tags?: string[];
  status?: 'draft' | 'published' | 'removed';
  ownerId?: string;
  distance?: string;
  myItemImage?: string;
  priceRangeMin?: number;
  priceRangeMax?: number;
  condition?: string;
  userProfile?: {
    name: string;
    username?: string;
    avatar_url?: string;
  };
}

const ItemCard: React.FC<ItemCardProps> = ({ 
  id, 
  name, 
  image, 
  image_urls,
  isSelected, 
  isMatch,
  liked,
  onSelect,
  onLike,
  onReject,
  onReport,
  showLikeButton,
  compact = false,
  disableLike = false,
  disableClick = false,
  category,
  tags,
  status,
  distance,
  myItemImage,
  priceRangeMin,
  priceRangeMax,
  condition,
  userProfile,
  ownerId,
}) => {
  // Debug logging for liked state
  console.log('🎴 ItemCard render:', { id, name: name.substring(0, 15), liked, isMatch });
  
  const navigate = useNavigate();
  const isRemoved = status === 'removed';
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Build array of all images
  const allImages = image_urls && image_urls.length > 0 ? image_urls : (image ? [image] : []);
  const hasMultipleImages = allImages.length > 1;
  const currentImage = allImages[currentImageIndex] || image;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const handleSwapClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTradeModalOpen(true);
  };

  const targetItem: Item = {
    id,
    name,
    image,
    priceRangeMin,
    priceRangeMax,
    condition,
  };
  const handleHeartClick = (e: React.MouseEvent, global?: boolean) => {
    console.log('💖 ItemCard: Heart button clicked!', { id, onLike: !!onLike, global });
    e.stopPropagation();
    if (onLike) {
      console.log('💖 ItemCard: Calling onLike with id:', id, 'global:', global);
      onLike(id, global);
    } else {
      console.log('💖 ItemCard: No onLike handler provided!');
    }
  };

  const handleRejectClick = (e: React.MouseEvent, global?: boolean) => {
    e.stopPropagation();
    if (onReject) {
      onReject(id, global);
    }
  };

  // Wrapper functions for MoreActionsMenu
  const handleLikeAll = (itemId: string) => {
    if (onLike) {
      onLike(itemId, true);
    }
  };

  const handleRejectAll = (itemId: string) => {
    if (onReject) {
      onReject(itemId, true);
    }
  };

  const handleReport = (itemId: string) => {
    if (onReport) {
      onReport(itemId);
    }
  };

  const handleCardClick = () => {
    if (disableClick) {
      return;
    }
    // For matches, use the modal (onSelect). For non-matches, navigate to details page
    if (isMatch) {
      onSelect(id);
    } else {
      navigate(`/item/${id}`);
    }
  };

  const handleMouseDown = () => {
    // Mouse down handler
  };

  const handleMouseUp = () => {
    // Mouse up handler
  };

  return (
    <div className="flex flex-col w-full">
      <Card 
        className={`overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-300 ${
          isSelected && !isMatch ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
        }`}
        onClick={handleCardClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        style={{ pointerEvents: 'auto', zIndex: 1 }}
      >
        <div className="relative">
          <div className={`${compact ? 'aspect-square' : 'aspect-[4/3]'} bg-gray-100 relative overflow-hidden`}>
            {!imageLoaded && !imageError && (
              <Skeleton className="w-full h-full rounded-none" />
            )}
            <Avatar 
              className={`h-full w-full rounded-none transition-opacity duration-300 ${
                imageLoaded || imageError ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <AvatarImage 
                src={currentImage} 
                alt={name} 
                className={`object-cover transition-transform duration-300 group-hover:scale-105 ${isRemoved ? 'grayscale' : ''}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                  setImageLoaded(true);
                }}
              />
              <AvatarFallback className="rounded-none text-xs font-medium">
                {name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {/* Red overlay for removed items */}
            {isRemoved && (
              <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                <div className="bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded shadow-lg">
                  REMOVED
                </div>
              </div>
            )}
            
            {/* Image Navigation Arrows */}
            {hasMultipleImages && !isRemoved && (
              <>
                <button
                  onClick={handlePrevImage}
                  className={`absolute left-1 top-1/2 -translate-y-1/2 ${compact ? 'w-5 h-5' : 'w-6 h-6'} rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors z-10`}
                  aria-label="Previous image"
                >
                  <ChevronLeft className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-white`} />
                </button>
                <button
                  onClick={handleNextImage}
                  className={`absolute right-1 top-1/2 -translate-y-1/2 ${compact ? 'w-5 h-5' : 'w-6 h-6'} rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors z-10`}
                  aria-label="Next image"
                >
                  <ChevronRight className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-white`} />
                </button>
                {/* Image counter */}
                <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white ${compact ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'} rounded-full`}>
                  {currentImageIndex + 1}/{allImages.length}
                </div>
              </>
            )}

            {/* Distance badge at bottom of image when available */}
            {distance && !isRemoved && !hasMultipleImages && (
              <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full shadow-lg">
                {distance}
              </div>
            )}
            
            {/* My Item Thumbnail in Bottom Right */}
            {myItemImage && !isRemoved && (
              <div className={`absolute ${compact ? 'bottom-1.5 left-1.5' : 'bottom-2 left-2'}`}>
                <div className={`${compact ? 'w-12 h-12' : 'w-14 h-14'} rounded-full border-2 border-background shadow-lg overflow-hidden bg-background`}>
                  <img src={myItemImage} alt="Your item" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
            
            {(showLikeButton || isMatch) && !disableLike && !isRemoved && (
              <>
                
                {/* Action buttons on the right side */}
                <div className="absolute top-1.5 right-1.5 z-10">
                  {isMatch ? (
                    <div className="flex gap-1">
                      {/* Swap/Trade button - only show on hover */}
                      <div className={`transition-opacity duration-200 ${liked ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                className={`flex items-center justify-center ${compact ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-green-500 hover:bg-green-600 shadow-lg transition-all duration-200 hover:scale-110`}
                                aria-label="Suggest trade"
                                onClick={handleSwapClick}
                              >
                                <Check className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} text-white`} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Suggest a trade</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      
                      {/* Like button - always visible when liked, otherwise show on hover */}
                      <div className={`transition-opacity duration-200 ${liked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                className={`flex items-center justify-center ${compact ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg transition-all duration-200 hover:scale-110`}
                                aria-label="Like item"
                                onClick={(e) => handleHeartClick(e)}
                              >
                                <Heart 
                                  className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} transition-colors ${liked ? "text-red-500" : "text-gray-400"}`}
                                  fill={liked ? "red" : "none"}
                                />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Like to initiate trading (create a match)</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                ) : (
                  /* Arrow button + heart for non-match items (search page) */
                  <div className="flex gap-1">
                    {/* Swap/Trade button with arrow - only show on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className={`flex items-center justify-center ${compact ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-green-500 hover:bg-green-600 shadow-lg transition-all duration-200 hover:scale-110`}
                              aria-label="Suggest trade"
                              onClick={handleSwapClick}
                            >
                              <Repeat className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} text-white`} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Suggest a trade</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    {/* Like button (Heart) - always visible when liked, otherwise show on hover */}
                    <div className={`transition-opacity duration-200 ${liked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className={`flex items-center justify-center ${compact ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg transition-all duration-200 hover:scale-110`}
                              aria-label="Like item"
                              onClick={(e) => handleHeartClick(e)}
                            >
                              <Heart 
                                className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} transition-colors ${liked ? "text-red-500" : "text-gray-400"}`}
                                fill={liked ? "red" : "none"}
                              />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Like item</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                )}
                </div>
              </>
            )}
          </div>
          {isSelected && !isMatch && (
            <div className={`absolute top-1.5 right-1.5 bg-blue-500 text-white rounded-full ${compact ? 'p-1' : 'p-1.5'} shadow-lg`}>
              <Check className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
            </div>
          )}
        </div>
        <CardContent className={`${compact ? 'p-2' : 'p-4'}`}>
          <h3 className={`font-semibold text-foreground ${compact ? 'text-xs' : 'text-base'} leading-tight truncate mb-1`} title={name}>
            {name}
          </h3>
          <div className="flex items-center justify-between">
            <p className={`text-muted-foreground ${compact ? 'text-xs' : 'text-sm'}`}>
              {priceRangeMin && priceRangeMax 
                ? `$${priceRangeMin} - $${priceRangeMax}`
                : priceRangeMin 
                  ? `$${priceRangeMin}+`
                  : 'Price not set'}
            </p>
            {condition && (
              <span className={`bg-muted px-2 py-0.5 rounded-full text-muted-foreground ${compact ? 'text-xs' : 'text-xs'}`}>
                {condition}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Trade Item Selection Modal */}
      <TradeItemSelectionModal
        isOpen={tradeModalOpen}
        onClose={() => setTradeModalOpen(false)}
        targetItem={targetItem}
        targetItemOwnerId={ownerId || ''}
      />
    </div>
  );
};

export default ItemCard;
