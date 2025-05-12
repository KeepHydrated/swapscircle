
import React, { useState } from 'react';
import { toast } from 'sonner';
import TradeCard from './trade/TradeCard';
import { CompletedTrade, TradeReview } from '@/types/trade';

interface CompletedTradesTabProps {
  trades: CompletedTrade[];
}

const CompletedTradesTab: React.FC<CompletedTradesTabProps> = ({ trades }) => {
  const [localTrades, setLocalTrades] = useState<CompletedTrade[]>(
    trades.map(trade => ({
      ...trade,
      myReview: trade.myReview || undefined,
      theirReview: trade.theirReview || {
        rating: 4,
        comment: "Great trade! The item was exactly as described.",
        date: "2 weeks ago"
      }
    }))
  );

  const handleSubmitReview = (tradeId: number, review: TradeReview) => {
    setLocalTrades(trades => 
      trades.map(trade => 
        trade.id === tradeId 
          ? {
              ...trade,
              myReview: review
            }
          : trade
      )
    );
    
    toast.success("Review submitted successfully!");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {localTrades.map(trade => (
        <TradeCard 
          key={trade.id} 
          trade={trade}
          onSubmitReview={handleSubmitReview}
        />
      ))}
    </div>
  );
};

export default CompletedTradesTab;
