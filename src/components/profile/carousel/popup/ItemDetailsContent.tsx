
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

interface ItemDetailsContentProps {
  name: string;
  description?: string;
  category?: string;
  condition?: string;
  tags?: string[];
  priceRange?: string;
  showProfileInfo?: boolean;
}

const ItemDetailsContent: React.FC<ItemDetailsContentProps> = ({ 
  name, 
  description = "No description available.", 
  category = "Uncategorized", 
  condition = "Not specified",
  tags = [],
  priceRange = "Not specified",
  showProfileInfo = true
}) => {
  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {/* Item Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">{name}</h2>
        
        {/* Category & Condition */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className="bg-blue-50 hover:bg-blue-50 border-blue-200">
            {category}
          </Badge>
          <Badge variant="outline" className="bg-green-50 hover:bg-green-50 border-green-200">
            {condition}
          </Badge>
          {priceRange && (
            <Badge variant="outline" className="bg-purple-50 hover:bg-purple-50 border-purple-200">
              {priceRange}
            </Badge>
          )}
        </div>
      </div>
      
      {/* Owner Information - Only show if showProfileInfo is true */}
      {showProfileInfo && (
        <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src="https://github.com/shadcn.png" alt="Owner" />
            <AvatarFallback>OW</AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-medium">Owner Name</div>
            <div className="flex items-center text-xs text-gray-500">
              <Star className="h-3 w-3 mr-1 fill-yellow-400 stroke-yellow-400" />
              <span>4.9 (120 reviews)</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Description */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
        <p className="text-gray-600 whitespace-pre-line">{description}</p>
      </div>
      
      {/* Tags */}
      {tags && tags.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Tags</h3>
          <div className="flex flex-wrap gap-1 mt-1">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetailsContent;
