import React, { useState } from 'react';
import { MatchItem } from '@/types/item';
import { SwipeCard } from '@/components/ui/swipe-card';
import { Heart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MobileMatchesViewProps {
  matches: MatchItem[];
  likedItems: Record<string, boolean>;
  onLike: (id: string) => void;
  onReject: (id: string) => void;
  onOpenModal: (id: string) => void;
}

export const MobileMatchesView: React.FC<MobileMatchesViewProps> = ({
  matches,
  likedItems,
  onLike,
  onReject,
  onOpenModal
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipeRight = () => {
    if (currentIndex < matches.length) {
      onLike(matches[currentIndex].id);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleSwipeLeft = () => {
    if (currentIndex < matches.length) {
      onReject(matches[currentIndex].id);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleLikeClick = () => {
    handleSwipeRight();
  };

  const handleRejectClick = () => {
    handleSwipeLeft();
  };

  if (currentIndex >= matches.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <div className="text-4xl mb-4">🎉</div>
        <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
        <p className="text-gray-600">No more matches to review right now.</p>
      </div>
    );
  }

  const currentMatch = matches[currentIndex];

  return (
    <div className="flex flex-col h-full p-4">
      {/* Progress indicator */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            {currentIndex + 1} of {matches.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / matches.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card stack */}
      <div className="flex-1 relative">
        {/* Show next card behind current one */}
        {currentIndex + 1 < matches.length && (
          <div className="absolute inset-0 transform scale-95 opacity-50 z-0">
            <div className="bg-white rounded-xl shadow-lg h-full">
              <img
                src={matches[currentIndex + 1].image}
                alt={matches[currentIndex + 1].name}
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
                src={currentMatch.image}
                alt={currentMatch.name}
                className="w-full h-48 object-cover"
                onClick={() => onOpenModal(currentMatch.id)}
              />
            </div>
            
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-semibold text-lg mb-1">{currentMatch.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{currentMatch.description}</p>
              
              {currentMatch.userProfile && (
                <div className="flex items-center gap-2 mb-3">
                  <img
                    src={currentMatch.userProfile.avatar_url || '/placeholder.svg'}
                    alt={currentMatch.userProfile.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm text-gray-700">{currentMatch.userProfile.name}</span>
                </div>
              )}

              <div className="text-sm text-gray-500 mb-4">
                Condition: {currentMatch.condition} • Category: {currentMatch.category}
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
          onClick={handleRejectClick}
          className="w-16 h-16 rounded-full border-red-200 hover:border-red-300 hover:bg-red-50"
        >
          <X className="w-6 h-6 text-red-500" />
        </Button>
        <Button
          size="lg"
          onClick={handleLikeClick}
          className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600"
        >
          <Heart className="w-6 h-6 text-white" />
        </Button>
      </div>
    </div>
  );
};