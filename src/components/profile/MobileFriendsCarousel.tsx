import React, { useState } from 'react';
import { SwipeCard } from '@/components/ui/swipe-card';
import { Heart, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface FriendItem {
  id: string;
  title: string;
  image: string;
  description: string;
  condition: string;
  category: string;
  distance?: string;
  user: {
    name: string;
    avatar_url?: string;
    id: string;
  };
}

interface MobileFriendsCarouselProps {
  items: FriendItem[];
  onLike?: (id: string) => void;
}

export const MobileFriendsCarousel: React.FC<MobileFriendsCarouselProps> = ({
  items,
  onLike
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const handleSwipeRight = () => {
    if (currentIndex < items.length) {
      const currentItem = items[currentIndex];
      onLike?.(currentItem.id);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleSwipeLeft = () => {
    if (currentIndex < items.length) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleViewProfile = (userId: string) => {
    navigate(`/other-person-profile?userId=${userId}`);
  };

  if (currentIndex >= items.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <div className="text-4xl mb-4">📱</div>
        <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
        <p className="text-gray-600">No more friend items to review right now.</p>
      </div>
    );
  }

  const currentItem = items[currentIndex];

  console.log('🎯 MOBILE CAROUSEL DEBUG:', {
    currentIndex,
    itemsLength: items.length,
    currentItem,
    currentItemExists: !!currentItem,
    currentItemImage: currentItem?.image,
    currentItemTitle: currentItem?.title
  });

  return (
    <div className="flex flex-col h-full bg-red-500 border-4 border-red-700">
      <div className="text-white bg-red-700 p-2">
        DEBUGGING: Showing item {currentIndex + 1} of {items.length}
      </div>
      
      {/* Card container */}
      <div className="flex-1 relative bg-green-500 border-4 border-green-700 min-h-[400px]">
        <div className="text-white bg-green-700 p-2 absolute top-0 left-0 z-50">
          IMAGE CONTAINER
        </div>
        
        {/* Current card - just the image */}
        <div className="absolute inset-4 bg-blue-500 border-4 border-blue-700 rounded-xl shadow-lg overflow-hidden">
          <div className="text-white bg-blue-700 p-1 absolute top-0 left-0 z-50 text-xs">
            IMG: {currentItem.title}
          </div>
          <img
            src={currentItem.image}
            alt={currentItem.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.log('IMAGE ERROR:', e);
              e.currentTarget.src = '/placeholder.svg';
            }}
            onLoad={() => {
              console.log('IMAGE LOADED:', currentItem.image);
            }}
            style={{ 
              display: 'block',
              width: '100%', 
              height: '100%',
              backgroundColor: 'yellow'
            }}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-4 mt-4 p-4 bg-purple-500">
        <Button
          variant="outline"
          size="lg"
          onClick={handleSwipeLeft}
          className="w-16 h-16 rounded-full border-gray-200 hover:border-gray-300 hover:bg-gray-50"
        >
          <X className="w-6 h-6 text-gray-500" />
        </Button>
        <Button
          size="lg"
          onClick={handleSwipeRight}
          className="w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-600"
        >
          <Heart className="w-6 h-6 text-white" />
        </Button>
      </div>
    </div>
  );
};