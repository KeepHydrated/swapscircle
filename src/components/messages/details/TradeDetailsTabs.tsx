
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TradeDetailsTabs;
