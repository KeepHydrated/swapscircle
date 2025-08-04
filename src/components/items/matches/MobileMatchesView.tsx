import React, { useState } from 'react';
import { MatchItem } from '@/types/item';
import { SwipeCard } from '@/components/ui/swipe-card';
import { Heart, X, Users, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface MobileMatchesViewProps {
  matches: MatchItem[];
  likedItems: Record<string, boolean>;
  onLike: (id: string, global?: boolean) => void;
  onReject: (id: string, global?: boolean) => void;
  onReport: (id: string) => void;
  onOpenModal: (id: string) => void;
}

export const MobileMatchesView: React.FC<MobileMatchesViewProps> = ({
  matches,
  likedItems,
  onLike,
  onReject,
  onReport,
  onOpenModal
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipeRight = () => {
    console.log('📱 MOBILE: handleSwipeRight called, currentIndex:', currentIndex);
    console.log('📱 MOBILE: current match:', matches[currentIndex]?.id);
    if (currentIndex < matches.length) {
      console.log('📱 MOBILE: calling onLike with id:', matches[currentIndex].id);
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

      {/* Card stack */}
      <div className="flex-1 relative min-h-[500px]">
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
          <div 
            className="bg-white rounded-xl shadow-lg h-full overflow-hidden flex flex-col cursor-pointer"
            onClick={() => {
              console.log('🔍 MOBILE CARD: Card clicked!', currentMatch.id);
              onOpenModal(currentMatch.id);
            }}
          >
            <div className="relative flex-shrink-0">
              <img
                src={currentMatch.image}
                alt={currentMatch.name}
                className="w-full h-64 object-cover block"
                onError={(e) => {
                  console.log('Image failed to load:', currentMatch.image);
                  e.currentTarget.src = '/placeholder.svg';
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', currentMatch.image);
                }}
                style={{ display: 'block', width: '100%', height: '256px' }}
              />
            </div>
            
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-semibold text-lg mb-1">{currentMatch.name}</h3>
              <p className="text-gray-600 text-sm mb-3">{currentMatch.description}</p>
              
              {/* Item details grid */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <div className="text-sm font-medium text-gray-800">{currentMatch.category || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">N/A</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">{currentMatch.condition || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">
                    {currentMatch.priceRangeMin || currentMatch.priceRangeMax 
                      ? `$${currentMatch.priceRangeMin || 0} - $${currentMatch.priceRangeMax || 0}`
                      : 'Not specified'
                    }
                  </div>
                </div>
              </div>
              
              {currentMatch.userProfile && (
                <div className="flex items-center gap-2 mt-4">
                  <img
                    src={currentMatch.userProfile.avatar_url || '/placeholder.svg'}
                    alt={currentMatch.userProfile.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm text-gray-700">{currentMatch.userProfile.name}</span>
                  <div className="flex items-center gap-1 ml-2">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm text-gray-600">4.5</span>
                  </div>
                </div>
              )}

            </div>
          </div>
        </SwipeCard>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 justify-center mt-4">
        {/* More options menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="lg" className="px-4">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-56 bg-white border border-gray-200 shadow-lg z-50">
            <DropdownMenuItem onClick={() => { onLike(currentMatch.id, true); setCurrentIndex(prev => prev + 1); }} className="cursor-pointer">
              <Users className="h-4 w-4 mr-2 text-green-600" />
              Accept for all items
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { onReject(currentMatch.id, true); setCurrentIndex(prev => prev + 1); }} className="cursor-pointer">
              <Users className="h-4 w-4 mr-2 text-red-600" />
              Reject for all items
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onReport(currentMatch.id)} className="cursor-pointer text-red-600">
              <Flag className="h-4 w-4 mr-2" />
              Report item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Simple reject button */}
        <Button variant="outline" size="lg" className="flex-1 max-w-32" onClick={() => { onReject(currentMatch.id, false); setCurrentIndex(prev => prev + 1); }}>
          <X className="h-5 w-5 mr-2" />
          Pass
        </Button>

        {/* Simple like button */}
        <Button variant="default" size="lg" className="flex-1 max-w-32" onClick={() => { onLike(currentMatch.id, false); setCurrentIndex(prev => prev + 1); }}>
          <Heart className="h-5 w-5 mr-2" />
          Like
        </Button>
      </div>

    </div>
  );
};