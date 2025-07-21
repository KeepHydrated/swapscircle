import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserTradeConversations } from '@/services/tradeService';
import { checkReviewEligibility } from '@/services/reviewService';
import { useNavigate } from 'react-router-dom';
import { Clock, MessageCircle, CheckCircle, XCircle, Star, ArrowLeftRight } from 'lucide-react';
import { format } from 'date-fns';
import ReviewModal from '@/components/trade/ReviewModal';
import ExploreItemModal from '@/components/items/ExploreItemModal';

const Trades = () => {
  const navigate = useNavigate();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedTradeForReview, setSelectedTradeForReview] = useState<any>(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const { data: trades = [], isLoading } = useQuery({
    queryKey: ['trade-conversations'],
    queryFn: fetchUserTradeConversations,
  });

  // Fetch reviews for all trades
  const { data: allReviews = [], refetch: refetchReviews } = useQuery({
    queryKey: ['trade-reviews'],
    queryFn: async () => {
      if (trades.length === 0) return [];
      
      console.log('Fetching reviews for trades:', trades.map(t => t.id));
      
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .in('trade_conversation_id', trades.map(t => t.id));
      
      if (error) {
        console.error('Error fetching reviews:', error);
        return [];
      }
      
      console.log('Fetched reviews:', data);
      return data || [];
    },
    enabled: trades.length > 0,
  });

  // Get current user ID from auth
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  React.useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  const getStatusBadge = (trade: any) => {
    if (trade.status === 'completed') {
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    }
    if (trade.status === 'rejected') {
      return <Badge variant="destructive">Rejected</Badge>;
    }
    if (trade.requester_accepted && trade.owner_accepted) {
      return <Badge className="bg-blue-100 text-blue-800">Both Accepted</Badge>;
    }
    if (trade.requester_accepted || trade.owner_accepted) {
      return <Badge className="bg-yellow-100 text-yellow-800">Partially Accepted</Badge>;
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  const handleOpenChat = (tradeId: string) => {
    navigate(`/messages?conversation=${tradeId}`);
  };

  const handleLeaveReview = async (trade: any) => {
    const eligibility = await checkReviewEligibility(trade.id);
    if (eligibility.canReview) {
      setSelectedTradeForReview(trade);
      setShowReviewModal(true);
    }
  };

  const pendingTrades = trades.filter((trade: any) => 
    trade.status === 'pending' || (trade.requester_accepted && !trade.owner_accepted) || (!trade.requester_accepted && trade.owner_accepted)
  );

  const completedTrades = trades.filter((trade: any) => trade.status === 'completed');
  const rejectedTrades = trades.filter((trade: any) => trade.status === 'rejected');

  const TradeCard = ({ trade }: { trade: any }) => {
    // Determine the other user based on current user ID
    const otherUser = trade.requester_id === currentUserId 
      ? trade.owner_profile 
      : trade.requester_profile;

    // Get reviews for this trade
    const tradeReviews = allReviews.filter(review => review.trade_conversation_id === trade.id);
    const yourReview = tradeReviews.find(review => review.reviewer_id === currentUserId);
    const theirReview = tradeReviews.find(review => review.reviewee_id === currentUserId);

    const renderStars = (rating: number) => {
      return Array.from({ length: 5 }, (_, i) => (
        <Star 
          key={i} 
          className={`w-3 h-3 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      ));
    };

    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between">
            {/* Left side - existing trade info */}
            <div className="flex-1 pr-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Avatar 
                    className="h-10 w-10 cursor-pointer hover:opacity-80"
                     onClick={() => navigate(`/other-person-profile?userId=${otherUser?.id}`)}
                  >
                    <AvatarImage src={otherUser?.avatar_url} />
                    <AvatarFallback>
                      {otherUser?.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p 
                      className="font-medium cursor-pointer hover:text-blue-600"
                      onClick={() => navigate(`/other-person-profile?userId=${otherUser?.id}`)}
                    >
                      {otherUser?.username || 'Unknown User'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(trade.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                {getStatusBadge(trade)}
              </div>

              <div className="flex items-start space-x-2 mb-3">
                {/* Determine which items to show based on current user */}
                {(() => {
                  const isCurrentUserRequester = trade.requester_id === currentUserId;
                  const theirItem = isCurrentUserRequester ? trade.owner_item : trade.requester_item;
                  const yourItem = isCurrentUserRequester ? trade.requester_item : trade.owner_item;
                  
                  return (
                    <>
                      {/* Their item (left side) */}
                      <div className="flex flex-col items-center">
                        <img 
                          src={theirItem?.image_url} 
                          alt={theirItem?.name}
                          className="w-12 h-12 object-cover rounded mb-1 cursor-pointer hover:opacity-80"
                          onClick={() => {
                            setSelectedItem(theirItem);
                            setShowItemModal(true);
                          }}
                        />
                        <span className="text-sm text-gray-600 font-medium text-center">
                          {theirItem?.name}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-center px-2 pt-5">
                        <ArrowLeftRight className="w-4 h-4 text-gray-400" />
                      </div>
                      
                      {/* Your item (right side) */}
                      <div className="flex flex-col items-center">
                        <img 
                          src={yourItem?.image_url} 
                          alt={yourItem?.name}
                          className="w-12 h-12 object-cover rounded mb-1 cursor-pointer hover:opacity-80"
                          onClick={() => {
                            setSelectedItem(yourItem);
                            setShowItemModal(true);
                          }}
                        />
                        <span className="text-sm text-gray-600 font-medium text-center">
                          {yourItem?.name}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleOpenChat(trade.id)}
                  className="flex-1"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Open Chat
                </Button>
                
                {trade.status === 'completed' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleLeaveReview(trade)}
                    className="flex items-center"
                  >
                    <Star className="w-4 h-4 mr-1" />
                    Review
                  </Button>
                )}
              </div>
            </div>

            {/* Right side - reviews */}
            {trade.status === 'completed' && (
              <div className="w-72 pl-4 border-l border-gray-200 space-y-3">
                
                
                {/* Their review of you */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Their review</span>
                    {theirReview && (
                      <div className="flex">
                        {renderStars(theirReview.rating)}
                      </div>
                    )}
                  </div>
                  {theirReview ? (
                    <p className="text-sm text-gray-600">
                      {theirReview.comment || 'No comment provided'}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No review yet</p>
                  )}
                </div>

                {/* Your review of them */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Your review</span>
                    {yourReview && (
                      <div className="flex">
                        {renderStars(yourReview.rating)}
                      </div>
                    )}
                  </div>
                  {yourReview ? (
                    <p className="text-sm text-gray-600">
                      {yourReview.comment || 'No comment provided'}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No review yet</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-6 max-w-4xl mx-auto">
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

  return (
    <MainLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Trades</h1>
          <p className="text-gray-600">Manage your trading activities and conversations</p>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Pending ({pendingTrades.length})</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Completed ({completedTrades.length})</span>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center space-x-2">
              <XCircle className="w-4 h-4" />
              <span>Rejected ({rejectedTrades.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            {pendingTrades.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No pending trades</h3>
                  <p className="text-gray-500">You don't have any pending trade requests at the moment.</p>
                </CardContent>
              </Card>
            ) : (
              <div>
                {pendingTrades.map((trade: any) => (
                  <TradeCard key={trade.id} trade={trade} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {completedTrades.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No completed trades</h3>
                  <p className="text-gray-500">You haven't completed any trades yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div>
                {completedTrades.map((trade: any) => (
                  <TradeCard key={trade.id} trade={trade} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            {rejectedTrades.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No rejected trades</h3>
                  <p className="text-gray-500">You don't have any rejected trades.</p>
                </CardContent>
                </Card>
            ) : (
              <div>
                {rejectedTrades.map((trade: any) => (
                  <TradeCard key={trade.id} trade={trade} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Review Modal */}
        {showReviewModal && selectedTradeForReview && (
          <ReviewModal
            isOpen={showReviewModal}
            onClose={() => {
              setShowReviewModal(false);
              setSelectedTradeForReview(null);
            }}
            tradeConversationId={selectedTradeForReview.id}
            revieweeId={selectedTradeForReview.requester_profile?.id === selectedTradeForReview.owner_profile?.id 
              ? selectedTradeForReview.owner_profile?.id 
              : (selectedTradeForReview.requester_profile?.id || selectedTradeForReview.owner_profile?.id)}
            revieweeName={selectedTradeForReview.requester_profile?.id === selectedTradeForReview.owner_profile?.id 
              ? selectedTradeForReview.owner_profile?.username 
              : (selectedTradeForReview.requester_profile?.username || selectedTradeForReview.owner_profile?.username)}
          />
        )}

        {/* Item Modal */}
        {showItemModal && selectedItem && (
          <ExploreItemModal
            item={selectedItem}
            open={showItemModal}
            hideActions={true}
            onClose={() => {
              setShowItemModal(false);
              setSelectedItem(null);
            }}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Trades;