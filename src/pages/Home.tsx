import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import MyItems from '@/components/items/MyItems';
import Matches from '@/components/items/Matches';
import { Item, MatchItem } from '@/types/item';
import FriendItemsCarousel from '@/components/profile/FriendItemsCarousel';
import HomeWithLocationFilter from '@/components/home/HomeWithLocationFilter';
import { useDbItems } from '@/hooks/useDbItems';

const Home: React.FC = () => {
  // Friend/fake items remain for carousel demo only
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

  // My user-created items (still demo for now)
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
    }
  ];

  // Fetch all items from DB to show as Matches
  const { items: dbItems, loading: dbItemsLoading, error: dbItemsError } = useDbItems();

  // State for selecting my item
  const [selectedItemId, setSelectedItemId] = useState<string>('1');
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  // Like tracking now handled per-match component for DB items

  // Find selected item (still demo, modifiable if you want to fetch your own items from DB)
  const selectedItem = myItems.find(item => item.id === selectedItemId);

  // Only show matches with a matching category to the "selected item" (remains as logic)
  const filteredMatches = dbItems.filter(dbItem =>
    selectedItem ? dbItem.category === selectedItem.category : true
  );

  // Handle selection
  const handleSelectItem = (id: string) => {
    setSelectedItemId(id);
    setSelectedMatchId(null);
  };
  const handleSelectMatch = (id: string) => setSelectedMatchId(id || null);

  // Friend items like/unlike (mock, unchanged)
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
      <HomeWithLocationFilter>
        <div className="flex-1 p-4 md:p-6 flex flex-col h-full">
          <div className="mb-8 h-96">
            <FriendItemsCarousel 
              items={friendItems} 
              onLikeItem={handleLikeFriendItem} 
            />
          </div>
          <div className="flex-1 min-h-0">
            {dbItemsLoading ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : dbItemsError ? (
              <div className="text-red-600 text-center">{dbItemsError}</div>
            ) : (
              <Matches 
                matches={filteredMatches}
                selectedItemName={selectedItem?.name || ''}
                selectedMatchId={selectedMatchId}
                onSelectMatch={handleSelectMatch}
              />
            )}
          </div>
        </div>
      </HomeWithLocationFilter>
    </div>
  );
};

export default Home;
