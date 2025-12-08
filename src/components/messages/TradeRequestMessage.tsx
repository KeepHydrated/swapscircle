import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Star, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface TradeRequestMessageProps {
  partnerProfile?: {
    id: string;
    username: string;
    avatar_url?: string;
    created_at?: string;
    location?: string;
  };
  theirItem?: {
    name: string;
    image?: string;
    image_url?: string;
    image_urls?: string[];
    description?: string;
    category?: string;
    condition?: string;
    price_range_min?: number;
    price_range_max?: number;
    tags?: string[];
  };
  yourItem?: {
    name: string;
    image?: string;
    image_url?: string;
    image_urls?: string[];
    description?: string;
    category?: string;
    condition?: string;
    price_range_min?: number;
    price_range_max?: number;
    tags?: string[];
  };
  conversationTime?: string;
  onAccept?: () => void;
  onReject?: () => void;
  onCancel?: () => void;
  isAccepted?: boolean;
  isRejected?: boolean;
  isPending?: boolean;
  isRequester?: boolean; // true if current user initiated the trade
}

const TradeRequestMessage: React.FC<TradeRequestMessageProps> = ({
  partnerProfile,
  theirItem,
  yourItem,
  conversationTime,
  onAccept,
  onReject,
  onCancel,
  isAccepted,
  isRejected,
  isPending = true,
  isRequester = false
}) => {
  const [selectedTab, setSelectedTab] = useState<'their' | 'your'>('their');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviewData, setReviewData] = useState({ rating: 0, reviewCount: 0 });

  // Fetch reviews for the partner
  useEffect(() => {
    const fetchReviews = async () => {
      if (!partnerProfile?.id) return;
      
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('reviewee_id', partnerProfile.id);
      
      if (reviews && reviews.length > 0) {
        const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        setReviewData({ rating: Math.round(avg * 10) / 10, reviewCount: reviews.length });
      }
    };
    fetchReviews();
  }, [partnerProfile?.id]);

  const selectedItem = selectedTab === 'their' ? theirItem : yourItem;
  
  const getItemImages = (item: any) => {
    if (!item) return [];
    if (item.image_urls && item.image_urls.length > 0) return item.image_urls;
    if (item.image_url) return [item.image_url];
    if (item.image) return [item.image];
    return [];
  };

  const itemImages = getItemImages(selectedItem);
  const memberSince = partnerProfile?.created_at 
    ? new Date(partnerProfile.created_at).getFullYear() 
    : 2023;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? itemImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === itemImages.length - 1 ? 0 : prev + 1));
  };

  // Reset image index when switching tabs
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedTab]);

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden max-w-sm mx-auto">
      {/* Partner Profile Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link to={`/other-person-profile?userId=${partnerProfile?.id}`}>
            <Avatar className="h-12 w-12 cursor-pointer">
              <AvatarImage src={partnerProfile?.avatar_url} alt={partnerProfile?.username} />
              <AvatarFallback>
                {partnerProfile?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1">
            <Link 
              to={`/other-person-profile?userId=${partnerProfile?.id}`}
              className="font-semibold text-foreground hover:underline"
            >
              {partnerProfile?.username || 'Unknown User'}
            </Link>
            <div className="flex items-center gap-1 mt-0.5">
              {renderStars(reviewData.rating)}
              <span className="text-xs text-muted-foreground ml-1">({reviewData.reviewCount})</span>
            </div>
          </div>
          <div className="flex flex-col items-end text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Since {memberSince}</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3" />
              <span>{conversationTime || '~1 hour'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Item Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setSelectedTab('their')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            selectedTab === 'their'
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Their Item
        </button>
        <button
          onClick={() => setSelectedTab('your')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            selectedTab === 'your'
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Your Item
        </button>
      </div>

      {/* Item Image */}
      <div className="relative aspect-square bg-muted">
        {itemImages.length > 0 ? (
          <img
            src={itemImages[currentImageIndex]}
            alt={selectedItem?.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No image available
          </div>
        )}
        
        {itemImages.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 hover:bg-background shadow-md flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 hover:bg-background shadow-md flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs rounded-full px-2 py-1">
              {currentImageIndex + 1}/{itemImages.length}
            </div>
          </>
        )}
      </div>

      {/* Item Details */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-foreground mb-2">
          {selectedItem?.name || 'Item Name'}
        </h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {selectedItem?.description || 'No description available'}
        </p>

        {/* Item Properties */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          {selectedItem?.category && (
            <div className="text-muted-foreground">
              <span className="text-foreground">{selectedItem.category}</span>
            </div>
          )}
          {selectedItem?.tags && selectedItem.tags.length > 0 && (
            <div className="text-muted-foreground">
              <span className="text-foreground">{selectedItem.tags[0]}</span>
            </div>
          )}
          {selectedItem?.condition && (
            <div className="text-muted-foreground">
              <span className="text-foreground">{selectedItem.condition}</span>
            </div>
          )}
          {(selectedItem?.price_range_min || selectedItem?.price_range_max) && (
            <div className="text-muted-foreground">
              <span className="text-foreground">
                {selectedItem.price_range_min || 0} - {selectedItem.price_range_max || '∞'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {isPending && !isAccepted && !isRejected && (
        <div className="p-4 pt-0">
          {isRequester ? (
            // Requester sees Cancel Request button
            <Button
              variant="outline"
              className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={onCancel}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel Request
            </Button>
          ) : (
            // Receiver sees Reject/Accept buttons
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={onReject}
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={onAccept}
              >
                <Check className="w-4 h-4 mr-2" />
                Accept
              </Button>
            </div>
          )}
        </div>
      )}

      {isAccepted && (
        <div className="p-4 pt-0">
          <div className="flex items-center justify-center py-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
            <Check className="w-5 h-5 mr-2 text-green-600" />
            <span className="text-green-700 dark:text-green-400 font-medium">Trade Accepted</span>
          </div>
        </div>
      )}

      {isRejected && (
        <div className="p-4 pt-0">
          <div className="flex items-center justify-center py-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
            <X className="w-5 h-5 mr-2 text-red-600" />
            <span className="text-red-700 dark:text-red-400 font-medium">Trade Rejected</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeRequestMessage;
