import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Star, Check, X, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ChangeTradeItemsModal from '@/components/trade/ChangeTradeItemsModal';

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
    id?: string;
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
  conversationId?: string;
  conversationTime?: string;
  onAccept?: () => void;
  onChange?: () => void;
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
  conversationId,
  conversationTime,
  onAccept,
  onChange,
  onReject,
  onCancel,
  isAccepted,
  isRejected,
  isPending = true,
  isRequester = false
}) => {
  const [reviewData, setReviewData] = useState({ rating: 0, reviewCount: 0 });
  const [showChangeItemsModal, setShowChangeItemsModal] = useState(false);

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

  const getItemImages = (item: any) => {
    if (!item) return [];
    if (item.image_urls && item.image_urls.length > 0) return item.image_urls;
    if (item.image_url) return [item.image_url];
    if (item.image) return [item.image];
    return [];
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden max-w-xs mx-auto">
      {/* Compact Partner Profile Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Link to={`/other-person-profile?userId=${partnerProfile?.id}`}>
            <Avatar className="h-10 w-10 cursor-pointer">
              <AvatarImage src={partnerProfile?.avatar_url} alt={partnerProfile?.username} />
              <AvatarFallback>
                {partnerProfile?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <Link 
              to={`/other-person-profile?userId=${partnerProfile?.id}`}
              className="font-medium text-sm text-foreground hover:underline block truncate"
            >
              {partnerProfile?.username || 'Unknown User'}
            </Link>
            <div className="flex items-center gap-1">
              {renderStars(reviewData.rating)}
              <span className="text-xs text-muted-foreground">({reviewData.reviewCount})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Items Preview */}
      <div className="p-3">
        <div className="flex items-center gap-2">
          {/* Their Item Thumbnail */}
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">Their Item</p>
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              {getItemImages(theirItem).length > 0 ? (
                <img
                  src={getItemImages(theirItem)[0]}
                  alt={theirItem?.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                  No image
                </div>
              )}
            </div>
            <p className="text-xs font-medium mt-1 truncate">{theirItem?.name}</p>
          </div>

          {/* Arrow */}
          <div className="text-muted-foreground">
            ⇄
          </div>

          {/* Your Item Thumbnail */}
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">Your Item</p>
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              {getItemImages(yourItem).length > 0 ? (
                <img
                  src={getItemImages(yourItem)[0]}
                  alt={yourItem?.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                  No image
                </div>
              )}
            </div>
            <p className="text-xs font-medium mt-1 truncate">{yourItem?.name}</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-2">
          View details in the panel →
        </p>
      </div>

      {/* Action Buttons */}
      {isPending && !isAccepted && !isRejected && (
        <div className="p-3 pt-0">
          {isRequester ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={onCancel}
            >
              <X className="w-3 h-3 mr-1" />
              Cancel Request
            </Button>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={onReject}
              >
                <X className="w-3 h-3 mr-1" />
                Reject
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChangeItemsModal(true)}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Change
              </Button>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={onAccept}
              >
                <Check className="w-3 h-3 mr-1" />
                Accept
              </Button>
            </div>
          )}
        </div>
      )}

      {isAccepted && (
        <div className="p-3 pt-0">
          <div className="flex items-center justify-center py-2 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
            <Check className="w-4 h-4 mr-1 text-green-600" />
            <span className="text-green-700 dark:text-green-400 text-sm font-medium">Trade Accepted</span>
          </div>
        </div>
      )}

      {isRejected && (
        <div className="p-3 pt-0">
          <div className="flex items-center justify-center py-2 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
            <X className="w-4 h-4 mr-1 text-red-600" />
            <span className="text-red-700 dark:text-red-400 text-sm font-medium">Trade Rejected</span>
          </div>
        </div>
      )}

      {/* Change Items Modal */}
      {conversationId && (
        <ChangeTradeItemsModal
          isOpen={showChangeItemsModal}
          onClose={() => setShowChangeItemsModal(false)}
          conversationId={conversationId}
          targetItemName={theirItem?.name || 'their item'}
          currentItemIds={yourItem?.id ? [yourItem.id] : []}
        />
      )}
    </div>
  );
};

export default TradeRequestMessage;
