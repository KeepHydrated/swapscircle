import { useState, useRef, useEffect } from "react";
import { Heart, X, Star } from "lucide-react";

interface AdvancedSwipeCardProps {
  children: React.ReactNode;
  onSwipe: (direction: "left" | "right" | "up") => void;
  onTap?: () => void;
  isTop: boolean;
  resetKey?: string | number; // Add a key to trigger reset
  style?: React.CSSProperties;
  className?: string;
}

export const AdvancedSwipeCard = ({ 
  children, 
  onSwipe, 
  onTap,
  isTop, 
  resetKey,
  style = {},
  className = ""
}: AdvancedSwipeCardProps) => {
  // ==================== STATE ====================
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchCurrent, setTouchCurrent] = useState<{ x: number; y: number } | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // ==================== TOUCH HANDLERS ====================
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isTop) return;
    
    // Don't handle swipe if touch started on a scrollable element
    const target = e.target as HTMLElement;
    if (target.closest('[data-scrollable="true"]')) {
      return;
    }
    
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setTouchCurrent({ x: touch.clientX, y: touch.clientY });
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || !isTop) return;
    
    const touch = e.touches[0];
    setTouchCurrent({ x: touch.clientX, y: touch.clientY });
    
    const deltaX = Math.abs(touch.clientX - touchStart.x);
    const deltaY = Math.abs(touch.clientY - touchStart.y);
    
    // Prevent default for horizontal swipes OR downward swipes
    if ((deltaX > deltaY && deltaX > 20) || (touch.clientY > touchStart.y && deltaY > 20)) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchCurrent || !isTop) {
      setIsSwiping(false);
      setTouchStart(null);
      setTouchCurrent(null);
      
      // If not swiping and onTap exists, this was a tap
      if (!isSwiping && onTap) {
        onTap();
      }
      return;
    }

    const deltaX = touchCurrent.x - touchStart.x;
    const deltaY = touchCurrent.y - touchStart.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    
    // Disable downward swipe (super like) - removed this feature
    
    // Check for horizontal swipe only
    if (absDeltaX > 80 && absDeltaX > absDeltaY * 1.2) {
      // Reset swipe state BEFORE triggering callback to prevent double-swipes
      setIsSwiping(false);
      setTouchStart(null);
      setTouchCurrent(null);
      
      if (deltaX > 0) {
        console.log('🔥 SWIPE CARD: Swiped right!');
        onSwipe("right");
      } else {
        console.log('🔥 SWIPE CARD: Swiped left!');
        onSwipe("left");
      }
    } else {
      // Reset swipe state
      setIsSwiping(false);
      setTouchStart(null);
      setTouchCurrent(null);
      
      // Not a strong enough swipe, check for tap
      if (onTap) {
        onTap();
      }
    }
  };

  // Reset card position when resetKey changes
  useEffect(() => {
    setTouchStart(null);
    setTouchCurrent(null);
    setIsSwiping(false);
  }, [resetKey]);

  // ==================== VISUAL FEEDBACK ====================
  // Calculate transform for swipe animation
  const getSwipeTransform = () => {
    if (!touchStart || !touchCurrent || !isSwiping) {
      return {
        transform: 'translate(0px, 0px) rotate(0deg)',
        transition: 'transform 0.3s ease-out',
      };
    }
    
    const deltaX = touchCurrent.x - touchStart.x;
    const deltaY = touchCurrent.y - touchStart.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    
    // Check if this is a downward swipe
    if (deltaY > 20 && absDeltaY > absDeltaX * 1.5) {
      return {
        transform: `translate(0px, ${deltaY}px) scale(${Math.max(0.8, 1 - deltaY / 500)})`,
        transition: 'none',
      };
    }
    
    // Only apply horizontal transform if this is clearly a horizontal swipe
    if (absDeltaX < 20 || absDeltaX <= absDeltaY * 1.5) {
      return {
        transform: 'translate(0px, 0px) rotate(0deg)',
        transition: 'transform 0.3s ease-out',
      };
    }
    
    const rotation = deltaX / 20; // Subtle rotation based on swipe

    return {
      transform: `translate(${deltaX}px, 0px) rotate(${rotation}deg)`,
      transition: 'none',
    };
  };

  // Calculate overlay opacity for visual feedback
  const getOverlayOpacity = () => {
    if (!touchStart || !touchCurrent || !isSwiping) return 0;
    const deltaX = touchCurrent.x - touchStart.x;
    const deltaY = touchCurrent.y - touchStart.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    
    // Check for downward swipe
    if (deltaY > 20 && absDeltaY > absDeltaX * 1.5) {
      return Math.min(deltaY / 150, 1);
    }
    
    // Only show overlay for clear horizontal swipes
    if (absDeltaX < 20 || absDeltaX <= absDeltaY * 1.5) return 0;
    
    return Math.min(absDeltaX / 150, 1);
  };

  return (
    <div
      ref={cardRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        ...style,
        ...getSwipeTransform(),
        zIndex: isTop ? 10 : 5,
      }}
      className={`absolute inset-0 select-none ${className}`}
    >
      <div className="w-full h-full relative">
        {/* Overlay feedback for left swipe */}
        <div 
          className="absolute inset-0 bg-dislike flex items-center justify-center rounded-lg z-20"
          style={{ 
            opacity: touchCurrent && touchStart && touchCurrent.x < touchStart.x ? getOverlayOpacity() : 0 
          }}
        >
          <span className="text-white text-4xl font-bold">✕</span>
        </div>
        
        {/* Overlay feedback for right swipe */}
        <div 
          className="absolute inset-0 bg-like flex items-center justify-center rounded-lg z-20"
          style={{ 
            opacity: touchCurrent && touchStart && touchCurrent.x > touchStart.x ? getOverlayOpacity() : 0 
          }}
        >
          <span className="text-white text-4xl font-bold">✓</span>
        </div>

        {/* Overlay feedback for down swipe (super like) */}
        <div 
          className="absolute inset-0 bg-superlike flex items-center justify-center rounded-lg z-20"
          style={{ 
            opacity: touchCurrent && touchStart && touchCurrent.y > touchStart.y ? getOverlayOpacity() : 0 
          }}
        >
          <span className="text-white text-4xl font-bold">⭐</span>
        </div>

        {children}
      </div>
    </div>
  );
};