
import React from 'react';
import { Check, Home, Utensils, DollarSign, MapPin, Clock, Calendar } from 'lucide-react';
import { MatchItem } from '@/types/item';

interface ItemDetailsPopupProps {
  item: MatchItem;
  dropdownPosition: 'left' | 'right';
  className?: string; // Added className as an optional prop
}

const ItemDetailsPopup: React.FC<ItemDetailsPopupProps> = ({ 
  item, 
  dropdownPosition,
  className = '' // Default to empty string if not provided
}) => {
  return (
    <div className={`flex ${dropdownPosition === 'left' ? 'justify-start' : 'justify-end'} w-full`}>
      <div className={`mt-4 bg-white rounded-lg border p-4 animate-fade-in ${className}`}>
        <h2 className="text-xl font-bold mb-2">{item.name}</h2>
        
        <div className="bg-gray-50 p-3 rounded-md mb-3">
          <p className="text-gray-700 text-sm">
            Like new condition. This item has been gently used and well maintained. Perfect for
            anyone looking for a high-quality {item.name.toLowerCase()} at a great value.
          </p>
        </div>
        
        <hr className="my-3" />
        
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
            <span className="text-gray-800 text-xs">Kitchen</span>
          </div>
          
          <div className="flex items-center">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-1.5">
              <DollarSign className="w-2.5 h-2.5 text-green-600" />
            </div>
            <span className="text-gray-800 text-xs">$100-$250</span>
          </div>
        </div>
        
        <hr className="my-3" />
        
        <div className="flex items-center mt-2">
          <div className="flex-shrink-0 mr-3">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&h=250&auto=format&fit=crop"
              alt="Owner" 
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center">
              <h3 className="text-sm font-semibold mr-2">Emma Wilson</h3>
              <div className="flex text-amber-400 text-xs">★★★★★</div>
              <span className="text-gray-500 text-xs ml-1">(42)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-0.5" />
                <span>Since 2023</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-3 w-3 mr-0.5" />
                <span>2.3 mi away</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-0.5" />
                <span>~1 hour</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailsPopup;
