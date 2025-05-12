
// Mock reviews data for users

interface Review {
  id: number;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

const mockUserReviews: Record<string, Review[]> = {
  "user1": [
    {
      id: 1,
      user: "Michael R.",
      rating: 5,
      comment: "Great trader! Item was exactly as described, and Jessica was a pleasure to work with.",
      date: "April 15, 2025"
    },
    {
      id: 2,
      user: "Sophia T.",
      rating: 4,
      comment: "Good communication and fair trade. The book was in slightly worse condition than I expected, but still a good deal.",
      date: "March 28, 2025"
    }
  ],
  "user2": [
    {
      id: 3,
      user: "Alex P.",
      rating: 5,
      comment: "Marcus is a trustworthy trader. The console was in perfect condition and he shipped it quickly.",
      date: "May 7, 2025"
    },
    {
      id: 4,
      user: "Emma L.",
      rating: 5,
      comment: "Amazing experience trading with Marcus. The record player works perfectly!",
      date: "April 20, 2025"
    }
  ]
};

export const getUserReviews = (userId: string): Review[] => {
  return mockUserReviews[userId as keyof typeof mockUserReviews] || [];
};

export type { Review };
