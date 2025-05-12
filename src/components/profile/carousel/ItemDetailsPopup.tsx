
import React from 'react';
import { Check, Home, Utensils, DollarSign, MapPin, Clock, Calendar, X } from 'lucide-react';
import { MatchItem } from '@/types/item';
import {
  Dialog,
  DialogContent,
  DialogOverlay,
} from "@/components/ui/dialog";

interface ItemDetailsPopupProps {
  item: MatchItem;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const ItemDetailsPopup: React.FC<ItemDetailsPopupProps> = ({ 
  item, 
  isOpen,
  onClose,
  className = ''
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogOverlay className="bg-black/80" />
      <DialogContent className={`max-w-3xl p-0 border-none bg-white rounded-lg overflow-hidden ${className}`}>
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-black/50 p-1 text-white hover:bg-black/70 z-10"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="flex flex-col md:flex-row">
          {/* Left side - Image */}
          <div className="md:w-2/3 bg-gray-100">
            <img 
              src={item.image} 
              alt={item.name} 
              className="w-full aspect-square md:aspect-auto md:h-full object-cover"
            />
          </div>
          
          {/* Right side - Item details */}
          <div className="md:w-1/3 p-4 overflow-y-auto max-h-[80vh] md:max-h-[600px]">
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
      </DialogContent>
    </Dialog>
  );
};

export default ItemDetailsPopup;
