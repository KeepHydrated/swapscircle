
import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import MyItems from '@/components/items/MyItems';
import Matches from '@/components/items/Matches';
import { Item, MatchItem } from '@/types/item';
import FriendItemsCarousel from '@/components/profile/FriendItemsCarousel';

const Home: React.FC = () => {
  // Sample data for friends' items
  const [friendItems, setFriendItems] = useState<MatchItem[]>([
    {
      id: "f1",
      name: "Vintage Camera Collection",
      image: "https://images.unsplash.com/photo-1452780212940-6f5c0d14d848",
      liked: false,
      category: "photography"
    },
    {
      id: "f2",
      name: "Handcrafted Leather Journal",
      image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f",
      liked: true,
      category: "crafts"
    },
    {
      id: "f3",
      name: "Mid-Century Modern Lamp",
      image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15",
      liked: false,
      category: "home"
    },
    {
      id: "f4",
      name: "Vintage Wristwatch",
      image: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade",
      liked: false,
      category: "accessories"
    },
    {
      id: "f5",
      name: "Antique Typewriter",
      image: "https://images.unsplash.com/photo-1558522195-e1201b090344",
      liked: false,
      category: "collectibles"
    },
    {
      id: "f6",
      name: "Rare Comic Book Collection",
      image: "https://images.unsplash.com/photo-1608889825205-eebdb9fc5806",
      liked: true,
      category: "collectibles"
    },
    {
      id: "f7",
      name: "Vintage Record Player",
      image: "https://images.unsplash.com/photo-1461360228754-6e81c478b882",
      liked: false,
      category: "music"
    }
  ]);

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
    // Photography matches - added more vintage camera matches
    { id: '1', name: 'DSLR Camera', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32', liked: false, category: 'photography' },
    { id: '2', name: 'Polaroid Camera', image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f', liked: false, category: 'photography' },
    { id: '3', name: 'Photography Light', image: 'https://images.unsplash.com/photo-1587614202459-6e6aa7c5aee2', liked: false, category: 'photography' },
    { id: '4', name: 'Camera Tripod', image: 'https://images.unsplash.com/photo-1557513952-68e6c52558f3', liked: false, category: 'photography' },
    { id: '5', name: 'Camera Lens', image: 'https://images.unsplash.com/photo-1617005082094-97ea0afcd450', liked: false, category: 'photography' },
    { id: '20', name: 'Vintage Film Reel', image: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a', liked: false, category: 'photography' },
    { id: '21', name: 'Photo Printer', image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3', liked: false, category: 'photography' },
    { id: '22', name: 'Lens Filters', image: 'https://images.unsplash.com/photo-1623841675698-8aac12636480', liked: false, category: 'photography' },
    { id: '23', name: 'Camera Bag', image: 'https://images.unsplash.com/photo-1622560480654-d96214fdc887', liked: false, category: 'photography' },
    { id: '24', name: 'Lighting Kit', image: 'https://images.unsplash.com/photo-1595859703065-2259982784bb', liked: false, category: 'photography' },
    { id: '25', name: 'Studio Backdrop', image: 'https://images.unsplash.com/photo-1541534401786-2077eed87a74', liked: false, category: 'photography' },
    { id: '26', name: 'Vintage Photo Album', image: 'https://images.unsplash.com/photo-1590346346857-42964385b56a', liked: false, category: 'photography' },
    
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
  // State to track matched/liked items
  const [likedItemIds, setLikedItemIds] = useState<string[]>([]);
  
  // Load liked items from localStorage on component mount
  useEffect(() => {
    const savedLikedItems = localStorage.getItem('likedItems');
    if (savedLikedItems) {
      setLikedItemIds(JSON.parse(savedLikedItems));
    }
  }, []);
  
  // Update local storage when liked items change
  useEffect(() => {
    localStorage.setItem('likedItems', JSON.stringify(likedItemIds));
  }, [likedItemIds]);
  
  // Find the selected item
  const selectedItem = myItems.find(item => item.id === selectedItemId);
  
  // Mark items as liked from the saved list
  const updatedMatches = allMatches.map(match => ({
    ...match,
    liked: likedItemIds.includes(match.id)
  }));
  
  // Filter matches based on the selected item's category
  const filteredMatches = selectedItem 
    ? updatedMatches.filter(match => match.category === selectedItem.category)
    : updatedMatches.filter(match => match.category === 'photography'); // Default to photography

  // Handle item selection
  const handleSelectItem = (id: string) => {
    setSelectedItemId(id); // Removed default to prevent going back to first item
    // Clear selected match when changing items
    setSelectedMatchId(null);
  };

  // Handle match selection
  const handleSelectMatch = (id: string) => {
    setSelectedMatchId(id || null); // Set to null if empty string
  };

  // Handle liking a friend's item
  const handleLikeFriendItem = (itemId: string) => {
    setFriendItems(items => 
      items.map(item => 
        item.id === itemId ? { ...item, liked: !item.liked } : item
      )
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 p-4 md:p-6">
        {/* Friend's Items Section */}
        <div className="mb-8">
          <FriendItemsCarousel 
            items={friendItems} 
            onLikeItem={handleLikeFriendItem} 
          />
        </div>

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
