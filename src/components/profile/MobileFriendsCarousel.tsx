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

  return (
    <div className="flex flex-col h-full p-4">
      {/* Progress indicator */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            {currentIndex + 1} of {items.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card stack */}
      <div className="flex-1 relative">
        {/* Show next card behind current one */}
        {currentIndex + 1 < items.length && (
          <div className="absolute inset-0 transform scale-95 opacity-50 z-0">
            <div className="bg-white rounded-xl shadow-lg h-full">
              <img
                src={items[currentIndex + 1].image}
                alt={items[currentIndex + 1].title}
                className="w-full h-48 object-cover rounded-t-xl"
              />
            </div>
          </div>
        )}

        {/* Current card */}
        <SwipeCard
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          className="absolute inset-0 z-10"
        >
          <div className="bg-white rounded-xl shadow-lg h-full overflow-hidden">
            <div className="relative">
              <img
                src={currentItem.image}
                alt={currentItem.title}
                className="w-full h-48 object-cover"
              />
              {currentItem.distance && (
                <Badge className="absolute top-2 right-2 bg-white/90 text-gray-800">
                  {currentItem.distance}
                </Badge>
              )}
            </div>
            
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-semibold text-lg mb-1">{currentItem.title}</h3>
              <p className="text-gray-600 text-sm mb-2">{currentItem.description}</p>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <img
                    src={currentItem.user.avatar_url || '/placeholder.svg'}
                    alt={currentItem.user.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm text-gray-700">{currentItem.user.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewProfile(currentItem.user.id)}
                  className="text-blue-600 hover:text-blue-700 p-1"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>

              <div className="text-sm text-gray-500 mb-4">
                Condition: {currentItem.condition} • Category: {currentItem.category}
              </div>

              <div className="text-center text-gray-500 text-sm">
                Swipe right to like, left to pass
              </div>
            </div>
          </div>
        </SwipeCard>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-4 mt-4">
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