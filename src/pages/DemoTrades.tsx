import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Star, ArrowLeftRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

// Mock data for demo trades
const mockTrades = [
  {
    id: '1',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    otherUser: {
      id: 'user1',
      username: 'TechTrader',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    },
    theirItem: {
      id: 'item1',
      name: 'Vintage Camera',
      image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&h=300&fit=crop',
    },
    yourItem: {
      id: 'item2',
      name: 'Leather Messenger Bag',
      image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&h=300&fit=crop',
    },
    theirReview: {
      rating: 5,
      comment: 'Great trader! The bag was exactly as described. Quick communication and smooth exchange.',
    },
    yourReview: {
      rating: 5,
      comment: 'Amazing experience! The camera works perfectly. Would trade again!',
    },
  },
  {
    id: '2',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    otherUser: {
      id: 'user2',
      username: 'VintageCollector',
      avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    },
    theirItem: {
      id: 'item3',
      name: 'Mechanical Keyboard',
      image_url: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=300&h=300&fit=crop',
    },
    yourItem: {
      id: 'item4',
      name: 'Wireless Headphones',
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
    },
    theirReview: {
      rating: 4,
      comment: 'Good trade overall. Item was in good condition.',
    },
    yourReview: null,
  },
  {
    id: '3',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    otherUser: {
      id: 'user3',
      username: 'BookLover42',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    },
    theirItem: {
      id: 'item5',
      name: 'Classic Book Collection',
      image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=300&fit=crop',
    },
    yourItem: {
      id: 'item6',
      name: 'Art Prints Set',
      image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=300&h=300&fit=crop',
    },
    theirReview: {
      rating: 5,
      comment: 'Wonderful trade! The art prints are beautiful quality.',
    },
    yourReview: {
      rating: 5,
      comment: 'The books are in perfect condition. Highly recommend this trader!',
    },
  },
];

const DemoTrades = () => {
  const [currentTradeIndex, setCurrentTradeIndex] = useState(0);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const handlePrevTrade = () => {
    setCurrentTradeIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextTrade = () => {
    setCurrentTradeIndex(prev => Math.min(mockTrades.length - 1, prev + 1));
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Demo Banner */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            <strong>Demo Mode:</strong> This is a sample view of completed trades. Sign up to start trading!
          </p>
        </div>

        <div className="mb-6 hidden md:block">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">My Trades</h1>
          </div>
          <p className="text-gray-600">Manage your trading activities and conversations</p>
        </div>
        
        {/* Mobile navigation */}
        {mockTrades.length > 1 && (
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
              {currentTradeIndex + 1}/{mockTrades.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextTrade}
              disabled={currentTradeIndex === mockTrades.length - 1}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="space-y-6">
          {mockTrades.map((trade, index) => (
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
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Completed
                      </Badge>
                    </div>

                    {/* Trade Items */}
                    <div className="flex items-center justify-center space-x-6 mb-6">
                      {/* Their Item */}
                      <div className="flex flex-col items-center">
                        <img 
                          src={trade.theirItem.image_url} 
                          alt={trade.theirItem.name}
                          loading="lazy"
                          className="w-24 h-24 object-cover rounded-lg mb-2"
                        />
                        <span className="text-sm font-medium text-gray-700 text-center max-w-24 truncate">
                          {trade.theirItem.name}
                        </span>
                      </div>
                      
                      {/* Exchange Arrow */}
                      <div className="flex items-center justify-center">
                        <ArrowLeftRight className="w-6 h-6 text-gray-400" />
                      </div>
                      
                      {/* Your Item */}
                      <div className="flex flex-col items-center">
                        <img 
                          src={trade.yourItem.image_url} 
                          alt={trade.yourItem.name}
                          loading="lazy"
                          className="w-24 h-24 object-cover rounded-lg mb-2"
                        />
                        <span className="text-sm font-medium text-gray-700 text-center max-w-24 truncate">
                          {trade.yourItem.name}
                        </span>
                      </div>
                    </div>

                    {/* Open Chat Button */}
                    <Button 
                      variant="outline" 
                      className="w-full h-10"
                      disabled
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
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={trade.otherUser.avatar_url} />
                        <AvatarFallback className="bg-gray-200 text-gray-600 text-sm">
                          {trade.otherUser.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">
                          {trade.otherUser.username}
                        </span>
                      </div>
                    </div>
                    {trade.theirReview ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Their review of you:</p>
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex">
                            {renderStars(trade.theirReview.rating)}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {trade.theirReview.comment}
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
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                          Y
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">
                          You
                        </span>
                      </div>
                    </div>
                    
                    {trade.yourReview ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Your review:</p>
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex">
                            {renderStars(trade.yourReview.rating)}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {trade.yourReview.comment}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-gray-400 text-sm italic">Leave a review for {trade.otherUser.username}</p>
                        <Button 
                          variant="outline" 
                          className="w-full h-10"
                          disabled
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
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default DemoTrades;
