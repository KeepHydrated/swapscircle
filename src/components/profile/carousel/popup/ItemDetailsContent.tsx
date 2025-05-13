
import React from 'react';
import { Check, Home, Utensils, DollarSign, MapPin, Clock, Calendar } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ItemFeatureBadge from './ItemFeatureBadge';
import UserInfoSection from './UserInfoSection';

interface ItemDetailsContentProps {
  name: string;
}

const ItemDetailsContent: React.FC<ItemDetailsContentProps> = ({ name }) => {
  return (
    <div className="md:w-[45%] flex flex-col">
      <ScrollArea className="flex-grow">
        <div className="p-6 pt-12"> {/* More padding on top */}
          <h2 className="text-xl font-bold mb-3">{name}</h2>
          
          <div className="bg-gray-50 p-3 rounded-md mb-4">
            <p className="text-gray-700 text-sm">
              Like new condition. This item has been gently used and well maintained. Perfect for
              anyone looking for a high-quality {name.toLowerCase()} at a great value.
            </p>
          </div>
          
          <hr className="my-4" />
          
          {/* Aligned vertically - First row */}
          <div className="flex gap-4 mb-3">
            <ItemFeatureBadge 
              icon={Check}
              text="Brand New"
              bgColor="bg-green-100"
              iconColor="text-green-600"
            />
            
            <ItemFeatureBadge 
              icon={Home}
              text="Home & Garden"
              bgColor="bg-blue-100"
              iconColor="text-blue-600"
            />
          </div>
          
          {/* Aligned vertically - Second row */}
          <div className="flex gap-4 mb-3">
            <ItemFeatureBadge 
              icon={Utensils}
              text="Kitchen"
              bgColor="bg-purple-100"
              iconColor="text-purple-600"
            />
            
            <ItemFeatureBadge 
              icon={DollarSign}
              text="$100-$250"
              bgColor="bg-green-100"
              iconColor="text-green-600"
            />
          </div>
          
          <hr className="my-4" />
          
          {/* User profile section */}
          <UserInfoSection />
        </div>
      </ScrollArea>
    </div>
  );
};

export default ItemDetailsContent;
