import React from 'react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const categories = [
  { name: "Electronics", icon: "📱", color: "bg-blue-100" },
  { name: "Home & Garden", icon: "🏠", color: "bg-green-100" },
  { name: "Sports & Outdoors", icon: "⚽", color: "bg-orange-100" },
  { name: "Clothing", icon: "👕", color: "bg-purple-100" },
  { name: "Business", icon: "💼", color: "bg-gray-100" },
  { name: "Entertainment", icon: "🎮", color: "bg-pink-100" },
  { name: "Collectibles", icon: "🎨", color: "bg-yellow-100" },
  { name: "Books & Media", icon: "📚", color: "bg-indigo-100" },
  { name: "Tools & Equipment", icon: "🔧", color: "bg-red-100" },
  { name: "Food", icon: "🍕", color: "bg-amber-100" },
];

const RecommendedCategoriesSection: React.FC = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Recommended Categories</h2>
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {categories.map((category) => (
            <CarouselItem key={category.name} className="pl-4 basis-auto">
              <button
                onClick={() => handleCategoryClick(category.name)}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center text-3xl",
                    "border-2 border-border shadow-sm",
                    category.color
                  )}
                >
                  {category.icon}
                </div>
                <span className="text-sm text-center font-medium max-w-[90px] text-muted-foreground">
                  {category.name}
                </span>
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0" />
        <CarouselNext className="right-0" />
      </Carousel>
    </div>
  );
};

export default RecommendedCategoriesSection;
