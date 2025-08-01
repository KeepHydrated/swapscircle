import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SwipeCardProps {
  children: React.ReactNode | ((props: { isInteracting: boolean }) => React.ReactNode);
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
  disabled?: boolean;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  className,
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [startX, setStartX] = useState(0);
  const [hasMovedSinceStart, setHasMovedSinceStart] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleStart = (clientX: number) => {
    if (disabled) return;
    setIsDragging(true);
    setStartX(clientX);
    setHasMovedSinceStart(false);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || disabled) return;
    const deltaX = clientX - startX;
    setDragX(deltaX);
    
    // Mark that we've moved if there's any significant movement
    if (Math.abs(deltaX) > 3) {
      setHasMovedSinceStart(true);
    }
  };

  const handleEnd = () => {
    if (!isDragging || disabled) return;
    setIsDragging(false);

    const threshold = 100;
    
    if (Math.abs(dragX) > threshold) {
      if (dragX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (dragX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
      // Only reset position after a successful swipe
      setDragX(0);
    }
    // If swipe threshold not met, keep the card at its current position
    // Don't reset dragX here - let it stay where the user left it
    
    // Reset movement flag after a short delay to allow for legitimate clicks
    setTimeout(() => setHasMovedSinceStart(false), 150);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Prevent click events when user is dragging or has moved the card
  const handleClick = (e: React.MouseEvent) => {
    if (isDragging || hasMovedSinceStart || Math.abs(dragX) > 0) {
      e.preventDefault();
      e.stopPropagation();
      // Reset card position on click if it's been moved
      if (Math.abs(dragX) > 0) {
        setDragX(0);
        setHasMovedSinceStart(false);
      }
    }
  };

  // Global mouse events
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        handleMove(e.clientX);
      };

      const handleGlobalMouseUp = () => {
        handleEnd();
      };

      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, startX, dragX]);

  const rotation = dragX * 0.1;
  const opacity = Math.max(0.7, 1 - Math.abs(dragX) / 200);
  const isInteracting = isDragging || hasMovedSinceStart || Math.abs(dragX) > 0;

  return (
    <div
      ref={cardRef}
      className={cn(
        "touch-pan-y select-none transition-transform duration-200",
        isDragging ? "cursor-grabbing" : "cursor-grab",
        className
      )}
      style={{
        transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
        opacity,
        transition: isDragging ? 'none' : 'none' // Disable all transitions to stop on finger lift
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      {typeof children === 'function' ? children({ isInteracting }) : children}
      
      {/* Swipe indicators */}
      {isDragging && (
        <>
          {dragX > 50 && (
            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium z-10">
              Like
            </div>
          )}
          {dragX < -50 && (
            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium z-10">
              Pass
            </div>
          )}
        </>
      )}
    </div>
  );
};