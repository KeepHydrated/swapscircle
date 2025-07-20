
// Common types for items and matches

export interface Item {
  id: string;
  name: string;
  image: string;
  isSelected?: boolean;
  category?: string;
  condition?: string;
  description?: string;
  tags?: string[];
  priceRange?: string;
  // New preference fields for "What You're Looking For"
  lookingForCategories?: string[];
  lookingForConditions?: string[];
  lookingForDescription?: string;
  priceRangeMin?: number;
  priceRangeMax?: number;
}

export interface MatchItem extends Item {
  liked?: boolean;
  isFriend?: boolean;
  user_id?: string;
}

// CompletedTrade is now imported from @/types/trade
