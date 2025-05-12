
import React from 'react';
import { Check, MessageSquare, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import ReviewStars from './ReviewStars';
import { TradeReview } from '@/types/trade';

interface ReviewDialogProps {
  type: 'view-my' | 'view-their' | 'leave';
  traderId: string;
  review?: TradeReview;
  onSubmitReview?: (comment: string, rating: number) => void;
  children?: React.ReactNode;
}

const ReviewDialog: React.FC<ReviewDialogProps> = ({ 
  type, 
  traderId, 
  review, 
  onSubmitReview,
  children 
}) => {
  const [reviewText, setReviewText] = React.useState('');
  const [selectedRating, setSelectedRating] = React.useState(5);

  const handleRatingChange = (rating: number) => {
    setSelectedRating(rating);
  };

  const handleSubmit = () => {
    if (onSubmitReview) {
      onSubmitReview(reviewText, selectedRating);
      setReviewText('');
      setSelectedRating(5);
    }
  };

  // Default button content if no children are provided
  let defaultTrigger;
  if (type === 'view-my') {
    defaultTrigger = (
      <Button variant="outline" size="sm" className="flex-1">
        <Check className="h-4 w-4 mr-2" />
        You Left a Review
      </Button>
    );
  } else if (type === 'view-their') {
    defaultTrigger = (
      <Button variant="outline" size="sm" className="flex-1">
        <MessageSquare className="h-4 w-4 mr-2" />
        View Their Review
      </Button>
    );
  } else {
    defaultTrigger = (
      <Button variant="default" size="sm" className="flex-1">
        <Star className="h-4 w-4 mr-2" />
        Leave a Review
      </Button>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || defaultTrigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === 'view-my' 
              ? 'Your Review' 
              : type === 'view-their' 
                ? `Review from ${traderId}` 
                : `Review your trade with ${traderId}`}
          </DialogTitle>
        </DialogHeader>
        
        {(type === 'view-my' || type === 'view-their') && review ? (
          <>
            <div className="flex items-center mt-2 mb-4">
              <ReviewStars rating={review.rating} />
            </div>
            <p className="text-gray-700">{review.comment}</p>
            <div className="text-sm text-gray-500 mt-4">
              Reviewed on {review.date}
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center my-4">
              <ReviewStars 
                rating={selectedRating} 
                interactive={true} 
                onRatingChange={handleRatingChange} 
              />
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
                <Button onClick={handleSubmit} disabled={!reviewText.trim()}>
                  Submit Review
                </Button>
              </DialogClose>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;
