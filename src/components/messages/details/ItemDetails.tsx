
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
      
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center">
          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
            <Check className="w-3 h-3 text-green-600" />
          </div>
          <span className="text-gray-800 text-sm">Brand New</span>
        </div>
        
        <div className="flex items-center">
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
            <Home className="w-3 h-3 text-blue-600" />
          </div>
          <span className="text-gray-800 text-sm">Home & Garden</span>
        </div>
        
        <div className="flex items-center">
          <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-2">
            <Utensils className="w-3 h-3 text-purple-600" />
          </div>
          <span className="text-gray-800 text-sm">Kitchen Appliances</span>
        </div>
        
        <div className="flex items-center">
          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
            <DollarSign className="w-3 h-3 text-green-600" />
          </div>
          <span className="text-gray-800 text-sm">$100 - $250</span>
        </div>
      </div>
      
      {/* Owner Profile Information - Only show if showProfileInfo is true */}
      {showProfileInfo && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-start">
            {/* Avatar on the left */}
            <Avatar className="h-12 w-12 mr-4 flex-shrink-0">
              <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&h=250&auto=format&fit=crop" />
              <AvatarFallback>EW</AvatarFallback>
            </Avatar>
            
            {/* Profile info on the right */}
            <div className="flex flex-col">
              {/* First row: Name and rating */}
              <div className="flex items-center mb-1">
                <h3 className="text-lg font-semibold mr-2">Emma Wilson</h3>
                <div className="flex items-center">
                  <span className="text-amber-400">★★★★★</span> 
                  <span className="text-gray-500 text-xs ml-1">(42 reviews)</span>
                </div>
              </div>
              
              {/* Second row: Member since, distance, response time */}
              <div className="flex items-center gap-3 text-sm text-gray-600">
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
      )}
    </div>
  );
};

export default ItemDetails;
