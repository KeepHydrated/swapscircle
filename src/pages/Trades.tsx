import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Star, ArrowLeftRight } from 'lucide-react';

const Trades = () => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Trades</h1>
          <p className="text-gray-600">Manage your trading activities and conversations</p>
        </div>

        <div className="flex gap-6">
          {/* Left side - Trade Details */}
          <div className="flex-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-sm text-gray-500">Jul 21, 2025</div>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    Completed
                  </Badge>
                </div>

                {/* Trade Items */}
                <div className="flex items-center justify-center space-x-6 mb-6">
                  {/* First Item */}
                  <div className="flex flex-col items-center">
                    <img 
                      src="/lovable-uploads/38d2f591-af11-47ac-bf7c-87b79a031630.png" 
                      alt="Women shirt 2"
                      className="w-24 h-24 object-cover rounded-lg mb-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Women shirt 2</span>
                  </div>
                  
                  {/* Exchange Arrow */}
                  <div className="flex items-center justify-center">
                    <ArrowLeftRight className="w-6 h-6 text-gray-400" />
                  </div>
                  
                  {/* Second Item */}
                  <div className="flex flex-col items-center">
                    <img 
                      src="/lovable-uploads/38d2f591-af11-47ac-bf7c-87b79a031630.png" 
                      alt="Item 3"
                      className="w-24 h-24 object-cover rounded-lg mb-2"
                    />
                    <span className="text-sm font-medium text-gray-700">3</span>
                  </div>
                </div>

                {/* Open Chat Button */}
                <Button 
                  variant="outline" 
                  className="w-full"
                  size="lg"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Open Chat
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right side - Reviews */}
          <div className="w-96">
            <Card>
              <CardContent className="p-6 space-y-6">
                {/* Their Review */}
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gray-200 text-gray-600 text-sm">H</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">hhhhhhh's review</span>
                        <div className="flex">
                          {renderStars(4)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    I loved working with this seller! He was an amazing trader. He did such a good job. Bla bla bla
                  </p>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Your Review */}
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">Y</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">Your review</span>
                        <div className="flex">
                          {renderStars(5)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Great seller! He did amazing. Thank you so very much!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Trades;