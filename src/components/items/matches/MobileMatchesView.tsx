import React, { useState, useCallback, useEffect } from 'react';
import { MatchItem } from '@/types/item';
import { TinderSwipeCard } from '@/components/ui/tinder-swipe-card';
import { SwipeActionButtons } from '@/components/ui/swipe-action-buttons';
import { Heart, X, Users, Flag, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [expandedCard, setExpandedCard] = useState<MatchItem | null>(null);
  const { toast } = useToast();
  const location = useLocation();
  const isMobile = useIsMobile();

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

  const handleCardClick = (match: MatchItem) => {
    setExpandedCard(match);
  };

  const handleCloseExpanded = () => {
    setExpandedCard(null);
  };

  // Close expanded card when middle header icon is clicked on mobile home page
  useEffect(() => {
    const handleHeaderIconClick = (event: Event) => {
      // Check if we're on home page, mobile, and have an expanded card
      if (location.pathname === '/' && isMobile && expandedCard) {
        const target = event.target as HTMLElement;
        // Check if the clicked element is the ArrowLeftRight icon in the header
        if (target.closest('a[href="/"]') && target.closest('.absolute.left-1\\/2')) {
          event.preventDefault();
          setExpandedCard(null);
        }
      }
    };

    if (expandedCard && location.pathname === '/' && isMobile) {
      document.addEventListener('click', handleHeaderIconClick, true);
      return () => {
        document.removeEventListener('click', handleHeaderIconClick, true);
      };
    }
  }, [expandedCard, location.pathname, isMobile]);

  // Full-screen card view
  if (expandedCard) {
    return (
      <div className="fixed top-16 left-0 right-0 bottom-0 bg-background z-40 flex flex-col">
        {/* Close button */}
        <div className="absolute top-4 right-4 z-10">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleCloseExpanded}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full"
          >
            <X className="h-6 w-6 text-white" />
          </Button>
        </div>

        {/* Scrollable content including image */}
        <div className="flex-1 overflow-y-auto">
          {/* Large image */}
          <div className="w-full h-80 relative overflow-hidden">
            <img
              src={expandedCard.image}
              alt={expandedCard.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          </div>

          {/* Content section */}
          <div className="p-6 bg-card">
            {/* Title */}
            <h1 className="text-2xl font-bold text-foreground mb-2">{expandedCard.name}</h1>
          
          {/* Description */}
          <p className="text-muted-foreground text-base leading-relaxed mb-6">
            {expandedCard.description}
          </p>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <span className="text-sm text-muted-foreground">Category</span>
              <div className="text-lg font-semibold text-foreground">{expandedCard.category || 'N/A'}</div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Tag</span>
              <div className="text-lg font-semibold text-foreground">
                {expandedCard.tags && expandedCard.tags.length > 0 ? expandedCard.tags[0] : 'N/A'}
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Condition</span>
              <div className="text-lg font-semibold text-foreground">{expandedCard.condition || 'N/A'}</div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Price Range</span>
              <div className="text-lg font-semibold text-foreground">
                {expandedCard.priceRangeMin && expandedCard.priceRangeMax 
                  ? `$${expandedCard.priceRangeMin} - $${expandedCard.priceRangeMax}`
                  : 'Price not set'
                }
              </div>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="pt-4 border-t border-border">
            {expandedCard.userProfile && (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center">
                  {expandedCard.userProfile.avatar_url ? (
                    <img
                      src={expandedCard.userProfile.avatar_url}
                      alt={expandedCard.userProfile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary text-primary-foreground text-lg font-semibold flex items-center justify-center">
                      {expandedCard.userProfile.name?.substring(0, 1).toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      {expandedCard.userProfile.username || expandedCard.userProfile.name}
                    </h3>
                    <span className="text-yellow-500">★</span>
                    <span className="text-muted-foreground">No reviews</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
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

          {/* Action buttons */}
          <div className="flex gap-4 mt-6">
            <Button 
              onClick={() => { onReject(expandedCard.id); handleCloseExpanded(); }}
              variant="outline"
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Pass
            </Button>
            <Button 
              onClick={() => { onLike(expandedCard.id); handleCloseExpanded(); }}
              variant="default"
              className="flex-1"
            >
              <Heart className="h-4 w-4 mr-2" />
              Like
            </Button>
          </div>
          </div>
        </div>
      </div>
    );
  }

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
        {matches.slice(currentIndex, currentIndex + 3).map((match, index) => (
          <TinderSwipeCard
            key={match.id}
            onSwipe={handleSwipe}
            isTop={index === 0}
            style={{
              transform: `scale(${1 - index * 0.05}) translateY(${index * 8}px)`,
              opacity: 1 - index * 0.2,
            }}
          >
            <div 
              className="w-full h-full bg-card rounded-3xl shadow-card overflow-hidden flex flex-col cursor-pointer"
              onClick={() => handleCardClick(match)}
            >
              {/* Item Image */}
              <div className="w-full h-2/5 relative overflow-hidden">
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
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4 text-white" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onLike(match.id, true); setCurrentIndex(prev => prev + 1); }}>
                        <Users className="h-4 w-4 mr-2 text-green-600" />
                        Accept for all of my items
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onReject(match.id, true); setCurrentIndex(prev => prev + 1); }}>
                        <Users className="h-4 w-4 mr-2 text-red-600" />
                        Reject for all of my items
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onReport(match.id); }} className="text-red-600">
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
                <h2 className="text-lg font-bold text-foreground mb-4">{match.name}</h2>

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
                        <div>
                          <h3 className="text-sm font-semibold text-foreground mb-1">
                            {match.userProfile.username || match.userProfile.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-500 text-xs">★</span>
                            <span className="text-muted-foreground text-xs">No reviews</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TinderSwipeCard>
        ))}
      </div>
    </div>
  );
};