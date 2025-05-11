
import React, { useState } from 'react';
import { Check, Home, Utensils, DollarSign, MapPin, Clock, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ItemDetailsProps {
  name: string;
}

const ItemDetails = ({ name }: ItemDetailsProps) => {
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

  const toggleDescription = () => {
    setIsDescriptionOpen(!isDescriptionOpen);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        {name || "Selected Item"}
      </h2>
      
      <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={toggleDescription}>
        <p className="text-gray-700 font-medium">Item Description</p>
        {isDescriptionOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </div>
      
      {isDescriptionOpen && (
        <p className="text-gray-700 mb-6 bg-gray-50 p-3 rounded-md">
          Like new condition. This item has been gently used and well maintained. Perfect for anyone looking for a high-quality {name?.toLowerCase() || "item"} at a great value.
        </p>
      )}
      
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
      
      {/* Owner Profile Information */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center mb-2">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&h=250&auto=format&fit=crop" />
            <AvatarFallback>EW</AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col space-y-1 flex-grow">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <h3 className="text-lg font-semibold mr-3">Emma Wilson</h3>
                <div className="flex items-center text-amber-400">
                  {'★★★★★'} <span className="text-gray-500 text-xs ml-1">(42 reviews)</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Removed the map pin and clock items since they're now in the row above */}
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
