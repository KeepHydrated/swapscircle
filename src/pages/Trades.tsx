import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserTradeConversations } from '@/services/tradeService';
import { getReviewsForTrade, checkReviewEligibility } from '@/services/reviewService';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Star, ArrowLeftRight } from 'lucide-react';
import { format } from 'date-fns';
import ExploreItemModal from '@/components/items/ExploreItemModal';
import ReviewModal from '@/components/trade/ReviewModal';

const Trades = () => {
  const navigate = useNavigate();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedTradeForReview, setSelectedTradeForReview] = useState<any>(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Get current user with profile data
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      // Fetch user's profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      return { ...user, profile };
    },
  });

  // Fetch trade conversations
  const { data: trades = [], isLoading } = useQuery({
    queryKey: ['trade-conversations'],
    queryFn: fetchUserTradeConversations,
  });

  // Get completed trades only
  const completedTrades = trades.filter((trade: any) => trade.status === 'completed');

  // Fetch reviews for completed trades
  const { data: allReviews = [] } = useQuery({
    queryKey: ['trade-reviews', completedTrades.map(t => t.id)],
    queryFn: async () => {
      if (completedTrades.length === 0) return [];
      
      const reviewPromises = completedTrades.map(trade => getReviewsForTrade(trade.id));
      const reviewsArrays = await Promise.all(reviewPromises);
      
      // Flatten the arrays and add trade_conversation_id to each review
      return reviewsArrays.flat();
    },
    enabled: completedTrades.length > 0,
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const handleOpenChat = (tradeId: string) => {
    navigate(`/messages?conversation=${tradeId}`);
  };

  const handleProfileClick = (userId: string) => {
    navigate(`/other-person-profile?userId=${userId}`);
  };

  const handleMyProfileClick = () => {
    navigate('/profile');
  };

  const handleLeaveReview = async (trade: any) => {
    const eligibility = await checkReviewEligibility(trade.id);
    if (eligibility.canReview) {
      setSelectedTradeForReview(trade);
      setShowReviewModal(true);
    }
  };

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setShowItemModal(true);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading your trades...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (completedTrades.length === 0) {
    return (
      <MainLayout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">My Trades</h1>
            <p className="text-gray-600">Manage your trading activities and conversations</p>
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No completed trades</h3>
              <p className="text-gray-500">You haven't completed any trades yet.</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Trades</h1>
          <p className="text-gray-600">Manage your trading activities and conversations</p>
        </div>

        <div className="space-y-6">
          {completedTrades.map((trade: any) => {
            // Determine the other user based on current user ID
            const otherUser = trade.requester_id === currentUser?.id 
              ? trade.owner_profile 
              : trade.requester_profile;

            // Determine which items to show
            const isCurrentUserRequester = trade.requester_id === currentUser?.id;
            const theirItem = isCurrentUserRequester ? trade.owner_item : trade.requester_item;
            const yourItem = isCurrentUserRequester ? trade.requester_item : trade.owner_item;

            // Get reviews for this trade - find reviews where each person was reviewed
            const tradeReviews = allReviews.filter(review => review.trade_conversation_id === trade.id);
            const theirReview = tradeReviews.find(review => review.reviewee_id === otherUser?.id); // Review left ABOUT the other person
            const yourReview = tradeReviews.find(review => review.reviewee_id === currentUser?.id); // Review left ABOUT you

            return (
              <div key={trade.id} className="flex gap-4">
                {/* Left side - Trade Details */}
                <div className="w-1/3">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-sm text-gray-500">
                          {format(new Date(trade.created_at), 'MMM d, yyyy')}
                        </div>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Completed
                        </Badge>
                      </div>

                      {/* Trade Items */}
                      <div className="flex items-center justify-center space-x-6 mb-6">
                        {/* Their Item */}
                         <div className="flex flex-col items-center">
                           <img 
                             src={theirItem?.image_url || '/placeholder.svg'} 
                             alt={theirItem?.name || 'Item'}
                             className="w-24 h-24 object-cover rounded-lg mb-2 cursor-pointer hover:opacity-80 transition-opacity"
                             onClick={() => handleItemClick(theirItem)}
                           />
                           <span className="text-sm font-medium text-gray-700 text-center max-w-24 truncate">
                             {theirItem?.name || 'Unknown Item'}
                           </span>
                         </div>
                        
                        {/* Exchange Arrow */}
                        <div className="flex items-center justify-center">
                          <ArrowLeftRight className="w-6 h-6 text-gray-400" />
                        </div>
                        
                         {/* Your Item */}
                         <div className="flex flex-col items-center">
                           <img 
                             src={yourItem?.image_url || '/placeholder.svg'} 
                             alt={yourItem?.name || 'Item'}
                             className="w-24 h-24 object-cover rounded-lg mb-2 cursor-pointer hover:opacity-80 transition-opacity"
                             onClick={() => handleItemClick(yourItem)}
                           />
                           <span className="text-sm font-medium text-gray-700 text-center max-w-24 truncate">
                             {yourItem?.name || 'Unknown Item'}
                           </span>
                         </div>
                      </div>

                      {/* Open Chat Button */}
                      <Button 
                        variant="outline" 
                        className="w-full h-10"
                        onClick={() => handleOpenChat(trade.id)}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Open Chat
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Middle - Their Review of You */}
                <div className="w-1/3">
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-3">
                        <Avatar 
                          className="h-8 w-8 cursor-pointer hover:opacity-80"
                          onClick={() => otherUser?.id && handleProfileClick(otherUser.id)}
                        >
                          <AvatarImage src={otherUser?.avatar_url} />
                          <AvatarFallback className="bg-gray-200 text-gray-600 text-sm">
                            {otherUser?.username?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <span 
                            className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                            onClick={() => otherUser?.id && handleProfileClick(otherUser.id)}
                          >
                            {otherUser?.username || 'Unknown User'}
                          </span>
                        </div>
                      </div>
                      {yourReview ? (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Their review of you:</p>
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex">
                              {renderStars(yourReview.rating)}
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {yourReview.comment || 'No comment provided'}
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm italic">No review yet</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Right - Your Review Section */}
                <div className="w-1/3">
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-3">
                        <Avatar 
                          className="h-8 w-8 cursor-pointer hover:opacity-80"
                          onClick={handleMyProfileClick}
                        >
                          <AvatarImage src={currentUser?.profile?.avatar_url} />
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                            {currentUser?.profile?.username?.charAt(0).toUpperCase() || 'Y'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <span 
                            className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                            onClick={handleMyProfileClick}
                          >
                            {currentUser?.profile?.username || 'You'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Show review button or status based on if you've left a review for them */}
                      {theirReview ? (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Your review:</p>
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex">
                              {renderStars(theirReview.rating)}
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {theirReview.comment || 'No comment provided'}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-gray-400 text-sm italic">Leave a review for {otherUser?.username}</p>
                          <Button 
                            variant="outline" 
                            onClick={() => handleLeaveReview(trade)}
                            className="w-full h-10"
                          >
                            <Star className="w-4 h-4 mr-2" />
                            Leave Review
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            );
          })}
        </div>

        {/* Review Modal */}
        {showReviewModal && selectedTradeForReview && (
          <ReviewModal
            isOpen={showReviewModal}
            onClose={() => {
              setShowReviewModal(false);
              setSelectedTradeForReview(null);
            }}
            tradeConversationId={selectedTradeForReview.id}
            revieweeId={
              selectedTradeForReview.requester_id === currentUser?.id 
                ? selectedTradeForReview.owner_id 
                : selectedTradeForReview.requester_id
            }
            revieweeName={
              selectedTradeForReview.requester_id === currentUser?.id 
                ? selectedTradeForReview.owner_profile?.username || 'Unknown User'
                : selectedTradeForReview.requester_profile?.username || 'Unknown User'
            }
          />
        )}

        {/* Item Modal */}
        {showItemModal && selectedItem && (
          <ExploreItemModal
            open={showItemModal}
            item={selectedItem}
            onClose={() => {
              setShowItemModal(false);
              setSelectedItem(null);
            }}
            disableActions={true}
            hideActions={false}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Trades;