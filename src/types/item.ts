
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
}

export interface MatchItem extends Item {
  liked?: boolean;
}
