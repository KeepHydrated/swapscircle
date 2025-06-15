
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MapPin, Star } from 'lucide-react';

const Trades = () => {
  // Mock data for confirmed trades
  const confirmedTrades = [
    {
      id: 1,
      partnerId: 'emma-wilson',
      partnerName: 'Emma Wilson',
      partnerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&h=250&auto=format&fit=crop',
      myItem: {
        name: 'Vintage Coffee Maker',
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=250&h=250&auto=format&fit=crop'
      },
      theirItem: {
        name: 'Bluetooth Speaker',
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=250&h=250&auto=format&fit=crop'
      },
      tradeDate: '2024-06-10',
      status: 'Completed',
      location: 'Downtown Park',
      rating: 5
    },
    {
      id: 2,
      partnerId: 'alex-chen',
      partnerName: 'Alex Chen',
      partnerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=250&h=250&auto=format&fit=crop',
      myItem: {
        name: 'Board Game Collection',
        image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=250&h=250&auto=format&fit=crop'
      },
      theirItem: {
        name: 'Wireless Headphones',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=250&h=250&auto=format&fit=crop'
      },
      tradeDate: '2024-06-05',
      status: 'Completed',
      location: 'Coffee Shop on Main St',
      rating: 4
    },
    {
      id: 3,
      partnerId: 'sarah-johnson',
      partnerName: 'Sarah Johnson',
      partnerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b734?w=250&h=250&auto=format&fit=crop',
      myItem: {
        name: 'Kitchen Utensil Set',
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=250&h=250&auto=format&fit=crop'
      },
      theirItem: {
        name: 'Yoga Mat & Blocks',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=250&h=250&auto=format&fit=crop'
      },
      tradeDate: '2024-05-28',
      status: 'Pending Review',
      location: 'Community Center',
      rating: null
    }
  ];

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

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Trades</h1>
          <p className="text-gray-600 mt-2">View your completed and pending trade transactions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {confirmedTrades.map((trade) => (
            <Card key={trade.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Header with partner info */}
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={trade.partnerAvatar} alt={trade.partnerName} />
                      <AvatarFallback>{trade.partnerName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">{trade.partnerName}</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(trade.tradeDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant={trade.status === 'Completed' ? 'default' : 'secondary'}
                    className={trade.status === 'Completed' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {trade.status}
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
                        src={trade.myItem.image} 
                        alt={trade.myItem.name}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    </div>
                    <p className="text-xs text-gray-600 mb-1">You traded</p>
                    <p className="text-sm font-medium">{trade.myItem.name}</p>
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
                        src={trade.theirItem.image} 
                        alt={trade.theirItem.name}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    </div>
                    <p className="text-xs text-gray-600 mb-1">You received</p>
                    <p className="text-sm font-medium">{trade.theirItem.name}</p>
                  </div>
                </div>

                {/* Trade details */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPin className="h-3 w-3 mr-1" />
                    {trade.location}
                  </div>
                  
                  {trade.rating && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Your rating:</span>
                      {renderStars(trade.rating)}
                    </div>
                  )}
                  
                  {trade.status === 'Pending Review' && (
                    <div className="mt-3">
                      <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        Rate Trade
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {confirmedTrades.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Calendar className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No trades yet</h3>
            <p className="text-gray-500">Your completed trades will appear here once you start trading!</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Trades;
