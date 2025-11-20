import React from 'react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const categories = [
  { name: "Electronics", icon: "📱", color: "bg-blue-100 hover:bg-blue-200" },
  { name: "Home & Garden", icon: "🏠", color: "bg-green-100 hover:bg-green-200" },
  { name: "Sports & Outdoors", icon: "⚽", color: "bg-orange-100 hover:bg-orange-200" },
  { name: "Clothing", icon: "👕", color: "bg-purple-100 hover:bg-purple-200" },
  { name: "Business", icon: "💼", color: "bg-gray-100 hover:bg-gray-200" },
  { name: "Entertainment", icon: "🎮", color: "bg-pink-100 hover:bg-pink-200" },
  { name: "Collectibles", icon: "🎨", color: "bg-yellow-100 hover:bg-yellow-200" },
  { name: "Books & Media", icon: "📚", color: "bg-indigo-100 hover:bg-indigo-200" },
  { name: "Tools & Equipment", icon: "🔧", color: "bg-red-100 hover:bg-red-200" },
  { name: "Food", icon: "🍕", color: "bg-amber-100 hover:bg-amber-200" },
];

const RecommendedCategoriesSection: React.FC = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Recommended Categories</h2>
      <div className="flex flex-wrap gap-6 justify-center">
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => handleCategoryClick(category.name)}
            className={cn(
              "flex flex-col items-center gap-2 transition-all group",
              "hover:scale-110"
            )}
          >
            <div
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center text-3xl",
                "border-2 border-border transition-all shadow-sm",
                category.color,
                "group-hover:shadow-lg"
              )}
            >
              {category.icon}
            </div>
            <span className="text-sm text-center font-medium max-w-[90px] text-muted-foreground group-hover:text-foreground transition-colors">
              {category.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecommendedCategoriesSection;
