
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MessageSquare, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import {
  Textarea
} from '@/components/ui/textarea';

interface CompletedTrade {
  id: number;
  name: string;
  tradedFor: string;
  tradedWith: string;
  tradeDate: string;
  image: string;
  myReview?: {
    rating: number;
    comment: string;
    date: string;
  };
  theirReview?: {
    rating: number;
    comment: string;
    date: string;
  };
}

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
  const [selectedRating, setSelectedRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [currentTradeId, setCurrentTradeId] = useState<number | null>(null);

  const handleSubmitReview = () => {
    if (currentTradeId === null) return;
    
    setLocalTrades(trades => 
      trades.map(trade => 
        trade.id === currentTradeId 
          ? {
              ...trade,
              myReview: {
                rating: selectedRating,
                comment: reviewText,
                date: new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              }
            }
          : trade
      )
    );
    
    toast.success("Review submitted successfully!");
    setReviewText("");
    setSelectedRating(5);
  };

  const openReviewDialog = (tradeId: number) => {
    setCurrentTradeId(tradeId);
    setReviewText("");
    setSelectedRating(5);
  };

  const renderRatingStars = (rating: number, interactive = false) => {
    return Array(5).fill(0).map((_, index) => (
      <Star 
        key={index}
        className={`h-5 w-5 ${
          index < rating 
            ? "text-yellow-400 fill-yellow-400" 
            : "text-gray-300"
        } ${interactive ? 'cursor-pointer' : ''}`}
        onClick={interactive ? () => setSelectedRating(index + 1) : undefined}
      />
    ));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {localTrades.map(item => (
        <Card key={item.id} className="overflow-hidden">
          <div className="p-3 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-800">{item.tradedWith}</h3>
                <p className="text-xs text-gray-500">{item.tradeDate}</p>
              </div>
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                Completed
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row p-4">
            <div className="w-full sm:w-1/2 pb-4 sm:pb-0 sm:pr-2 border-b sm:border-b-0 sm:border-r">
              <div className="text-center mb-1 text-sm text-gray-600 font-medium">I traded:</div>
              <div className="h-40 overflow-hidden mb-2">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-center text-sm">{item.name}</p>
            </div>
            <div className="w-full sm:w-1/2 pt-4 sm:pt-0 sm:pl-2">
              <div className="text-center mb-1 text-sm text-gray-600 font-medium">For:</div>
              <div className="h-40 overflow-hidden mb-2">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f" 
                  alt={item.tradedFor} 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-center text-sm">{item.tradedFor}</p>
            </div>
          </div>
          <div className="px-4 pb-4">
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              {item.theirReview && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      View Their Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Review from {item.tradedWith}</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center mt-2 mb-4">
                      {renderRatingStars(item.theirReview.rating)}
                    </div>
                    <p className="text-gray-700">{item.theirReview.comment}</p>
                    <div className="text-sm text-gray-500 mt-4">
                      Reviewed on {item.theirReview.date}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              
              {item.myReview ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Check className="h-4 w-4 mr-2" />
                      You Left a Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Your Review</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center mt-2 mb-4">
                      {renderRatingStars(item.myReview.rating)}
                    </div>
                    <p className="text-gray-700">{item.myReview.comment}</p>
                    <div className="text-sm text-gray-500 mt-4">
                      Reviewed on {item.myReview.date}
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="default" size="sm" className="flex-1" onClick={() => openReviewDialog(item.id)}>
                      <Star className="h-4 w-4 mr-2" />
                      Leave a Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Review your trade with {item.tradedWith}</DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-center my-4">
                      <div className="flex">
                        {renderRatingStars(selectedRating, true)}
                      </div>
                    </div>
                    <Textarea
                      placeholder="Share your experience with this trade..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="min-h-[100px] mb-4"
                    />
                    <div className="flex justify-end gap-2">
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button onClick={handleSubmitReview} disabled={!reviewText.trim()}>
                          Submit Review
                        </Button>
                      </DialogClose>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default CompletedTradesTab;
