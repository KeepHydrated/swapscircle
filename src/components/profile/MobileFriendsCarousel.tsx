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
    <div className="flex flex-col h-full">
      {/* Card container */}
      <div className="flex-1 relative min-h-[400px]">
        {/* Current card - just the image */}
        <div className="absolute inset-4 bg-white rounded-xl shadow-lg overflow-hidden">
          <img
            src={currentItem.image}
            alt={currentItem.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          
          {/* Action buttons overlaid on image */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwipeLeft}
              className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:bg-white"
            >
              <X className="w-6 h-6 text-gray-600" />
            </Button>
            <Button
              size="icon"
              onClick={handleSwipeRight}
              className="w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg border-0"
            >
              <Heart className="w-6 h-6 text-white" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};