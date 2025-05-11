
import React from 'react';
import { Check, Home, Utensils, DollarSign } from 'lucide-react';

interface ItemDetailsProps {
  name: string;
}

const ItemDetails = ({ name }: ItemDetailsProps) => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        {name || "Selected Item"}
      </h2>
      
      <p className="text-gray-700 mb-6">
        Like new condition. This item has been gently used and well maintained. Perfect for anyone looking for a high-quality {name?.toLowerCase() || "item"} at a great value.
      </p>
      
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
    </div>
  );
};

export default ItemDetails;
