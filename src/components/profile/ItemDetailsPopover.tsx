
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
          {/* Item Title */}
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
          </div>
          
          {/* Item Description */}
          <div className="px-4 pb-4">
            <p className="text-gray-700 bg-gray-50 p-4 rounded-md">
              Like new condition. This {item.name.toLowerCase()} has been gently used and well maintained. Perfect for anyone looking for a high-quality {item.name.toLowerCase()} at a great value.
            </p>
          </div>
          
          {/* Item Details with Icons */}
          <div className="border-t border-b py-4">
            <div className="grid grid-cols-2 gap-4 px-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-gray-800 font-medium">Brand New</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <Home className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-gray-800 font-medium">Home & Garden</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                  <Utensils className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-gray-800 font-medium">Kitchen Appliances</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-gray-800 font-medium">$100 - $250</span>
              </div>
            </div>
          </div>
          
          {/* Seller Info */}
          <div className="p-4 bg-white">
            <div className="flex items-center">
              <Avatar className="h-12 w-12 mr-4">
                <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&h=250&auto=format&fit=crop" />
                <AvatarFallback>EW</AvatarFallback>
              </Avatar>
              
              <div className="flex flex-col">
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold mr-2">Emma Wilson</h3>
                  <div className="flex items-center">
                    <span className="text-amber-400">★★★★★</span> 
                    <span className="text-gray-500 text-xs ml-1">(42 reviews)</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                  <div className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    <span>Since 2023</span>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    <span>2.3 mi away</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1" />
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
