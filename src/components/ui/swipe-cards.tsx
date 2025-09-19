import { useState } from "react";
import { motion, useAnimation } from "framer-motion";

interface Card {
  id: string;
  image: string;
  title: string;
  description?: string;
  condition?: string;
  category?: string;
}

interface SwipeCardsProps {
  cards: Card[];
  onLike: (id: string) => void;
  onReject: (id: string) => void;
}

export default function SwipeCards({ cards, onLike, onReject }: SwipeCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const controls = useAnimation();

  const handleDragEnd = (_, info) => {
    const offset = info.offset.x;
    if (offset > 100) {
      // swipe right - like
      controls.start({ x: 500, rotate: 20, opacity: 0 }).then(() => {
        onLike(cards[currentIndex].id);
        setCurrentIndex((i) => i + 1);
        controls.set({ x: 0, rotate: 0, opacity: 1 });
      });
    } else if (offset < -100) {
      // swipe left - reject
      controls.start({ x: -500, rotate: -20, opacity: 0 }).then(() => {
        onReject(cards[currentIndex].id);
        setCurrentIndex((i) => i + 1);
        controls.set({ x: 0, rotate: 0, opacity: 1 });
      });
    }
  };

  if (currentIndex >= cards.length) {
    return <p className="text-center text-xl">No more cards!</p>;
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        animate={controls}
        onDragEnd={handleDragEnd}
        className="w-72 h-96 bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <img
          src={currentCard.image}
          alt={currentCard.title}
          className="w-full h-full object-cover"
        />
      </motion.div>
    </div>
  );
}