import React, { useState, useCallback } from 'react';
import { MatchItem } from '@/types/item';
import { TinderSwipeCard } from '@/components/ui/tinder-swipe-card';
import { SwipeActionButtons } from '@/components/ui/swipe-action-buttons';
import { Heart, X, Users, Flag, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

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
  const [isAnimating, setIsAnimating] = useState(false);
  const { toast } = useToast();

  const handleSwipe = useCallback((direction: "left" | "right" | "up") => {
    if (currentIndex >= matches.length || isAnimating) return;

    setIsAnimating(true);
    const currentMatch = matches[currentIndex];

    if (direction === "left") {
      onReject(currentMatch.id);
      toast({
        title: `Passed on ${currentMatch.name}`,
        duration: 2000,
      });
    } else if (direction === "right") {
      onLike(currentMatch.id);
      toast({
        title: `Liked ${currentMatch.name}! 💖`,
        duration: 2000,
      });
    } else if (direction === "up") {
      onLike(currentMatch.id);
      toast({
        title: `Super liked ${currentMatch.name}! ⭐`,
        duration: 2000,
      });
    }

    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setIsAnimating(false);
    }, 300);
  }, [currentIndex, matches, isAnimating, onLike, onReject, toast]);

  const handleButtonAction = (action: "like" | "dislike" | "superlike") => {
    const directionMap = {
      like: "right" as const,
      dislike: "left" as const,
      superlike: "up" as const,
    };
    handleSwipe(directionMap[action]);
  };


  if (currentIndex >= matches.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <div className="w-32 h-32 bg-gradient-primary rounded-full flex items-center justify-center mb-6 animate-bounce-in">
          <span className="text-4xl">🎉</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">All caught up!</h2>
        <p className="text-muted-foreground mb-6">
          No more matches to review right now. Check back later for more!
        </p>
      </div>
    );
  }

  const currentMatch = matches[currentIndex];

  return (
    <div className="flex flex-col h-full max-w-sm mx-auto p-4">
      <div className="relative h-[280px] mb-6">
        {matches.slice(currentIndex, currentIndex + 3).map((match, index) => {
          return (
          <TinderSwipeCard
            key={match.id}
            onSwipe={handleSwipe}
            isTop={index === 0}
            style={{
              transform: `scale(${1 - index * 0.05}) translateY(${index * 8}px)`,
              opacity: 1 - index * 0.2,
            }}
          >
            <div className="w-full h-full bg-card rounded-3xl shadow-card overflow-hidden flex flex-col">
              {/* Item Image */}
              <div className="w-full h-1/3 relative overflow-hidden">
                <img
                  src={match.image}
                  alt={match.name}
                  className="w-full h-full object-cover"
                  draggable={false}
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
                
                {/* Action Menu */}
                <div className="absolute top-4 right-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm">
                        <MoreVertical className="h-4 w-4 text-white" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { onLike(match.id, true); setCurrentIndex(prev => prev + 1); }}>
                        <Users className="h-4 w-4 mr-2 text-green-600" />
                        Accept for all of my items
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { onReject(match.id, true); setCurrentIndex(prev => prev + 1); }}>
                        <Users className="h-4 w-4 mr-2 text-red-600" />
                        Reject for all of my items
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onReport(match.id)} className="text-red-600">
                        <Flag className="h-4 w-4 mr-2" />
                        Report item
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Combined Content Section */}
              <div className="flex-1 p-4 bg-card overflow-y-auto">
                {/* Item Title */}
                <h2 className="text-lg font-bold text-foreground mb-2">{match.name}</h2>
                
                {/* Description */}
                <p className="text-muted-foreground text-xs leading-relaxed mb-3">
                  {match.description}
                </p>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <span className="text-xs text-muted-foreground">Category</span>
                    <div className="text-sm font-semibold text-foreground">{match.category || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Tag</span>
                    <div className="text-sm font-semibold text-foreground">
                      {match.tags && match.tags.length > 0 ? match.tags[0] : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Condition</span>
                    <div className="text-sm font-semibold text-foreground">{match.condition || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Price Range</span>
                    <div className="text-sm font-semibold text-foreground">
                      {match.priceRangeMin && match.priceRangeMax 
                        ? `$${match.priceRangeMin} - $${match.priceRangeMax}`
                        : 'Price not set'
                      }
                    </div>
                  </div>
                </div>

                {/* User Profile Section */}
                <div className="pt-3 border-t border-border">
                  {match.userProfile && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                        {match.userProfile.avatar_url ? (
                          <img
                            src={match.userProfile.avatar_url}
                            alt={match.userProfile.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center">
                            {match.userProfile.name?.substring(0, 1).toUpperCase() || "U"}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-foreground">
                            {match.userProfile.username || match.userProfile.name}
                          </h3>
                          <span className="text-yellow-500 text-xs">★</span>
                          <span className="text-muted-foreground text-xs">No reviews</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <div>Since 2024</div>
                          <div className="flex items-center gap-1">
                            <span>🔄</span>
                            <span>0 trades completed</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TinderSwipeCard>
        )}
        )}
      </div>

      <SwipeActionButtons
        onDislike={() => handleButtonAction("dislike")}
        onSuperLike={() => handleButtonAction("superlike")}
        onLike={() => handleButtonAction("like")}
        disabled={isAnimating}
      />

    </div>
  );
};