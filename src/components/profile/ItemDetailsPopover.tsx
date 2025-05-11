
import React from 'react';
import { Heart } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { MatchItem } from '@/types/item';
import { toast } from '@/hooks/use-toast';

interface ItemDetailsPopoverProps {
  item: MatchItem | null;
  children: React.ReactNode;
}

const ItemDetailsPopover = ({ item, children }: ItemDetailsPopoverProps) => {
  if (!item) return <>{children}</>;
  
  const handleMessageClick = () => {
    toast({
      title: "Message sent",
      description: `You requested to trade for ${item.name}.`
    });
  };
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 border-none shadow-lg" align="end">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Item Title */}
          <div className="p-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
            <button className="text-gray-400 hover:text-gray-600">
              &times;
            </button>
          </div>
          
          {/* Item Image */}
          <div className="relative">
            <img 
              src={item.image} 
              alt={item.name} 
              className="w-full h-48 object-cover"
            />
            <div className="absolute bottom-2 right-2">
              <button className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors">
                <Heart 
                  className={`h-5 w-5 ${item.liked ? "text-red-500 fill-red-500" : "text-gray-400"}`}
                />
              </button>
            </div>
          </div>
          
          {/* Item Description */}
          <div className="p-4">
            <h3 className="text-lg text-gray-700 mb-2">Description</h3>
            <p className="text-gray-700 mb-6">
              Like new condition. This {item.name.toLowerCase()} has been gently used and well maintained. Perfect for anyone looking for a high-quality item at a great value.
            </p>
            
            {/* Item Details */}
            <h3 className="text-lg text-gray-700 mb-2">Details</h3>
            <div className="mb-6">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Condition</span>
                <span className="font-medium">Excellent</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Category</span>
                <span className="font-medium">{item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : "Accessories"}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Owner</span>
                <span className="font-medium">Emma Wilson</span>
              </div>
            </div>
            
            {/* Action Button */}
            <Button 
              className="w-full py-6 text-base"
              onClick={handleMessageClick}
            >
              Message about this item
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ItemDetailsPopover;
