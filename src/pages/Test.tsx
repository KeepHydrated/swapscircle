
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, Tag, Layers, Shield, DollarSign, Star } from 'lucide-react';
import ReviewDialog from '@/components/profile/trade/ReviewDialog';
import { TradeReview } from '@/types/trade';

const Test = () => {
  const [hasLeftReview, setHasLeftReview] = useState(false);
  
  // Sample review data - you can replace this with actual data
  const myReview: TradeReview = {
    rating: 5,
    comment: "Great trading experience! The camera was exactly as described and Emma was very responsive.",
    date: "6/14/2025"
  };

  const theirReview: TradeReview = {
    rating: 4,
    comment: "Smooth transaction, would trade again!",
    date: "6/14/2025"
  };

  const handleSubmitReview = (comment: string, rating: number) => {
    console.log('Review submitted:', { rating, comment });
    setHasLeftReview(true);
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="text-left">
          <p className="text-sm text-gray-500 mb-4">6/15/2025</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* First Profile with Item */}
            <div className="space-y-4">
              {/* Profile Section */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Link to="/other-person-profile">
                    <Avatar className="h-12 w-12 hover:ring-2 hover:ring-blue-300 transition-all cursor-pointer">
                      <AvatarImage src="/lovable-uploads/6326c61e-753c-4972-9f13-6c9f3b171144.png" alt="Emma Wilson" />
                      <AvatarFallback className="bg-purple-100 text-purple-800">
                        EW
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div>
                    <Link 
                      to="/other-person-profile" 
                      className="font-semibold text-lg hover:text-blue-600 transition-colors"
                    >
                      Emma Wilson
                    </Link>
                    <div className="flex items-center text-yellow-400">
                      {Array(5).fill(0).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                      <span className="ml-1 text-gray-600 text-sm font-medium">(42)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Item Section */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="aspect-square bg-gray-100 w-32 h-32">
                  <img 
                    src="https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400&h=400&auto=format&fit=crop" 
                    alt="Vintage Camera" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">Vintage Film Camera</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Beautiful vintage 35mm film camera in excellent working condition. Perfect for photography enthusiasts.
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 text-sm">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-gray-500" />
                      <span>Electronics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-gray-500" />
                      <span>Cameras</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-500" />
                      <span>Excellent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span>150 - 200</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Second Profile with Item */}
            <div className="space-y-4">
              {/* Profile Section */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Link to="/other-person-profile">
                    <Avatar className="h-12 w-12 hover:ring-2 hover:ring-blue-300 transition-all cursor-pointer">
                      <AvatarImage src="/lovable-uploads/6de02767-04e3-4b51-93af-053033a1c111.png" alt="Marcus Chen" />
                      <AvatarFallback className="bg-blue-100 text-blue-800">
                        MC
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div>
                    <Link 
                      to="/other-person-profile" 
                      className="font-semibold text-lg hover:text-blue-600 transition-colors"
                    >
                      Marcus Chen
                    </Link>
                    <div className="flex items-center text-yellow-400">
                      {Array(4).fill(0).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                      <span className="text-gray-300">★</span>
                      <span className="ml-1 text-gray-600 text-sm font-medium">(28)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Item Section */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="aspect-square bg-gray-100 w-32 h-32">
                  <img 
                    src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=400&auto=format&fit=crop" 
                    alt="MacBook Pro" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">MacBook Pro 13-inch</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    2020 MacBook Pro in great condition. Fast performance for work and creative projects.
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 text-sm">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-gray-500" />
                      <span>Electronics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-gray-500" />
                      <span>Laptops</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-500" />
                      <span>Good</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span>800 - 1000</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="space-y-4">
              {/* Your Review */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-lg mb-4">Your Review</h3>
                
                {hasLeftReview ? (
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400">
                        {Array(5).fill(0).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < myReview.rating ? "fill-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-2">{myReview.comment}</p>
                    <p className="text-xs text-gray-500">Reviewed on {myReview.date}</p>
                  </div>
                ) : (
                  <ReviewDialog
                    type="leave"
                    traderId="Emma Wilson"
                    onSubmitReview={handleSubmitReview}
                  />
                )}
              </div>

              {/* Their Review */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-lg mb-4">Their Review</h3>
                
                <div>
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400">
                      {Array(5).fill(0).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < theirReview.rating ? "fill-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm mb-2">{theirReview.comment}</p>
                  <p className="text-xs text-gray-500">Reviewed on {theirReview.date}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Test;
