
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, Home, Utensils, DollarSign, MapPin, Clock, Calendar } from 'lucide-react';

interface TradeDetailsTabsProps {
  selectedPair: {
    id: number;
    item1: { name: string; image: string };
    item2: { name: string; image: string };
  };
  selectedItem: 'item1' | 'item2';
  onSelectItem: (item: 'item1' | 'item2') => void;
}

const TradeDetailsTabs: React.FC<TradeDetailsTabsProps> = ({
  selectedPair,
  selectedItem,
  onSelectItem
}) => {
  return (
    <div className="p-4 border-b border-gray-200 bg-white">
      <h3 className="font-medium mb-4">Trade Details</h3>
      
      <Tabs value={selectedItem} onValueChange={(value) => onSelectItem(value as 'item1' | 'item2')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="item1" className="text-sm">Your Item</TabsTrigger>
          <TabsTrigger value="item2" className="text-sm">Their Item</TabsTrigger>
        </TabsList>
        
        <TabsContent value="item1" className="mt-4">
          <div className="bg-gray-50 rounded-lg p-3 border">
            <div className="flex items-center mb-3">
              <Avatar className="h-12 w-12 bg-gray-100 mr-3 flex-shrink-0">
                <AvatarImage src={selectedPair.item1.image} alt={selectedPair.item1.name} />
                <AvatarFallback>{selectedPair.item1.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{selectedPair.item1.name}</p>
                <p className="text-xs text-gray-600">Your Item</p>
              </div>
            </div>
            
            {/* Item details */}
            <div className="mb-3">
              <p className="text-gray-700 text-xs mt-1 bg-white p-2 rounded-md">
                Like new condition. This item has been gently used and well maintained. Perfect for anyone looking for a high-quality {selectedPair.item1.name.toLowerCase()} at a great value.
              </p>
            </div>
            
            {/* Feature badges */}
            <div className="grid grid-cols-2 gap-1.5 mb-2">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center mr-1">
                  <Check className="w-2 h-2 text-green-600" />
                </div>
                <span className="text-gray-800 text-xs">Brand New</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center mr-1">
                  <DollarSign className="w-2 h-2 text-green-600" />
                </div>
                <span className="text-gray-800 text-xs">$100 - $250</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center mr-1">
                  <Home className="w-2 h-2 text-blue-600" />
                </div>
                <span className="text-gray-800 text-xs">Home & Garden</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center mr-1">
                  <Utensils className="w-2 h-2 text-purple-600" />
                </div>
                <span className="text-gray-800 text-xs">Kitchen</span>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="item2" className="mt-4">
          <div className="bg-gray-50 rounded-lg p-3 border">
            <div className="flex items-center mb-3">
              <Avatar className="h-12 w-12 bg-gray-100 mr-3 flex-shrink-0">
                <AvatarImage src={selectedPair.item2.image} alt={selectedPair.item2.name} />
                <AvatarFallback>{selectedPair.item2.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{selectedPair.item2.name}</p>
                <p className="text-xs text-gray-600">Their Item</p>
              </div>
            </div>
            
            {/* Item details */}
            <div className="mb-3">
              <p className="text-gray-700 text-xs mt-1 bg-white p-2 rounded-md">
                Excellent condition. This {selectedPair.item2.name.toLowerCase()} has been well-cared for and is ready for a new home. Great quality and functionality.
              </p>
            </div>
            
            {/* Feature badges */}
            <div className="grid grid-cols-2 gap-1.5 mb-2">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center mr-1">
                  <Check className="w-2 h-2 text-green-600" />
                </div>
                <span className="text-gray-800 text-xs">Excellent</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center mr-1">
                  <DollarSign className="w-2 h-2 text-green-600" />
                </div>
                <span className="text-gray-800 text-xs">$150 - $300</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center mr-1">
                  <Home className="w-2 h-2 text-blue-600" />
                </div>
                <span className="text-gray-800 text-xs">Electronics</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center mr-1">
                  <Utensils className="w-2 h-2 text-purple-600" />
                </div>
                <span className="text-gray-800 text-xs">Tech</span>
              </div>
            </div>
            
            {/* Owner information */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center mb-2">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&h=250&auto=format&fit=crop" />
                  <AvatarFallback>EW</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-xs font-semibold">Emma Wilson</h4>
                  <div className="flex text-amber-400 text-xs">★★★★★ <span className="text-gray-500 ml-1">(42)</span></div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-2.5 w-2.5 mr-1" />
                  <span>Since 2023</span>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="h-2.5 w-2.5 mr-1" />
                  <span>2.3 mi away</span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-2.5 w-2.5 mr-1" />
                  <span>~1 hour</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TradeDetailsTabs;
