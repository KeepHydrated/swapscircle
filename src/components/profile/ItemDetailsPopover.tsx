
import React from 'react';
import { Check, Home, Utensils, DollarSign, Calendar, MapPin, Clock } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MatchItem } from '@/types/item';

interface ItemDetailsPopoverProps {
  item: MatchItem | null;
  children: React.ReactNode;
}

const ItemDetailsPopover = ({ item, children }: ItemDetailsPopoverProps) => {
  if (!item) return <>{children}</>;
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 border-none shadow-lg" align="end">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Item Header */}
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold text-gray-900">{item.name}</h2>
            <p className="text-gray-600 mt-2 text-sm bg-gray-50 p-3 rounded-md">
              Like new condition. This item has been gently used and well maintained. Perfect for anyone looking for a high-quality {item.name.toLowerCase()} at a great value.
            </p>
          </div>
          
          {/* Item Details */}
          <div className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-gray-800 font-medium text-sm">Brand New</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                  <Home className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-gray-800 font-medium text-sm">Home & Garden</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                  <Utensils className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-gray-800 font-medium text-sm">Kitchen Appliances</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-gray-800 font-medium text-sm">$100 - $250</span>
              </div>
            </div>
          </div>
          
          {/* Seller Info */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-start">
              <Avatar className="h-12 w-12 mr-4 flex-shrink-0">
                <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&h=250&auto=format&fit=crop" />
                <AvatarFallback>EW</AvatarFallback>
              </Avatar>
              
              <div className="flex flex-col">
                <div className="flex items-center mb-1">
                  <h3 className="text-lg font-semibold mr-2">Emma Wilson</h3>
                  <div className="flex items-center">
                    <span className="text-amber-400">★★★★★</span> 
                    <span className="text-gray-500 text-xs ml-1">(42 reviews)</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                    <span>Since 2023</span>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                    <span>2.3 mi away</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                    <span>Response: ~1 hour</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ItemDetailsPopover;
