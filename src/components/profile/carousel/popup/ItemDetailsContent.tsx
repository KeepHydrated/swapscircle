
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, Home, Utensils, DollarSign, MapPin, Clock, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';

interface ItemDetailsContentProps {
  name: string;
  showProfileInfo?: boolean;
}

const ItemDetailsContent: React.FC<ItemDetailsContentProps> = ({ name, showProfileInfo = true }) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 bg-white">
      <h2 className="text-2xl font-bold mb-3 text-gray-900">
        {name || "Item Name"}
      </h2>
      
      <p className="text-gray-700 mb-6 bg-gray-50 p-4 rounded-md">
        Like new condition. This item has been gently used and well maintained. Perfect for anyone looking for a high-quality {name?.toLowerCase() || "item"} at a great value.
      </p>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <span className="text-gray-800">Brand New</span>
        </div>
        
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
            <DollarSign className="w-4 h-4 text-green-600" />
          </div>
          <span className="text-gray-800">$100 - $250</span>
        </div>
        
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
            <Home className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-gray-800">Home & Garden</span>
        </div>
        
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
            <Utensils className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-gray-800">Kitchen Appliances</span>
        </div>
      </div>
      
      {showProfileInfo && (
        <div className="border-t border-gray-200 pt-6 mt-6">
          <Link to="/other-person-profile" className="block mb-4">
            <div className="flex items-center">
              <Avatar className="h-12 w-12 mr-4">
                <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&h=250&auto=format&fit=crop" />
                <AvatarFallback>EW</AvatarFallback>
              </Avatar>
              
              <div>
                <h3 className="font-medium">Emma Wilson</h3>
                <div className="flex text-amber-400">★★★★★ <span className="text-gray-500 ml-1">(42)</span></div>
              </div>
            </div>
          </Link>
          
          <div className="flex justify-between text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Member since 2023</span>
            </div>
            
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              <span>2.3 mi away</span>
            </div>
            
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>~1 hour response</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetailsContent;
