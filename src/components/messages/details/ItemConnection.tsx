
import React from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ItemConnectionProps {
  selectedPair: {
    id: number;
    item1: { name: string; image: string };
    item2: { name: string; image: string };
  };
  selectedItem: 'item1' | 'item2';
  onSelectItem: (item: 'item1' | 'item2') => void;
}

const ItemConnection = ({ selectedPair, selectedItem, onSelectItem }: ItemConnectionProps) => {
  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex flex-row items-center justify-between bg-gray-200 px-3 py-3 rounded-md mb-4 h-20">
        {/* Their item (left) - clickable */}
        <div 
          className={`flex flex-col items-center cursor-pointer transition-all w-[40%] ${selectedItem === 'item2' ? 'scale-105' : 'opacity-80 hover:opacity-100'}`}
          onClick={() => onSelectItem('item2')}
        >
          <div className={`p-0.5 rounded-full ${selectedItem === 'item2' ? 'bg-blue-100' : ''}`}>
            <Avatar className="h-12 w-12 bg-gray-100">
              <AvatarImage src={selectedPair.item2.image} alt={selectedPair.item2.name} />
              <AvatarFallback>{selectedPair.item2.name[0]}</AvatarFallback>
            </Avatar>
          </div>
          <span className={`text-xs mt-1 truncate w-full text-center ${selectedItem === 'item2' ? 'font-bold text-blue-700' : 'text-gray-700'}`}>
            {selectedPair.item2.name}
          </span>
        </div>
        
        {/* Exchange icon */}
        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100">
          <ArrowLeftRight className="h-3 w-3 text-blue-600" />
        </div>
        
        {/* Your item (right) - clickable */}
        <div 
          className={`flex flex-col items-center cursor-pointer transition-all w-[40%] ${selectedItem === 'item1' ? 'scale-105' : 'opacity-80 hover:opacity-100'}`}
          onClick={() => onSelectItem('item1')}
        >
          <div className={`p-0.5 rounded-full ${selectedItem === 'item1' ? 'bg-blue-100' : ''}`}>
            <Avatar className="h-12 w-12 bg-gray-100">
              <AvatarImage src={selectedPair.item1.image} alt={selectedPair.item1.name} />
              <AvatarFallback>{selectedPair.item1.name[0]}</AvatarFallback>
            </Avatar>
          </div>
          <span className={`text-xs mt-1 truncate w-full text-center ${selectedItem === 'item1' ? 'font-bold text-blue-700' : 'text-gray-700'}`}>
            {selectedPair.item1.name}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ItemConnection;
