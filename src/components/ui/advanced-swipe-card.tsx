import { useState, useRef, useEffect } from "react";
import { Heart, X, Star } from "lucide-react";

interface AdvancedSwipeCardProps {
  children: React.ReactNode;
  onSwipe: (direction: "left" | "right" | "up") => void;
  onTap?: () => void;
  isTop: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const AdvancedSwipeCard = ({ 
  children, 
  onSwipe, 
  onTap,
  isTop, 
  style = {},
  className = ""
}: AdvancedSwipeCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragDistance, setDragDistance] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const lastMoveTime = useRef(0);

  const handleStart = (clientX: number, clientY: number) => {
    if (!isTop) return;
    startPos.current = { x: clientX, y: clientY };
    setIsScrolling(false);
    lastMoveTime.current = Date.now();
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isTop || isScrolling) return;
    
    const deltaX = clientX - startPos.current.x;
    const deltaY = clientY - startPos.current.y;
    const deltaXAbs = Math.abs(deltaX);
    const deltaYAbs = Math.abs(deltaY);
    
    // If movement is primarily vertical and significant, treat as scroll
    if (deltaYAbs > deltaXAbs && deltaYAbs > 10) {
      setIsScrolling(true);
      return;
    }
    
    // Only start dragging if movement is primarily horizontal
    if (deltaXAbs > 10 && deltaXAbs > deltaYAbs) {
      setIsDragging(true);
      setDragDistance({ x: deltaX, y: deltaY });
      setRotation(0);
    }
  };

  const handleEnd = () => {
    if (!isDragging || !isTop || isScrolling) {
      // If not dragging and onTap exists, this was a tap
      if (!isDragging && !isScrolling && onTap) {
        onTap();
      }
      setIsDragging(false);
      setIsScrolling(false);
      setDragDistance({ x: 0, y: 0 });
      setRotation(0);
      return;
    }
    
    setIsDragging(false);
    const threshold = 100;
    
    if (Math.abs(dragDistance.x) > threshold) {
      onSwipe(dragDistance.x > 0 ? "right" : "left");
    } else if (dragDistance.y < -threshold) {
      onSwipe("up");
    } else {
      // Reset position if swipe wasn't strong enough
      setDragDistance({ x: 0, y: 0 });
      setRotation(0);
      // This was a tap
      if (onTap) {
        onTap();
      }
    }
    
    setIsScrolling(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent swipe on mouse for better desktop experience
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    // Disabled for better desktop experience
  };

  const handleMouseUp = () => {
    // Disabled for better desktop experience
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    console.log('🔥 SWIPE: Touch start detected', { isTop });
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
    
    // Allow scrolling by default - only prevent if we're actually swiping horizontally
    if (isDragging && !isScrolling && Math.abs(dragDistance.x) > 20) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  useEffect(() => {
    // Removed mouse event listeners for better desktop scrolling
  }, [isDragging]);

  const getSwipeOpacity = () => {
    const opacity = Math.abs(dragDistance.x) / 150;
    return Math.min(opacity, 0.8);
  };

  const transform = `translate(${dragDistance.x}px, ${dragDistance.y}px)`;

  return (
    <div
      ref={cardRef}
      className={`absolute inset-0 select-none cursor-grab ${isDragging ? "cursor-grabbing" : ""} ${className}`}
      style={{
        ...style,
        transform,
        zIndex: isTop ? 10 : 5,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="w-full h-full relative">
        {/* Swipe Indicators */}
        {isDragging && (
          <>
            <div
              className="absolute top-8 left-8 z-20 border-4 border-like rounded-xl px-4 py-2 bg-like/10 backdrop-blur-sm"
              style={{
                opacity: dragDistance.x > 50 ? getSwipeOpacity() : 0,
                transform: `rotate(-20deg)`,
              }}
            >
              <span className="text-like font-bold text-xl">LIKE</span>
            </div>

            <div
              className="absolute top-8 right-8 z-20 border-4 border-dislike rounded-xl px-4 py-2 bg-dislike/10 backdrop-blur-sm"
              style={{
                opacity: dragDistance.x < -50 ? getSwipeOpacity() : 0,
                transform: `rotate(20deg)`,
              }}
            >
              <span className="text-dislike font-bold text-xl">NOPE</span>
            </div>

            <div
              className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20 border-4 border-superlike rounded-xl px-4 py-2 bg-superlike/10 backdrop-blur-sm"
              style={{
                opacity: dragDistance.y < -50 ? getSwipeOpacity() : 0,
              }}
            >
              <span className="text-superlike font-bold text-xl">SUPER LIKE</span>
            </div>
          </>
        )}

        {children}
      </div>
    </div>
  );
};