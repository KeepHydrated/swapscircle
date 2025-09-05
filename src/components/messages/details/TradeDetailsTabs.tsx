
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, Tag, Layers, Shield, DollarSign, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { updateTradeAcceptance, rejectTrade, fetchUserTradeConversations, updateTradeStatus } from '@/services/tradeService';
import { checkReviewEligibility } from '@/services/reviewService';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import ReviewModal from '@/components/trade/ReviewModal';
import { supabase } from '@/integrations/supabase/client';

interface TradeDetailsTabsProps {
  selectedPair: {
    id: number;
    item1: { 
      name: string; 
      image: string;
      image_url?: string;
      image_urls?: string[];
      description?: string;
      category?: string;
      condition?: string;
      price_range_min?: number;
      price_range_max?: number;
      tags?: string[];
    };
    item2: { 
      name: string; 
      image: string;
      image_url?: string;
      image_urls?: string[];
      description?: string;
      category?: string;
      condition?: string;
      price_range_min?: number;
      price_range_max?: number;
      tags?: string[];
    };
    partnerId: string;
    partnerProfile?: {
      id: string;
      username: string;
      avatar_url?: string;
      created_at: string;
      location?: string;
    };
  };
  selectedItem: 'item1' | 'item2';
  onSelectItem: (item: 'item1' | 'item2') => void;
}

const TradeDetailsTabs: React.FC<TradeDetailsTabsProps> = ({
  selectedPair,
  selectedItem,
  onSelectItem
}) => {
  const queryClient = useQueryClient();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Get current user
  React.useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUserId(session?.user?.id || null);
    };
    getCurrentUser();
  }, []);

  // Use all available item images
  const getItemImages = (item: any) => {
    if (item.image_urls && item.image_urls.length > 0) {
      return item.image_urls;
    } else if (item.image_url) {
      return [item.image_url];
    } else if (item.image) {
      return [item.image];
    }
    return [];
  };

const itemImages = getItemImages(selectedPair.item1);
const theirItemImages = getItemImages(selectedPair.item2);

// Always start from the first image when switching items or pairs
React.useEffect(() => {
  setCurrentImageIndex(0);
}, [selectedItem, selectedPair]);

  // Fetch trade status to check acceptance status
  const { data: tradeConversations = [] } = useQuery({
    queryKey: ['trade-conversations'],
    queryFn: fetchUserTradeConversations,
  });

  const currentTrade = tradeConversations.find((tc: any) => tc.id === selectedPair.partnerId);
  const isCurrentUserRequester = currentTrade?.requester_id === currentUserId;
  const isCurrentUserOwner = currentTrade?.owner_id === currentUserId;
  const userRole: 'requester' | 'owner' = isCurrentUserRequester ? 'requester' : 'owner';
  
  const userAccepted = isCurrentUserRequester ? currentTrade?.requester_accepted : currentTrade?.owner_accepted;
  const otherUserAccepted = isCurrentUserRequester ? currentTrade?.owner_accepted : currentTrade?.requester_accepted;
  const bothAccepted = userAccepted && otherUserAccepted;
  const isCompleted = currentTrade?.status === 'completed';
  const isRejected = currentTrade?.status === 'rejected';

  // Check review eligibility
  const { data: reviewEligibility } = useQuery({
    queryKey: ['reviewEligibility', selectedPair.partnerId],
    queryFn: () => checkReviewEligibility(selectedPair.partnerId),
    enabled: isCompleted
  });

  const acceptTradeMutation = useMutation({
    mutationFn: () => updateTradeAcceptance(selectedPair.partnerId, userRole, true),
    onSuccess: async (updatedTrade) => {
      queryClient.invalidateQueries({ queryKey: ['trade-conversations'] });
      
      // Check if both parties have now accepted by getting fresh data
      const updatedTradeData = await queryClient.fetchQuery({
        queryKey: ['trade-conversations'],
        queryFn: fetchUserTradeConversations,
      });
      
      const freshTrade = updatedTradeData.find((tc: any) => tc.id === selectedPair.partnerId);
      const bothNowAccepted = freshTrade?.requester_accepted && freshTrade?.owner_accepted;
      
      if (bothNowAccepted && freshTrade?.status !== 'completed') {
        try {
          await updateTradeStatus(selectedPair.partnerId, 'completed');
          queryClient.invalidateQueries({ queryKey: ['trade-conversations'] });
          // Proactively refresh notifications in case realtime misses
          window.dispatchEvent(new Event('notificationsRefresh'));
          toast.success('Trade completed! Both parties have accepted.');
        } catch (error) {
          console.error('Error completing trade:', error);
          toast.error('Trade accepted but failed to mark as completed.');
        }
      } else {
        toast.success('Trade accepted! Waiting for the other party to accept.');
      }
    },
    onError: (error) => {
      console.error('Error accepting trade:', error);
      toast.error('Failed to accept trade. Please try again.');
    },
  });

  const rejectTradeMutation = useMutation({
    mutationFn: () => rejectTrade(selectedPair.partnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trade-conversations'] });
      toast.success('Trade rejected.');
    },
    onError: (error) => {
      console.error('Error rejecting trade:', error);
      toast.error('Failed to reject trade. Please try again.');
    },
  });

  const handleAcceptTrade = () => {
    acceptTradeMutation.mutate();
  };

  const handleRejectTrade = () => {
    rejectTradeMutation.mutate();
  };

  const handleOpenReviewModal = () => {
    setShowReviewModal(true);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? itemImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === itemImages.length - 1 ? 0 : prev + 1));
  };

  const handlePrevTheirImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? theirItemImages.length - 1 : prev - 1));
  };

  const handleNextTheirImage = () => {
    setCurrentImageIndex((prev) => (prev === theirItemImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="p-4 border-b border-gray-200 bg-white flex flex-col h-full">
      
      {/* Item Selector with consistent height and perfect alignment */}
      <div className="mb-4">
        <div className="flex gap-3">
          <button
            onClick={() => onSelectItem('item2')}
            className={`flex-1 h-8 rounded-lg border text-sm font-medium transition-colors flex items-center justify-center ${
              selectedItem === 'item2' 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
          >
            Their Item
          </button>
          <button
            onClick={() => onSelectItem('item1')}
            className={`flex-1 h-8 rounded-lg border text-sm font-medium transition-colors flex items-center justify-center ${
              selectedItem === 'item1' 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
          >
            Your Item
          </button>
        </div>
      </div>
      
      {/* Item Details Content */}
      <div className="flex-1 flex flex-col">
        {selectedItem === 'item1' ? (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Item Image with Navigation */}
            <div className="relative aspect-square bg-gray-100 w-full h-40 md:h-64">
              <img 
                src={itemImages[currentImageIndex]} 
                alt={selectedPair.item1.name} 
                className="w-full h-full object-cover"
              />
              
{itemImages.length > 1 && (
              <>
                {/* Navigation Arrows */}
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
                
                {/* Image Counter */}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs rounded-full px-2 py-1">
                  {currentImageIndex + 1}/{itemImages.length}
                </div>
              </>
            )}
            </div>
            
            {/* Item Details */}
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{selectedPair.item1.name}</h3>
              <p className="text-gray-600 text-sm mb-3">
                {selectedPair.item1.description || 
                `${selectedPair.item1.condition || 'Good'} condition. This ${selectedPair.item1.name.toLowerCase()} has been well-cared for and is ready for a new home. Great quality and functionality.`}
              </p>
              
              {/* Property Tags */}
              <div className="grid grid-cols-2 gap-1.5 text-sm">
                {selectedPair.item1.category && (
                  <div className="flex items-center gap-2">
                    <span>{selectedPair.item1.category}</span>
                  </div>
                )}
                {selectedPair.item1.tags && selectedPair.item1.tags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span>{selectedPair.item1.tags[0]}</span>
                  </div>
                )}
                {selectedPair.item1.condition && (
                  <div className="flex items-center gap-2">
                    <span>{selectedPair.item1.condition}</span>
                  </div>
                )}
                {(selectedPair.item1.price_range_min || selectedPair.item1.price_range_max) && (
                  <div className="flex items-center gap-2">
                    <span>{selectedPair.item1.price_range_min || 0} - {selectedPair.item1.price_range_max || '∞'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Their Item Image with Navigation */}
            <div className="relative aspect-square bg-gray-100 w-full h-40 md:h-64">
              <img 
                src={theirItemImages[currentImageIndex]} 
                alt={selectedPair.item2.name} 
                className="w-full h-full object-cover"
              />
              
{theirItemImages.length > 1 && (
              <>
                {/* Navigation Arrows */}
                <button
                  onClick={handlePrevTheirImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                
                <button
                  onClick={handleNextTheirImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
                
                {/* Image Counter */}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs rounded-full px-2 py-1">
                  {currentImageIndex + 1}/{theirItemImages.length}
                </div>
              </>
            )}
            </div>
            
            {/* Their Item Details */}
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{selectedPair.item2.name}</h3>
              <p className="text-gray-600 text-sm mb-3">
                {selectedPair.item2.description || 
                `${selectedPair.item2.condition || 'Good'} condition. This ${selectedPair.item2.name.toLowerCase()} has been well-cared for and is ready for a new home. Great quality and functionality.`}
              </p>
              
              {/* Property Tags */}
              <div className="grid grid-cols-2 gap-1.5 text-sm">
                {selectedPair.item2.category && (
                  <div className="flex items-center gap-2">
                    <span>{selectedPair.item2.category}</span>
                  </div>
                )}
                {selectedPair.item2.tags && selectedPair.item2.tags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span>{selectedPair.item2.tags[0]}</span>
                  </div>
                )}
                {selectedPair.item2.condition && (
                  <div className="flex items-center gap-2">
                    <span>{selectedPair.item2.condition}</span>
                  </div>
                )}
                {(selectedPair.item2.price_range_min || selectedPair.item2.price_range_max) && (
                  <div className="flex items-center gap-2">
                    <span>{selectedPair.item2.price_range_min || 0} - {selectedPair.item2.price_range_max || '∞'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Action buttons at the bottom or status display */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          {isRejected ? (
            <div className="flex items-center justify-center py-3 bg-red-50 rounded-lg border border-red-200">
              <X className="w-5 h-5 mr-2 text-red-600" />
              <span className="text-red-700 font-medium">Trade Rejected</span>
            </div>
          ) : isCompleted ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center py-3 bg-green-50 rounded-lg border border-green-200">
                <Check className="w-5 h-5 mr-2 text-green-600" />
                <span className="text-green-700 font-medium">Trade Completed</span>
              </div>
              {reviewEligibility?.canReview && (
                <Button 
                  onClick={handleOpenReviewModal}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Leave Review ({reviewEligibility.daysLeft} days left)
                </Button>
              )}
            </div>
          ) : bothAccepted ? (
            <div className="flex items-center justify-center py-3 bg-blue-50 rounded-lg border border-blue-200">
              <Check className="w-5 h-5 mr-2 text-blue-600" />
              <span className="text-blue-700 font-medium">Both parties accepted - Trade finalizing...</span>
            </div>
          ) : userAccepted ? (
            <div className="flex items-center justify-center py-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <Check className="w-5 h-5 mr-2 text-yellow-600" />
              <span className="text-yellow-700 font-medium">You accepted - Waiting for other party</span>
            </div>
          ) : otherUserAccepted ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center py-3 bg-orange-50 rounded-lg border border-orange-200">
                <span className="text-orange-700 font-medium">The other party accepted - Your response needed</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  onClick={handleRejectTrade}
                  disabled={rejectTradeMutation.isPending}
                >
                  <X className="w-4 h-4 mr-2" />
                  {rejectTradeMutation.isPending ? 'Rejecting...' : 'Reject'}
                </Button>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleAcceptTrade}
                  disabled={acceptTradeMutation.isPending}
                >
                  <Check className="w-4 h-4 mr-2" />
                  {acceptTradeMutation.isPending ? 'Accepting...' : 'Accept'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleRejectTrade}
                disabled={rejectTradeMutation.isPending}
              >
                <X className="w-4 h-4 mr-2" />
                {rejectTradeMutation.isPending ? 'Rejecting...' : 'Reject'}
              </Button>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleAcceptTrade}
                disabled={acceptTradeMutation.isPending}
              >
                <Check className="w-4 h-4 mr-2" />
                {acceptTradeMutation.isPending ? 'Accepting...' : 'Accept'}
              </Button>
            </div>
          )}
        </div>
        
        {/* Review Modal */}
        {showReviewModal && selectedPair.partnerProfile && (
          <ReviewModal
            isOpen={showReviewModal}
            onClose={() => setShowReviewModal(false)}
            tradeConversationId={selectedPair.partnerId}
            revieweeId={selectedPair.partnerProfile.id}
            revieweeName={selectedPair.partnerProfile.username}
          />
        )}
      </div>
    </div>
  );
};

export default TradeDetailsTabs;
