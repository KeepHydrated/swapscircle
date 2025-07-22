import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { createReview } from '@/services/reviewService';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tradeConversationId: string;
  revieweeId: string;
  revieweeName: string;
}

const ReviewModal = ({ isOpen, onClose, tradeConversationId, revieweeId, revieweeName }: ReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();
  
  const MAX_REVIEW_LENGTH = 140; // Character limit for ~2 lines

  const createReviewMutation = useMutation({
    mutationFn: (data: { rating: number; comment?: string }) =>
      createReview(tradeConversationId, revieweeId, data.rating, data.comment),
    onSuccess: () => {
      console.log('Review submitted successfully, invalidating queries...');
      toast.success('Review submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['trade-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['trade-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviewEligibility', tradeConversationId] });
      console.log('Queries invalidated');
      onClose();
      setRating(0);
      setComment('');
    },
    onError: (error) => {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  });

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    createReviewMutation.mutate({
      rating,
      comment: comment.trim() || undefined
    });
  };

  const handleClose = () => {
    onClose();
    setRating(0);
    setComment('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Review {revieweeName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              How was your trading experience with {revieweeName}?
            </p>
            
            <div className="flex justify-center space-x-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-colors"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Comments (optional)
              </label>
              <span className={`text-xs ${comment.length > MAX_REVIEW_LENGTH ? 'text-red-500' : 'text-gray-400'}`}>
                {comment.length}/{MAX_REVIEW_LENGTH}
              </span>
            </div>
            <Textarea
              value={comment}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= MAX_REVIEW_LENGTH) {
                  setComment(value);
                }
              }}
              placeholder="Share your experience with this trader..."
              rows={4}
              maxLength={MAX_REVIEW_LENGTH}
            />
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={createReviewMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={rating === 0 || createReviewMutation.isPending}
            >
              {createReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;