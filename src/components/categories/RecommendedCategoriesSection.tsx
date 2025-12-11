import React from 'react';
import { useNavigate } from 'react-router-dom';

const categories = [
  { 
    name: "Electronics", 
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
  },
  { 
    name: "Home & Garden", 
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400"
  },
  { 
    name: "Sports & Outdoors", 
    image: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400"
  },
  { 
    name: "Clothing", 
    image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400"
  },
  { 
    name: "Entertainment", 
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400"
  },
  { 
    name: "Collectibles", 
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"
  },
];

const RecommendedCategoriesSection: React.FC = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/search?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold text-foreground mb-4">Shop By Category</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => handleCategoryClick(category.name)}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-full aspect-[4/3] rounded-lg overflow-hidden">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <span className="text-sm font-medium text-foreground">
              {category.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecommendedCategoriesSection;