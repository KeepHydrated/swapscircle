import { useState, useRef, useEffect } from "react";
import { Heart, X, Star } from "lucide-react";

interface SwipeCardProps {
  children: React.ReactNode;
  onSwipe: (direction: "left" | "right" | "up") => void;
  isTop: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const TinderSwipeCard = ({ 
  children, 
  onSwipe, 
  isTop, 
  style = {}, 
  className = "" 
}: SwipeCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragDistance, setDragDistance] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });

  const handleStart = (clientX: number, clientY: number) => {
    if (!isTop) return;
    setIsDragging(true);
    startPos.current = { x: clientX, y: clientY };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || !isTop) return;
    
    const deltaX = clientX - startPos.current.x;
    const deltaY = clientY - startPos.current.y;
    const newRotation = deltaX * 0.1;
    
    setDragDistance({ x: deltaX, y: deltaY });
    setRotation(newRotation);
  };

  const handleEnd = () => {
    if (!isDragging || !isTop) return;
    
    setIsDragging(false);
    const threshold = 100;
    
    if (Math.abs(dragDistance.x) > threshold) {
      onSwipe(dragDistance.x > 0 ? "right" : "left");
    } else if (dragDistance.y < -threshold) {
      onSwipe("up");
    } else {
      setDragDistance({ x: 0, y: 0 });
      setRotation(0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging]);

  const getSwipeOpacity = () => {
    const opacity = Math.abs(dragDistance.x) / 150;
    return Math.min(opacity, 0.8);
  };

  const transform = `translate(${dragDistance.x}px, ${dragDistance.y}px) rotate(${rotation}deg)`;

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
  );
};