
import React, { useEffect, useState } from 'react';
import ItemConnection from './ItemConnection';
import ItemCarousel from './ItemCarousel';
import ItemDetails from './ItemDetails';

// Define the interfaces for the props
interface DetailsPanelProps {
  selectedPair?: {
    id: number;
    item1: { name: string; image: string };
    item2: { name: string; image: string };
  } | null;
}

const DetailsPanel = ({ selectedPair }: DetailsPanelProps = {}) => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<'item1' | 'item2'>('item1');
  
  // Sample image placeholders for the carousel
  useEffect(() => {
    if (!selectedPair) return;
    
    // Use selected item images and add some placeholder images
    const selectedItemImage = selectedPair[selectedItem].image || "/placeholder.svg";
    const urls = [
      selectedItemImage,
      "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
      "https://images.unsplash.com/photo-1487887235947-a955ef187fcc",
    ];
    setImageUrls(urls);
  }, [selectedPair, selectedItem]);

  const handleSelectItem = (item: 'item1' | 'item2') => {
    setSelectedItem(item);
  };
  
  return (
    <div className="hidden lg:flex lg:flex-col w-80 border-l border-gray-200 bg-white">
      {/* Item connection display at the top of the right panel */}
      {selectedPair && (
        <ItemConnection 
          selectedPair={selectedPair} 
          selectedItem={selectedItem}
          onSelectItem={handleSelectItem}
        />
      )}
      
      {/* Image Carousel - made smaller */}
      <div className="flex-1 flex flex-col">
        <ItemCarousel imageUrls={imageUrls} />
        
        {/* Product details section */}
        <ItemDetails 
          name={selectedPair ? selectedPair[selectedItem].name : undefined}
        />
      </div>
    </div>
  );
};

export default DetailsPanel;
