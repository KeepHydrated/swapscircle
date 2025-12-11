
import React, { useState } from 'react';
import TradeDetailsTabs from './TradeDetailsTabs';

// Define the interfaces for the props
interface DetailsPanelProps {
  selectedPair?: {
    id: number;
    item1: { 
      name: string; 
      image: string;
      image_url?: string;
      image_urls?: string[];
      price_range_min?: number;
      price_range_max?: number;
      condition?: string;
      category?: string;
    };
    item1Items?: { 
      name: string; 
      image: string;
      image_url?: string;
      image_urls?: string[];
      price_range_min?: number;
      price_range_max?: number;
      condition?: string;
      category?: string;
    }[];
    item2: { 
      name: string; 
      image: string;
      image_url?: string;
      image_urls?: string[];
      price_range_min?: number;
      price_range_max?: number;
      condition?: string;
      category?: string;
    };
    partnerId: string;
    partnerProfile?: {
      id: string;
      username: string;
      avatar_url?: string;
      created_at: string;
      location?: string;
    };
  } | null;
}

const DetailsPanel = ({ selectedPair }: DetailsPanelProps = {}) => {
  const [selectedItem, setSelectedItem] = useState<'item1' | 'item2'>('item2');

  const handleSelectItem = (item: 'item1' | 'item2') => {
    setSelectedItem(item);
  };
  
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Trade Details Tabs - handles all item display including images */}
      {selectedPair && (
        <TradeDetailsTabs 
          selectedPair={selectedPair}
          selectedItem={selectedItem}
          onSelectItem={handleSelectItem}
        />
      )}
      
      {/* Empty state when no pair selected */}
      {!selectedPair && (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <span>Select a conversation to view trade details</span>
        </div>
      )}
    </div>
  );
};

export default DetailsPanel;
