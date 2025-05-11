
import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import MyItems from '@/components/items/MyItems';
import Matches from '@/components/items/Matches';
import { Item, MatchItem } from '@/types/item';

const Home: React.FC = () => {
  // Sample data for my items with added details
  const myItems: Item[] = [
    { 
      id: '1', 
      name: 'Vintage Camera', 
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32', 
      category: 'photography',
      condition: 'Brand New',
      description: 'Like new condition. This item has been gently used and well maintained. Perfect for anyone looking for a high-quality vintage camera at a great value.',
      tags: ['Electronics', 'Photography', 'Collectibles'],
      priceRange: '$100 - $250'
    },
    { 
      id: '2', 
      name: 'Mountain Bike', 
      image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e', 
      category: 'sports',
      condition: 'Brand New',
      description: 'Like new condition. This item has been gently used and well maintained. Perfect for anyone looking for a high-quality mountain bike at a great value.',
      tags: ['Sports', 'Outdoors', 'Cycling'],
      priceRange: '$200 - $500'
    },
    { 
      id: '3', 
      name: 'Acoustic Guitar', 
      image: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f', 
      category: 'music',
      condition: 'Brand New',
      description: 'Like new condition. This item has been gently used and well maintained. Perfect for anyone looking for a high-quality acoustic guitar at a great value.',
      tags: ['Music', 'Instruments', 'Entertainment'],
      priceRange: '$150 - $350'
    },
    { 
      id: '4', 
      name: 'Laptop', 
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853', 
      category: 'electronics',
      condition: 'Brand New',
      description: 'Like new condition. This item has been gently used and well maintained. Perfect for anyone looking for a high-quality laptop at a great value.',
      tags: ['Electronics', 'Computers', 'Office'],
      priceRange: '$300 - $800'
    },
  ];

  // Sample data for all possible matches
  const allMatches: MatchItem[] = [
    // Photography matches
    { id: '1', name: 'DSLR Camera', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32', liked: false, category: 'photography' },
    { id: '2', name: 'Polaroid Camera', image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f', liked: false, category: 'photography' },
    { id: '3', name: 'Photography Light', image: 'https://images.unsplash.com/photo-1587614202459-6e6aa7c5aee2', liked: false, category: 'photography' },
    { id: '4', name: 'Camera Tripod', image: 'https://images.unsplash.com/photo-1557513952-68e6c52558f3', liked: false, category: 'photography' },
    { id: '5', name: 'Camera Lens', image: 'https://images.unsplash.com/photo-1617005082094-97ea0afcd450', liked: false, category: 'photography' },
    
    // Sports matches
    { id: '6', name: 'Skateboard', image: 'https://images.unsplash.com/photo-1572506026207-3a3c2e88eb6d', liked: false, category: 'sports' },
    { id: '7', name: 'Surfboard', image: 'https://images.unsplash.com/photo-1531722569936-825d3dd91b15', liked: false, category: 'sports' },
    { id: '8', name: 'Snowboard', image: 'https://images.unsplash.com/photo-1514917595083-c60c4dd11569', liked: false, category: 'sports' },
    
    // Music matches
    { id: '9', name: 'Electric Guitar', image: 'https://images.unsplash.com/photo-1550291652-6ea9114a47b1', liked: false, category: 'music' },
    { id: '10', name: 'Synthesizer', image: 'https://images.unsplash.com/photo-1525373612132-b3e820b87cea', liked: false, category: 'music' },
    { id: '11', name: 'Drum Set', image: 'https://images.unsplash.com/photo-1543443258-92b04ad5ec4b', liked: false, category: 'music' },
    
    // Electronics matches
    { id: '12', name: 'Mechanical Keyboard', image: 'https://images.unsplash.com/photo-1595044426076-d0d745e7c5cc', liked: false, category: 'electronics' },
    { id: '13', name: 'Monitor', image: 'https://images.unsplash.com/photo-1616763355548-1b606f439f86', liked: false, category: 'electronics' },
    { id: '14', name: 'Wireless Headphones', image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b', liked: false, category: 'electronics' },
  ];

  // State for tracking the currently selected item
  const [selectedItemId, setSelectedItemId] = useState<string>('1');
  // State for tracking the selected match item
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  
  // Find the selected item
  const selectedItem = myItems.find(item => item.id === selectedItemId);
  
  // Filter matches based on the selected item's category
  const filteredMatches = selectedItem 
    ? allMatches.filter(match => match.category === selectedItem.category)
    : allMatches.filter(match => match.category === 'photography'); // Default to photography

  // Handle item selection
  const handleSelectItem = (id: string) => {
    setSelectedItemId(id);
    // Clear selected match when changing items
    setSelectedMatchId(null);
  };

  // Handle match selection
  const handleSelectMatch = (id: string) => {
    setSelectedMatchId(selectedMatchId === id ? null : id);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* My Items Component */}
          <MyItems 
            items={myItems} 
            selectedItemId={selectedItemId}
            onSelectItem={handleSelectItem}
          />

          {/* Matches Component */}
          <Matches 
            matches={filteredMatches}
            selectedItemName={selectedItem?.name || ''}
            selectedMatchId={selectedMatchId}
            onSelectMatch={handleSelectMatch}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
