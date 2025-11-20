import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface CategoryCirclesProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const categories = [
  { name: "Electronics", icon: "📱" },
  { name: "Home & Garden", icon: "🏠" },
  { name: "Sports & Outdoors", icon: "⚽" },
  { name: "Clothing", icon: "👕" },
  { name: "Business", icon: "💼" },
  { name: "Entertainment", icon: "🎮" },
  { name: "Collectibles", icon: "🎨" },
  { name: "Books & Media", icon: "📚" },
  { name: "Tools & Equipment", icon: "🔧" },
  { name: "Food", icon: "🍕" },
];

const CategoryCircles: React.FC<CategoryCirclesProps> = ({
  selectedCategory,
  onSelectCategory
}) => {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">Categories you're interested in</h3>
      <div className="flex flex-wrap gap-4">
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => onSelectCategory(category.name)}
            className={cn(
              "flex flex-col items-center gap-2 transition-all",
              "hover:scale-105"
            )}
          >
            <div
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center text-2xl",
                "border-2 transition-all",
                selectedCategory === category.name
                  ? "bg-primary border-primary text-primary-foreground shadow-lg"
                  : "bg-muted border-border hover:border-primary"
              )}
            >
              {category.icon}
            </div>
            <span
              className={cn(
                "text-xs text-center font-medium max-w-[80px] transition-colors",
                selectedCategory === category.name
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {category.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryCircles;
