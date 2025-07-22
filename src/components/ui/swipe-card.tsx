import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SwipeCardProps {
  children: React.ReactNode;
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
  const cardRef = useRef<HTMLDivElement>(null);

  const handleStart = (clientX: number) => {
    if (disabled) return;
    setIsDragging(true);
    setStartX(clientX);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || disabled) return;
    const deltaX = clientX - startX;
    setDragX(deltaX);
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
    }
    
    setDragX(0);
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
        transition: isDragging ? 'none' : 'transform 0.3s ease-out, opacity 0.3s ease-out'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
      
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