import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MatchItem } from '@/types/item';
import { AdvancedSwipeCard } from '@/components/ui/advanced-swipe-card';
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
  console.log('🔥 MOBILE MATCHES VIEW COMPONENT LOADED', { matchesCount: matches.length });
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [expandedCard, setExpandedCard] = useState<MatchItem | null>(null);
  const [expandedCardIndex, setExpandedCardIndex] = useState(0);
  const swipeAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const location = useLocation();
  const isMobile = useIsMobile();

  const handleSwipe = useCallback((direction: "left" | "right" | "up") => {
    console.log('🔥 MOBILE MATCHES: Swipe detected', { direction, currentIndex, isAnimating });
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
    const matchIndex = matches.findIndex(m => m.id === match.id);
    setExpandedCard(match);
    setExpandedCardIndex(matchIndex);
  };

  const handleCloseExpanded = () => {
    setExpandedCard(null);
  };

  const handlePopupSwipe = useCallback((direction: "left" | "right" | "up") => {
    if (!expandedCard || isAnimating) return;

    setIsAnimating(true);
    
    if (direction === "left") {
      onReject(expandedCard.id);
      toast({
        title: `Passed on ${expandedCard.name}`,
        duration: 2000,
      });
    } else if (direction === "right") {
      onLike(expandedCard.id);
      toast({
        title: `Liked ${expandedCard.name}! 💖`,
        duration: 2000,
      });
    } else if (direction === "up") {
      onLike(expandedCard.id);
      toast({
        title: `Super liked ${expandedCard.name}! ⭐`,
        duration: 2000,
      });
    }

    // Move to next card in popup - increased timeout to match exit animation
    setTimeout(() => {
      const nextIndex = expandedCardIndex + 1;
      if (nextIndex < matches.length) {
        setExpandedCard(matches[nextIndex]);
        setExpandedCardIndex(nextIndex);
      } else {
        // No more cards, close popup
        setExpandedCard(null);
      }
      setIsAnimating(false);
    }, 200); // Increased from 300ms to allow for exit animation
  }, [expandedCard, expandedCardIndex, matches, isAnimating, onLike, onReject, toast]);

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
        {/* Action Menu - Outside of swipe card to avoid touch conflicts */}
        <div className="absolute top-4 right-4 z-50 pointer-events-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center justify-center w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg transition-all duration-200 hover:scale-110"
              >
                <MoreVertical className="h-6 w-6 text-gray-700" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 shadow-lg z-[100]">
              <DropdownMenuItem 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onLike(expandedCard.id, true);
                  setTimeout(() => {
                    const nextIndex = expandedCardIndex + 1;
                    if (nextIndex < matches.length) {
                      setExpandedCard(matches[nextIndex]);
                      setExpandedCardIndex(nextIndex);
                    } else {
                      setExpandedCard(null);
                    }
                  }, 100);
                }}
                className="cursor-pointer"
              >
                <Users className="h-4 w-4 mr-2 text-green-600" />
                Accept for all of my items
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onReject(expandedCard.id, true);
                  setTimeout(() => {
                    const nextIndex = expandedCardIndex + 1;
                    if (nextIndex < matches.length) {
                      setExpandedCard(matches[nextIndex]);
                      setExpandedCardIndex(nextIndex);
                    } else {
                      setExpandedCard(null);
                    }
                  }, 100);
                }}
                className="cursor-pointer"
              >
                <Users className="h-4 w-4 mr-2 text-red-600" />
                Reject for all of my items
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onReport(expandedCard.id); 
                }} 
                className="cursor-pointer text-red-600"
              >
                <Flag className="h-4 w-4 mr-2" />
                Report item
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  handleCloseExpanded();
                }} 
                className="cursor-pointer"
              >
                <X className="h-4 w-4 mr-2" />
                Close
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Swipeable Image Section - Fixed at top */}
        <div className="w-full h-80 relative overflow-hidden flex-shrink-0">
          <AdvancedSwipeCard
            onSwipe={handlePopupSwipe}
            isTop={true}
            resetKey={expandedCard.id}
            className="w-full h-full"
          >
            <div className="w-full h-full">
              <img
                src={expandedCard.image}
                alt={expandedCard.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            </div>
          </AdvancedSwipeCard>
        </div>

        {/* Scrollable Content Section */}
        <div className="flex-1 overflow-y-auto overscroll-contain bg-card" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="p-6">
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
            <div className="pt-4 border-t border-border mb-6">
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
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {expandedCard.userProfile.username || expandedCard.userProfile.name}
                      </h3>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-muted-foreground">No reviews</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 mt-6 pb-8">
              <Button 
                onClick={() => handlePopupSwipe("left")}
                variant="outline"
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Pass
              </Button>
              <Button 
                onClick={() => handlePopupSwipe("right")}
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
      <div className="relative h-[450px] mb-6">{/* Increased height from 320px to 450px */}
        {matches.slice(currentIndex, currentIndex + 3).map((match, index) => (
          <div
            key={match.id}
            className="absolute inset-0"
            style={{
              transform: `scale(${1 - index * 0.05}) translateY(${index * 8}px)`,
              opacity: 1 - index * 0.2,
              zIndex: 10 - index,
            }}
          >
            <AdvancedSwipeCard
              onSwipe={handleSwipe}
              onTap={() => handleCardClick(match)}
              isTop={index === 0}
              className="w-full h-full cursor-pointer"
            >
              <div className="w-full h-full bg-card rounded-3xl shadow-card overflow-hidden flex flex-col">
               {/* Item Image - Fixed Height */}
               <div className="w-full h-48 relative overflow-hidden">{/* Fixed height instead of h-1/2 */}
                <img
                  src={match.image}
                  alt={match.name}
                  className="w-full h-full object-cover"
                  draggable={false}
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                 />
                 
                 {/* Action Menu - Mobile Optimized */}
                 <div className="absolute top-4 right-4 z-20">
                   <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                       <button
                         className="flex items-center justify-center w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg transition-all duration-200 hover:scale-110"
                         onClick={(e) => {
                           e.stopPropagation();
                           e.preventDefault();
                         }}
                         onTouchEnd={(e) => {
                           e.stopPropagation();
                         }}
                       >
                         <MoreVertical className="h-5 w-5 text-gray-700" />
                       </button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="start" className="w-56 bg-white border border-gray-200 shadow-lg z-[100]">
                       <DropdownMenuItem 
                         onClick={(e) => { 
                           e.stopPropagation(); 
                           onLike(match.id, true); 
                           setTimeout(() => setCurrentIndex(prev => prev + 1), 100);
                         }}
                         className="cursor-pointer"
                       >
                         <Users className="h-4 w-4 mr-2 text-green-600" />
                         Accept for all of my items
                       </DropdownMenuItem>
                       <DropdownMenuItem 
                         onClick={(e) => { 
                           e.stopPropagation(); 
                           onReject(match.id, true); 
                           setTimeout(() => setCurrentIndex(prev => prev + 1), 100);
                         }}
                         className="cursor-pointer"
                       >
                         <Users className="h-4 w-4 mr-2 text-red-600" />
                         Reject for all of my items
                       </DropdownMenuItem>
                       <DropdownMenuItem 
                         onClick={(e) => { 
                           e.stopPropagation(); 
                           onReport(match.id); 
                         }} 
                         className="cursor-pointer text-red-600"
                       >
                         <Flag className="h-4 w-4 mr-2" />
                         Report item
                       </DropdownMenuItem>
                     </DropdownMenuContent>
                   </DropdownMenu>
                 </div>
               </div>

               {/* Combined Content Section - Scrollable with visible scrollbar */}
               <div className="flex-1 bg-card overflow-y-auto" style={{ minHeight: "200px" }}>
                 <div className="p-4 space-y-4" style={{ paddingBottom: "80px" }}>{/* Extra padding to make scrolling obvious */}
                  {/* Item Title - with proper text wrapping */}
                  <div>
                    <h2 className="text-base font-bold text-foreground leading-tight line-clamp-2 break-words">
                      {match.name}
                    </h2>
                  </div>

                  {/* Item Description */}
                  {match.description && (
                    <div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {match.description}
                      </p>
                    </div>
                  )}

                  {/* Item Details */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {match.category && (
                      <div>
                        <span className="text-muted-foreground">Category</span>
                        <div className="font-semibold text-foreground">{match.category}</div>
                      </div>
                    )}
                    {match.condition && (
                      <div>
                        <span className="text-muted-foreground">Condition</span>
                        <div className="font-semibold text-foreground">{match.condition}</div>
                      </div>
                    )}
                  </div>

                  {/* User Profile Section */}
                  <div className="pt-3 border-t border-border">
                    {match.userProfile && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
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
                        <div className="flex-1 min-w-0">
                          <div>
                            <h3 className="text-sm font-semibold text-foreground mb-1 truncate">
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
             </div>
            </AdvancedSwipeCard>
           </div>
        ))}
      </div>
    </div>
  );
};