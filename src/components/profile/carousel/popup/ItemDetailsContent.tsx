
import React from 'react';
import { Check, Home, Utensils, DollarSign, MapPin, Clock, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';

interface ItemDetailsContentProps {
  name: string;
  showProfileInfo?: boolean;
}

const ItemDetailsContent: React.FC<ItemDetailsContentProps> = ({ name, showProfileInfo = true }) => {
  return (
    <div className="flex-1 overflow-y-auto p-5 bg-white">
      <h2 className="text-xl font-bold mb-3 text-gray-900">
        {name || "Item Name"}
      </h2>
      
      <p className="text-gray-700 text-sm mb-4 bg-gray-50 p-3 rounded-md">
        Like new condition. This item has been gently used and well maintained. Perfect for anyone looking for a high-quality {name?.toLowerCase() || "item"} at a great value.
      </p>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center">
          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-1.5">
            <Check className="w-3 h-3 text-green-600" />
          </div>
          <span className="text-gray-800 text-xs">Brand New</span>
        </div>
        
        <div className="flex items-center">
          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-1.5">
            <DollarSign className="w-3 h-3 text-green-600" />
          </div>
          <span className="text-gray-800 text-xs">$100 - $250</span>
        </div>
        
        <div className="flex items-center">
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-1.5">
            <Home className="w-3 h-3 text-blue-600" />
          </div>
          <span className="text-gray-800 text-xs">Home & Garden</span>
        </div>
        
        <div className="flex items-center">
          <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-1.5">
            <Utensils className="w-3 h-3 text-purple-600" />
          </div>
          <span className="text-gray-800 text-xs">Kitchen Appliances</span>
        </div>
      </div>
      
      {showProfileInfo && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <Link to="/other-person-profile" className="block mb-3">
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&h=250&auto=format&fit=crop" />
                <AvatarFallback>EW</AvatarFallback>
              </Avatar>
              
              <div>
                <h3 className="font-medium text-sm">Emma Wilson</h3>
                <div className="flex text-amber-400 text-xs">★★★★★ <span className="text-gray-500 ml-1">(42)</span></div>
              </div>
            </div>
          </Link>
          
          <div className="flex justify-between text-xs text-gray-600">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span>Since 2023</span>
            </div>
            
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              <span>2.3 mi away</span>
            </div>
            
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>~1 hr response</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetailsContent;
