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
import { MessageCircle, Star, ArrowLeftRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import ExploreItemModal from '@/components/items/ExploreItemModal';
import ReviewModal from '@/components/trade/ReviewModal';

const Trades = () => {
  const navigate = useNavigate();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedTradeForReview, setSelectedTradeForReview] = useState<any>(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [currentTradeIndex, setCurrentTradeIndex] = useState(0);

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
  const realCompleted = trades.filter((trade: any) => trade.status === 'completed');

  // Demo completed trades to enrich the page when there are few real ones
  const demoCompletedTrades = [
    {
      id: 'demo-trade-1',
      status: 'completed',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
      requester_id: 'demo-user-1',
      owner_id: currentUser?.id,
      requester_item: {
        id: 'demo-item-a',
        name: 'Vintage Polaroid Camera',
        image_url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400',
      },
      owner_item: {
        id: 'demo-item-b',
        name: 'Leather Messenger Bag',
        image_url: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=400',
      },
      requester_profile: { id: 'demo-user-1', username: 'jordan_m', avatar_url: null },
      owner_profile: { id: currentUser?.id, username: currentUser?.profile?.username, avatar_url: currentUser?.profile?.avatar_url },
    },
    {
      id: 'demo-trade-2',
      status: 'completed',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      requester_id: currentUser?.id,
      owner_id: 'demo-user-2',
      requester_item: {
        id: 'demo-item-c',
        name: 'Acoustic Guitar',
        image_url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400',
      },
      owner_item: {
        id: 'demo-item-d',
        name: 'Vinyl Record Collection',
        image_url: 'https://images.unsplash.com/photo-1483821474127-c45c205c1cf3?w=400',
      },
      requester_profile: { id: currentUser?.id, username: currentUser?.profile?.username, avatar_url: currentUser?.profile?.avatar_url },
      owner_profile: { id: 'demo-user-2', username: 'sam_w', avatar_url: null },
    },
    {
      id: 'demo-trade-3',
      status: 'completed',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
      requester_id: 'demo-user-3',
      owner_id: currentUser?.id,
      requester_item: {
        id: 'demo-item-e',
        name: 'Snowboard',
        image_url: 'https://images.unsplash.com/photo-1551698618-5d6e605d7e9c?w=400',
      },
      owner_item: {
        id: 'demo-item-f',
        name: 'Mountain Bike Helmet',
        image_url: 'https://images.unsplash.com/photo-1600181958749-3ed4f8d2f1d3?w=400',
      },
      requester_profile: { id: 'demo-user-3', username: 'alex_k', avatar_url: null },
      owner_profile: { id: currentUser?.id, username: currentUser?.profile?.username, avatar_url: currentUser?.profile?.avatar_url },
    },
  ];

  const completedTrades = [...realCompleted, ...demoCompletedTrades];

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
        className={`w-4 h-4 ${i < rating ? 'text-primary fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getItemImage = (item: any) => {
    const urls = item?.image_urls as string[] | undefined;
    return item?.image_url || (Array.isArray(urls) && urls.length > 0 ? urls[0] : '/placeholder.svg');
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

  const handlePrevTrade = () => {
    setCurrentTradeIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextTrade = () => {
    setCurrentTradeIndex(prev => Math.min(completedTrades.length - 1, prev + 1));
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
          <div className="mb-6 hidden md:block">
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
        <div className="mb-6 hidden md:block">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">My Trades</h1>
          </div>
          <p className="text-gray-600">Manage your trading activities and conversations</p>
        </div>
        
        {/* Mobile navigation - only show if multiple trades */}
        {completedTrades.length > 1 && (
          <div className="flex items-center justify-center space-x-2 md:hidden mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevTrade}
              disabled={currentTradeIndex === 0}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-500 min-w-[40px] text-center">
              {currentTradeIndex + 1}/{completedTrades.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextTrade}
              disabled={currentTradeIndex === completedTrades.length - 1}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="space-y-6">
          {completedTrades.map((trade: any, index: number) => {
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
              <div 
                key={trade.id} 
                className={`flex flex-col md:flex-row gap-4 ${
                  index === currentTradeIndex ? 'block' : 'hidden md:flex'
                }`}
              >
                {/* Left side - Trade Details */}
                <div className="w-full md:w-[45%] md:flex-shrink-0">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-sm text-gray-500">
                          {format(new Date(trade.created_at), 'MMM d, yyyy')}
                        </div>
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                          Completed
                        </Badge>
                      </div>

                      {/* Trade Items */}
                      <div className="flex items-center justify-center space-x-6 mb-6">
                        {/* Their Item */}
                         <div className="flex flex-col items-center">
                           <img 
                             src={getItemImage(theirItem)} 
                             alt={theirItem?.name || 'Item'}
                             loading="lazy"
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
                             src={getItemImage(yourItem)} 
                             alt={yourItem?.name || 'Item'}
                             loading="lazy"
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
                <div className="w-full md:flex-1 md:min-w-0">
                  <Card className="h-full max-h-[280px]">
                    <CardContent className="p-4 h-full overflow-y-auto">
                      <div className="flex items-center space-x-3 mb-3">
                        <Avatar 
                          className="h-8 w-8 cursor-pointer"
                          onClick={() => otherUser?.id && handleProfileClick(otherUser.id)}
                        >
                          <AvatarImage src={otherUser?.avatar_url} />
                          <AvatarFallback className="bg-gray-200 text-gray-600 text-sm">
                            {otherUser?.username?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <span 
                            className="font-medium text-gray-900 cursor-pointer"
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
                <div className="w-full md:flex-1 md:min-w-0">
                  <Card className="h-full max-h-[280px]">
                    <CardContent className="p-4 h-full overflow-y-auto">
                      <div className="flex items-center space-x-3 mb-3">
                        <Avatar 
                          className="h-8 w-8 cursor-pointer"
                          onClick={handleMyProfileClick}
                        >
                          <AvatarImage src={currentUser?.profile?.avatar_url} />
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                            {currentUser?.profile?.username?.charAt(0).toUpperCase() || 'Y'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <span 
                            className="font-medium text-gray-900 cursor-pointer"
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