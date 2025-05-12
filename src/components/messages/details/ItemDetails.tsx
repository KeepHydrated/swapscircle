
import React from 'react';
import { Check, Home, Utensils, DollarSign, MapPin, Clock, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ItemDetailsProps {
  name: string;
  showProfileInfo?: boolean;
}

const ItemDetails = ({ name, showProfileInfo = true }: ItemDetailsProps) => {
  return (
    <div className="p-3">
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        {name || "Selected Item"}
      </h2>
      
      <div className="mb-3">
        <p className="text-gray-700 text-sm mt-1 bg-gray-50 p-2 rounded-md">
          Like new condition. This item has been gently used and well maintained. Perfect for anyone looking for a high-quality {name?.toLowerCase() || "item"} at a great value.
        </p>
      </div>
      
      <hr className="mb-3" />
      
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center">
          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-1.5">
            <Check className="w-2.5 h-2.5 text-green-600" />
          </div>
          <span className="text-gray-800 text-xs">Brand New</span>
        </div>
        
        <div className="flex items-center">
          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-1.5">
            <Home className="w-2.5 h-2.5 text-blue-600" />
          </div>
          <span className="text-gray-800 text-xs">Home & Garden</span>
        </div>
        
        <div className="flex items-center">
          <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center mr-1.5">
            <Utensils className="w-2.5 h-2.5 text-purple-600" />
          </div>
          <span className="text-gray-800 text-xs">Kitchen Appliances</span>
        </div>
        
        <div className="flex items-center">
          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-1.5">
            <DollarSign className="w-2.5 h-2.5 text-green-600" />
          </div>
          <span className="text-gray-800 text-xs">$100 - $250</span>
        </div>
      </div>
      
      {/* Owner Profile Information - Only show if showProfileInfo is true */}
      {showProfileInfo && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-start">
            {/* Avatar on the left */}
            <Avatar className="h-10 w-10 mr-3 flex-shrink-0">
              <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&h=250&auto=format&fit=crop" />
              <AvatarFallback>EW</AvatarFallback>
            </Avatar>
            
            {/* Profile info on the right */}
            <div className="flex flex-col">
              {/* First row: Name and rating */}
              <div className="flex items-center mb-0.5">
                <h3 className="text-sm font-semibold mr-2">Emma Wilson</h3>
                <div className="flex items-center">
                  <span className="text-amber-400 text-xs">★★★★★</span> 
                  <span className="text-gray-500 text-xs ml-0.5">(42)</span>
                </div>
              </div>
              
              {/* Second row: Member since, distance, response time */}
              <div className="flex items-center flex-wrap gap-2 text-xs text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-0.5 flex-shrink-0" />
                  <span>Since 2023</span>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-0.5 flex-shrink-0" />
                  <span>2.3 mi away</span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-0.5 flex-shrink-0" />
                  <span>~1 hour</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetails;
