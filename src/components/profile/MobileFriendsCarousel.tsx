import React, { useState, useEffect } from 'react';
import { SwipeCard } from '@/components/ui/swipe-card';
import { Heart, X, ExternalLink, ArrowLeft } from 'lucide-react';
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
  onBackNavigation?: (currentIndex: number, canGoBack: boolean) => void;
  externalBackTrigger?: number; // Increment this to trigger back navigation
  onBackButtonRegister?: (backFunction: () => void) => void; // Register the back function with parent
}

export const MobileFriendsCarousel: React.FC<MobileFriendsCarouselProps> = ({
  items,
  onLike,
  onBackNavigation,
  externalBackTrigger,
  onBackButtonRegister
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const navigate = useNavigate();

  // Temporarily disable browser back button detection to debug
  useEffect(() => {
    console.log('🚫 BROWSER BACK BUTTON DETECTION DISABLED FOR DEBUGGING');
    // const handlePopState = (event: PopStateEvent) => {
    //   console.log('🔙 BROWSER BACK BUTTON DETECTED');
    //   event.preventDefault();
    //   handleGoBack();
    //   // Push state back to prevent actual navigation
    //   window.history.pushState(null, '', window.location.href);
    // };

    // // Push initial state to enable back button detection
    // window.history.pushState(null, '', window.location.href);
    // window.addEventListener('popstate', handlePopState);

    // return () => {
    //   window.removeEventListener('popstate', handlePopState);
    // };
  }, [currentIndex]);

  // Debug current state
  useEffect(() => {
    console.log('🎯 CAROUSEL STATE CHANGED:', { 
      currentIndex, 
      totalItems: items.length, 
      canGoBack: currentIndex > 0 
    });
  }, [currentIndex, items.length]);

  const handleSwipeRight = () => {
    console.log('❤️ LIKE BUTTON CLICKED - Current Index:', currentIndex, 'Total Items:', items.length);
    if (currentIndex < items.length) {
      const currentItem = items[currentIndex];
      console.log('❤️ Liking item:', currentItem.id, currentItem.title);
      onLike?.(currentItem.id);
      const newIndex = currentIndex + 1;
      console.log('❤️ Advancing to next item, index:', newIndex);
      setCurrentIndex(newIndex);
    } else {
      console.log('❤️ Cannot advance - at end of items');
    }
  };

  const handleSwipeLeft = () => {
    console.log('❌ REJECT BUTTON CLICKED - Current Index:', currentIndex, 'Total Items:', items.length);
    if (currentIndex < items.length) {
      const currentItem = items[currentIndex];
      console.log('❌ Rejecting item:', currentItem.id, currentItem.title);
      const newIndex = currentIndex + 1;
      console.log('❌ Advancing to next item, index:', newIndex);
      setCurrentIndex(newIndex);
    } else {
      console.log('❌ Cannot advance - at end of items');
    }
  };

  const handleGoBack = () => {
    console.log('🔙 BACK BUTTON PRESSED - Current Index:', currentIndex);
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      console.log('🔙 Moving back to index:', newIndex);
      setCurrentIndex(newIndex);
    } else {
      console.log('🔙 Cannot go back - already at first item');
    }
  };

  // Notify parent about navigation state changes
  useEffect(() => {
    onBackNavigation?.(currentIndex, currentIndex > 0);
  }, [currentIndex, onBackNavigation]);

  // Handle external back button trigger
  useEffect(() => {
    if (externalBackTrigger && externalBackTrigger > 0) {
      handleGoBack();
    }
  }, [externalBackTrigger]);

  // Register the back function with parent component
  useEffect(() => {
    onBackButtonRegister?.(handleGoBack);
  }, [onBackButtonRegister, handleGoBack]);

  const handleViewProfile = (userId: string) => {
    navigate(`/other-person-profile?userId=${userId}`);
  };

  // Touch/swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setTouchStartX(e.touches[0].clientX);
    setSwipeOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const offset = currentX - touchStartX;
    
    setSwipeOffset(Math.max(-150, Math.min(150, offset)));
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    if (Math.abs(swipeOffset) > 75) {
      if (swipeOffset > 0) {
        handleSwipeRight(); // Swipe right for approval
      } else {
        handleSwipeLeft(); // Swipe left for rejection
      }
    }
    
    setSwipeOffset(0);
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

  // Force re-render by adding key
  console.log('🔄 COMPONENT RE-RENDER:', { currentIndex, currentItemId: currentItem?.id, timestamp: Date.now() });

  return (
    <div className="flex flex-col h-full" key={`carousel-${currentIndex}-${Date.now()}`}>
      {/* Debug header showing current item */}
      <div className="bg-yellow-300 p-2 text-black text-center text-sm font-bold">
        🎯 LIVE DEBUG: Item {currentIndex + 1} of {items.length} | Index: {currentIndex} | ID: {currentItem?.id?.slice(-8)} | Title: {currentItem?.title} | Time: {new Date().getSeconds()}
      </div>
      
      {/* Card container */}
      <div className="flex-1 relative min-h-[400px]">
        {/* Current card - just the image */}
        <div 
          className="absolute inset-4 bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-150"
          style={{ 
            transform: `translateX(${swipeOffset}px) rotate(${swipeOffset * 0.1}deg)`,
            opacity: isDragging ? 0.9 : 1
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={currentItem.image}
            alt={currentItem.title}
            className="w-full h-full object-cover pointer-events-none"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          
          {/* Swipe indicator overlays */}
          {isDragging && swipeOffset > 50 && (
            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
              <Heart className="w-16 h-16 text-green-500" />
            </div>
          )}
          {isDragging && swipeOffset < -50 && (
            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
              <X className="w-16 h-16 text-red-500" />
            </div>
          )}
          
          {/* Action buttons overlaid on image */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4">
            {/* Reject button */}
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                console.log('❌ REJECT BUTTON ELEMENT CLICKED!');
                e.preventDefault();
                e.stopPropagation();
                handleSwipeLeft();
              }}
              className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:bg-white"
            >
              <X className="w-6 h-6 text-gray-600" />
            </Button>
            
            {/* Like button */}
            <Button
              size="icon"
              onClick={(e) => {
                console.log('❤️ LIKE BUTTON ELEMENT CLICKED!');
                e.preventDefault();
                e.stopPropagation();
                handleSwipeRight();
              }}
              className="w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg border-0"
            >
              <Heart className="w-6 h-6 text-white" />
            </Button>
          </div>
        </div>
      </div>

      {/* Item title and description */}
      <div className="px-6 py-3 text-center">
        <h3 className="text-lg font-semibold mb-2 text-black">{currentItem.title}</h3>
        <p className="text-sm text-black font-medium mb-2">{currentItem.description}</p>
        
        {/* Categories grid */}
        <div className="grid grid-cols-2 gap-2 text-xs text-black">
          <div className="text-left">
            <div className="font-medium">{currentItem.category}</div>
            <div>{currentItem.condition}</div>
          </div>
          <div className="text-right">
            <div className="font-medium">Casual Wear</div>
            <div>$250 - $500</div>
          </div>
        </div>
      </div>
    </div>
  );
};