
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MapPin, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchUserTradeConversations } from '@/services/tradeService';
import { supabase } from '@/integrations/supabase/client';

const Trades = () => {
  // Fetch confirmed trades from database
  const { data: tradeConversations = [], isLoading } = useQuery({
    queryKey: ['confirmed-trades'],
    queryFn: async () => {
      const conversations = await fetchUserTradeConversations();
      // Filter only accepted/completed trades
      return conversations.filter((tc: any) => tc.status === 'accepted' || tc.status === 'completed');
    }
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Trades</h1>
          <p className="text-gray-600 mt-2">View your completed and pending trade transactions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tradeConversations.map((trade: any) => {
            // Get current user
            const currentUserId = supabase.auth.getUser();
            const isRequester = trade.requester_id === currentUserId;
            const myItem = isRequester ? trade.requester_item : trade.owner_item;
            const theirItem = isRequester ? trade.owner_item : trade.requester_item;
            
            return (
              <Card key={trade.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Header with partner info */}
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&h=250&auto=format&fit=crop" alt="Trading Partner" />
                        <AvatarFallback>TP</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900">Trading Partner</h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(trade.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant={trade.status === 'completed' ? 'default' : 'secondary'}
                      className={trade.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                    >
                      {trade.status === 'accepted' ? 'Confirmed' : 'Completed'}
                    </Badge>
                  </div>
                </div>

                {/* Trade items */}
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* My item */}
                    <div className="text-center">
                      <div className="mb-2">
                        <img 
                          src={myItem?.image_url || '/placeholder.svg'} 
                          alt={myItem?.name || 'Your Item'}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      </div>
                      <p className="text-xs text-gray-600 mb-1">You traded</p>
                      <p className="text-sm font-medium">{myItem?.name || 'Your Item'}</p>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl text-blue-500 mb-2">↔</div>
                        <div className="text-xs text-gray-500">for</div>
                      </div>
                    </div>

                    {/* Their item */}
                    <div className="text-center col-start-2">
                      <div className="mb-2">
                        <img 
                          src={theirItem?.image_url || '/placeholder.svg'} 
                          alt={theirItem?.name || 'Their Item'}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      </div>
                      <p className="text-xs text-gray-600 mb-1">You received</p>
                      <p className="text-sm font-medium">{theirItem?.name || 'Their Item'}</p>
                    </div>
                  </div>

                  {/* Trade details */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <MapPin className="h-3 w-3 mr-1" />
                      Location TBD
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Your rating:</span>
                      {renderStars(5)}
                    </div>
                    
                    {trade.status === 'accepted' && (
                      <div className="mt-3">
                        <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                          Complete Trade
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {tradeConversations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Calendar className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No confirmed trades yet</h3>
            <p className="text-gray-500">Your confirmed trades will appear here once you accept trade offers!</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Trades;
