
import React from 'react';
import { Card } from '@/components/ui/card';
import ReviewStars from './ReviewStars';
import ReviewDialog from './ReviewDialog';
import { CompletedTrade, TradeReview } from '@/types/trade';

interface TradeCardProps {
  trade: CompletedTrade;
  onSubmitReview: (tradeId: number, review: TradeReview) => void;
}

const TradeCard: React.FC<TradeCardProps> = ({ trade, onSubmitReview }) => {
  const handleSubmitReview = (comment: string, rating: number) => {
    const newReview: TradeReview = {
      rating,
      comment,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    };
    onSubmitReview(trade.id, newReview);
  };

  return (
    <Card key={trade.id} className="overflow-hidden">
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-800">{trade.tradedWith}</h3>
            <p className="text-xs text-gray-500">{trade.tradeDate}</p>
          </div>
          
          {/* Review summary display */}
          <div className="flex items-center space-x-4">
            {trade.myReview && (
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-600">Your Review</span>
                <ReviewStars rating={trade.myReview.rating} />
              </div>
            )}
            
            {trade.theirReview && (
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-600">Their Review</span>
                <ReviewStars rating={trade.theirReview.rating} />
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row p-4">
        <div className="w-full sm:w-1/2 pb-4 sm:pb-0 sm:pr-2 border-b sm:border-b-0 sm:border-r">
          <div className="text-center mb-1 text-sm text-gray-600 font-medium">I traded:</div>
          <div className="h-40 overflow-hidden mb-2">
            <img 
              src={trade.image} 
              alt={trade.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-center text-sm">{trade.name}</p>
        </div>
        <div className="w-full sm:w-1/2 pt-4 sm:pt-0 sm:pl-2">
          <div className="text-center mb-1 text-sm text-gray-600 font-medium">For:</div>
          <div className="h-40 overflow-hidden mb-2">
            <img 
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f" 
              alt={trade.tradedFor} 
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-center text-sm">{trade.tradedFor}</p>
        </div>
      </div>
      
      <div className="px-4 pb-4">
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          {trade.theirReview && (
            <ReviewDialog 
              type="view-their" 
              traderId={trade.tradedWith} 
              review={trade.theirReview} 
            />
          )}
          
          {trade.myReview ? (
            <ReviewDialog 
              type="view-my" 
              traderId={trade.tradedWith} 
              review={trade.myReview} 
            />
          ) : (
            <ReviewDialog 
              type="leave" 
              traderId={trade.tradedWith} 
              onSubmitReview={handleSubmitReview} 
            />
          )}
        </div>
      </div>
    </Card>
  );
};

export default TradeCard;
