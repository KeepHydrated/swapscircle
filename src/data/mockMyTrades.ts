
import { CompletedTrade } from '@/types/trade';

export const myCompletedTrades: CompletedTrade[] = [
  {
    id: 101,
    name: "Vintage Typewriter",
    tradedFor: "Retro Gaming Console",
    tradedWith: "Jessica L.",
    tradeDate: "March 15, 2025",
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    theirReview: {
      rating: 5,
      comment: "Alex was such a pleasure to trade with! The typewriter was in perfect condition and exactly as described. Would definitely trade with them again!",
      date: "March 17, 2025"
    },
    myReview: {
      rating: 5,
      comment: "Great trade! Jessica's gaming console was in excellent condition. Very happy with this exchange.",
      date: "March 18, 2025"
    }
  },
  {
    id: 102,
    name: "1970s Record Player",
    tradedFor: "Comic Book Collection",
    tradedWith: "Marcus T.",
    tradeDate: "February 20, 2025",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    theirReview: {
      rating: 4,
      comment: "Good experience overall. The record player works great, though there was a small scratch not mentioned in the description.",
      date: "February 23, 2025"
    }
  },
  {
    id: 103,
    name: "Antique Pocket Watch",
    tradedFor: "Vintage Camera Lenses",
    tradedWith: "Sophia R.",
    tradeDate: "January 8, 2025",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    theirReview: {
      rating: 5,
      comment: "Fantastic trade! The pocket watch is even more beautiful in person. Alex was very prompt and professional.",
      date: "January 10, 2025"
    },
    myReview: {
      rating: 4,
      comment: "The camera lenses were in good condition, though one has a slight focusing issue. Still, Sophia was great to trade with.",
      date: "January 12, 2025"
    }
  },
  {
    id: 104,
    name: "Classic Film Camera",
    tradedFor: "Vinyl Record Collection",
    tradedWith: "Daniel M.",
    tradeDate: "December 5, 2024",
    image: "https://images.unsplash.com/photo-1487887235947-a955ef187fcc",
    theirReview: {
      rating: 5,
      comment: "Excellent condition camera, works perfectly! Alex was responsive and made the trading process easy.",
      date: "December 8, 2024"
    }
  }
];
