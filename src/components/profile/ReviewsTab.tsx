
import React from 'react';
import { Star } from 'lucide-react';

interface Review {
  id: number;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

interface ReviewsTabProps {
  reviews: Review[];
}

const ReviewsTab: React.FC<ReviewsTabProps> = ({ reviews }) => {
  return (
    <div className="space-y-6">
      {reviews.map(review => (
        <div key={review.id} className="bg-white rounded-lg border p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">{review.user}</div>
            <div className="text-sm text-muted-foreground">{review.date}</div>
          </div>
          <div className="flex items-center mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
              />
            ))}
          </div>
          <p className="text-gray-600">{review.comment}</p>
        </div>
      ))}
    </div>
  );
};

export default ReviewsTab;
