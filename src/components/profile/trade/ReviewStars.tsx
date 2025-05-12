
import React from 'react';
import { Star } from 'lucide-react';

interface ReviewStarsProps {
  rating: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

const ReviewStars: React.FC<ReviewStarsProps> = ({ 
  rating, 
  interactive = false,
  onRatingChange
}) => {
  return (
    <div className="flex">
      {Array(5).fill(0).map((_, index) => (
        <Star 
          key={index}
          className={`h-5 w-5 ${
            index < rating 
              ? "text-yellow-400 fill-yellow-400" 
              : "text-gray-300"
          } ${interactive ? 'cursor-pointer' : ''}`}
          onClick={interactive && onRatingChange ? () => onRatingChange(index + 1) : undefined}
        />
      ))}
    </div>
  );
};

export default ReviewStars;
