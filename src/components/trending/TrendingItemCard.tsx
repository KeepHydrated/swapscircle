import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

interface TrendingItemCardProps {
  item: {
    id: string;
    name: string;
    description: string;
    image_url: string;
    category: string;
    condition: string;
    looking_for_categories: string[];
    looking_for_conditions: string[];
    looking_for_description: string;
  };
  onClick?: () => void;
}

export const TrendingItemCard: React.FC<TrendingItemCardProps> = ({ item, onClick }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/item/${item.id}`);
    }
  };
  
  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="grid md:grid-cols-2 gap-4 p-4">
        {/* Left Side - Item Offering */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Offering
          </div>
          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
            <img 
              src={item.image_url} 
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">{item.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {item.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {item.category && (
              <Badge variant="secondary" className="text-xs">
                {item.category}
              </Badge>
            )}
            {item.condition && (
              <Badge variant="outline" className="text-xs">
                {item.condition}
              </Badge>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:flex items-center justify-center">
          <ArrowRight className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="md:hidden flex items-center justify-center py-2">
          <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90" />
        </div>

        {/* Right Side - Looking For */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Looking For
          </div>
          <div className="min-h-[100px] rounded-lg bg-muted/50 p-4 flex items-center justify-center">
            <p className="text-sm text-center">
              {item.looking_for_description || "Open to offers"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {item.looking_for_categories?.map((cat, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {cat}
              </Badge>
            ))}
            {item.looking_for_conditions?.map((cond, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {cond}
              </Badge>
            ))}
            {(!item.looking_for_categories?.length && !item.looking_for_conditions?.length) && (
              <Badge variant="secondary" className="text-xs">
                Any category
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
