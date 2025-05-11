
import React from 'react';
import { Check, Home, Utensils, DollarSign, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ItemDetailsProps {
  name: string;
}

const ItemDetails = ({ name }: ItemDetailsProps) => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        {name || "Selected Item"}
      </h2>
      
      <div className="mb-4">
        <p className="text-gray-700 mt-2 bg-gray-50 p-3 rounded-md">
          Like new condition. This item has been gently used and well maintained. Perfect for anyone looking for a high-quality {name?.toLowerCase() || "item"} at a great value.
        </p>
      </div>
      
      <hr className="mb-4" />
      
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
            <Check className="w-5 h-5 text-green-600" />
          </div>
          <span className="text-gray-800 font-medium">Brand New</span>
        </div>
        
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <Home className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-gray-800 font-medium">Home & Garden</span>
        </div>
        
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
            <Utensils className="w-5 h-5 text-purple-600" />
          </div>
          <span className="text-gray-800 font-medium">Kitchen Appliances</span>
        </div>
        
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <span className="text-gray-800 font-medium">$100 - $250</span>
        </div>
      </div>
      
      {/* Profile information section - restored */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src="https://images.unsplash.com/photo-1501286353178-1ec881214838" alt="User Profile" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-medium text-gray-900">John Doe</h4>
            <div className="flex items-center text-sm text-gray-500">
              <div className="flex items-center mr-2">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                <span>4.8</span>
              </div>
              <span>· 24 Trades</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Member since May 2023
          </div>
          <div className="text-sm font-medium text-blue-600">
            View Profile
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
