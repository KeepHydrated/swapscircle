
import React from 'react';
import { Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';

interface Review {
  id: string | number;
  reviewer_id?: string;
  user: string;
  avatar_url?: string;
  rating: number;
  comment: string;
  date: string;
}

interface ReviewsTabProps {
  reviews: Review[];
}

const ReviewsTab: React.FC<ReviewsTabProps> = ({ reviews }) => {
  const navigate = useNavigate();

  const handleProfileClick = (reviewerId: string) => {
    navigate(`/other-profile/${reviewerId}`);
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
        <p className="text-gray-500">Reviews from completed trades will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map(review => (
        <div key={review.id} className="bg-white rounded-lg border p-4 shadow-sm">
          <div className="flex items-start space-x-3 mb-3">
            <Avatar 
              className={`h-10 w-10 transition-opacity ${review.reviewer_id ? 'cursor-pointer hover:opacity-80' : ''}`}
              onClick={() => review.reviewer_id && handleProfileClick(review.reviewer_id)}
            >
              <AvatarImage src={review.avatar_url} />
              <AvatarFallback>
                {review.user?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <div 
                  className={`font-medium text-gray-900 transition-colors ${review.reviewer_id ? 'cursor-pointer hover:text-blue-600' : ''}`}
                  onClick={() => review.reviewer_id && handleProfileClick(review.reviewer_id)}
                >
                  {review.user}
                </div>
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
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewsTab;
