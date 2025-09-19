import { useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SwipeCard {
  id: string;
  title: string;
  image: string;
  description?: string;
  condition?: string;
  category?: string;
  user: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

interface FramerSwipeCardsProps {
  cards: SwipeCard[];
  onLike: (id: string) => void;
  onReject: (id: string) => void;
  onSuperLike?: (id: string) => void;
}

export default function FramerSwipeCards({ 
  cards, 
  onLike, 
  onReject, 
  onSuperLike 
}: FramerSwipeCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const controls = useAnimation();

  const handleDragEnd = (_, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    const offsetY = info.offset.y;
    const velocityY = info.velocity.y;
    
    console.log('🎯 Drag ended:', { offset, velocity, offsetY, velocityY });
    
    // Check for super like (swipe up) - more sensitive detection
    if (offsetY < -80 || velocityY < -300) {
      console.log('🌟 Super like detected!');
      if (onSuperLike) {
        controls.start({ 
          y: -500, 
          rotate: 0, 
          opacity: 0,
          scale: 0.8
        }).then(() => {
          onSuperLike(cards[currentIndex].id);
          setCurrentIndex((i) => i + 1);
          controls.set({ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 });
        });
      }
    }
    // Swipe right (like)
    else if (offset > 80 || velocity > 300) {
      console.log('❤️ Like detected!');
      controls.start({ 
        x: 500, 
        rotate: 20, 
        opacity: 0,
        scale: 0.8
      }).then(() => {
        onLike(cards[currentIndex].id);
        setCurrentIndex((i) => i + 1);
        controls.set({ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 });
      });
    }
    // Swipe left (reject)
    else if (offset < -80 || velocity < -300) {
      console.log('❌ Reject detected!');
      controls.start({ 
        x: -500, 
        rotate: -20, 
        opacity: 0,
        scale: 0.8
      }).then(() => {
        onReject(cards[currentIndex].id);
        setCurrentIndex((i) => i + 1);
        controls.set({ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 });
      });
    }
    // Swipe down (could be for another action if needed)
    else if (offsetY > 80 || velocityY > 300) {
      console.log('⬇️ Down swipe detected!');
      // For now, just snap back
      controls.start({ x: 0, y: 0, rotate: 0 });
    }
    else {
      console.log('🔄 Snap back');
      // Snap back to center if no significant movement
      controls.start({ x: 0, y: 0, rotate: 0 });
    }
  };

  const handleButtonAction = (action: 'like' | 'reject' | 'superlike') => {
    const currentCard = cards[currentIndex];
    if (!currentCard) return;

    let animationProps = {};
    let callback = () => {};

    switch (action) {
      case 'like':
        animationProps = { x: 500, rotate: 20, opacity: 0, scale: 0.8 };
        callback = () => onLike(currentCard.id);
        break;
      case 'reject':
        animationProps = { x: -500, rotate: -20, opacity: 0, scale: 0.8 };
        callback = () => onReject(currentCard.id);
        break;
      case 'superlike':
        if (onSuperLike) {
          animationProps = { y: -500, rotate: 0, opacity: 0, scale: 0.8 };
          callback = () => onSuperLike(currentCard.id);
        }
        break;
    }

    controls.start(animationProps).then(() => {
      callback();
      setCurrentIndex((i) => i + 1);
      controls.set({ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 });
    });
  };

  if (currentIndex >= cards.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] text-center px-4">
        <div className="text-6xl mb-4">🎉</div>
        <p className="text-xl font-semibold mb-2">All caught up!</p>
        <p className="text-muted-foreground">No more items to review.</p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const nextCard = cards[currentIndex + 1];

  return (
    <div className="relative w-full h-[600px] flex flex-col items-center">
      {/* Card Stack */}
      <div className="relative w-full max-w-sm h-[500px] mb-4">
        {/* Next Card (Background) */}
        {nextCard && (
          <div className="absolute inset-0 w-full h-full">
            <Card className="w-full h-full overflow-hidden shadow-lg transform scale-95 opacity-50">
              <div className="relative h-full">
                <img
                  src={nextCard.image}
                  alt={nextCard.title}
                  className="w-full h-3/4 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <h3 className="text-white font-semibold text-lg truncate">
                    {nextCard.title}
                  </h3>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Current Card */}
        <motion.div
          drag
          dragConstraints={{ left: -150, right: 150, top: -150, bottom: 150 }}
          dragElastic={0.2}
          animate={controls}
          onDragEnd={handleDragEnd}
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
          whileDrag={{ scale: 1.05 }}
        >
          <Card className="w-full h-full overflow-hidden shadow-xl">
            <div className="relative h-full">
              <img
                src={currentCard.image}
                alt={currentCard.title}
                className="w-full h-3/4 object-cover"
              />
              
              {/* Card Content */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={currentCard.user.avatar_url} />
                    <AvatarFallback>
                      {currentCard.user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-white text-sm font-medium">
                    {currentCard.user.name}
                  </span>
                </div>
                
                <h3 className="text-white font-semibold text-lg mb-1">
                  {currentCard.title}
                </h3>
                
                <div className="flex gap-2 mb-2">
                  {currentCard.category && (
                    <Badge variant="secondary" className="text-xs">
                      {currentCard.category}
                    </Badge>
                  )}
                  {currentCard.condition && (
                    <Badge variant="outline" className="text-xs text-white border-white/30">
                      {currentCard.condition}
                    </Badge>
                  )}
                </div>
                
                {currentCard.description && (
                  <p className="text-white/80 text-sm line-clamp-2">
                    {currentCard.description}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          size="lg"
          variant="outline"
          className="rounded-full w-14 h-14 p-0 border-2 border-red-500 hover:bg-red-50"
          onClick={() => handleButtonAction('reject')}
        >
          <X className="w-6 h-6 text-red-500" />
        </Button>

        {onSuperLike && (
          <Button
            size="lg"
            variant="outline"
            className="rounded-full w-14 h-14 p-0 border-2 border-blue-500 hover:bg-blue-50"
            onClick={() => handleButtonAction('superlike')}
          >
            <Star className="w-6 h-6 text-blue-500" />
          </Button>
        )}

        <Button
          size="lg"
          variant="outline"
          className="rounded-full w-14 h-14 p-0 border-2 border-green-500 hover:bg-green-50"
          onClick={() => handleButtonAction('like')}
        >
          <Heart className="w-6 h-6 text-green-500" />
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="mt-4 flex gap-1">
        {cards.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index < currentIndex
                ? 'bg-primary'
                : index === currentIndex
                ? 'bg-primary/60'
                : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
}