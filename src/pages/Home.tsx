import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import FriendItemsCarousel from '@/components/profile/FriendItemsCarousel';
import HomeWithLocationFilter from '@/components/home/HomeWithLocationFilter';
import { useDbItems } from '@/hooks/useDbItems';
import { useUserItems } from '@/hooks/useUserItems';
import { useMatches } from '@/hooks/useMatches';
import ItemCard from '@/components/items/ItemCard';
import MyItems from '@/components/items/MyItems';
import Matches from '@/components/items/Matches';
import ExploreItemModal from '@/components/items/ExploreItemModal';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { MatchItem } from '@/types/item';

const Home: React.FC = () => {
  // Friend/fake items remain only for the top carousel demo
  const [friendItems, setFriendItems] = useState([
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
      image: "https://images.unsplash.com/photo-1461360228754-6e81c478b862",
      liked: false,
      category: "music"
    }
  ]);

  // Sample matches for testing
  const sampleMatches: MatchItem[] = [
    {
      id: "m1",
      name: "Professional DSLR Camera",
      image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a",
      liked: false,
      category: "photography",
      condition: "excellent",
      description: "Canon EOS R5 with 24-70mm lens, barely used, perfect for professional photography."
    },
    {
      id: "m2",
      name: "Vintage Guitar Amp",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
      liked: false,
      category: "music",
      condition: "good",
      description: "Classic tube amp from the 70s, great warm sound for studio recordings."
    },
    {
      id: "m3",
      name: "MacBook Pro 16-inch",
      image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef",
      liked: false,
      category: "electronics",
      condition: "excellent",
      description: "M1 Pro chip, 32GB RAM, 1TB SSD. Perfect for creative work and development."
    },
    {
      id: "m4",
      name: "Artisan Coffee Maker",
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
      liked: false,
      category: "home",
      condition: "like-new",
      description: "Professional espresso machine with built-in grinder, makes café-quality coffee."
    },
    {
      id: "m5",
      name: "Designer Handbag",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
      liked: false,
      category: "fashion",
      condition: "excellent",
      description: "Limited edition designer bag, authentic with original packaging and certificates."
    },
    {
      id: "m6",
      name: "Gaming Setup Complete",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e",
      liked: false,
      category: "electronics",
      condition: "good",
      description: "High-end gaming PC with RTX 4080, 32GB RAM, mechanical keyboard and gaming mouse."
    }
  ];

  // Define handler for liking friend items (local state only)
  const handleLikeFriendItem = (itemId: string) => {
    setFriendItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, liked: !item.liked } : item
      )
    );
    const toggled = friendItems.find(item => item.id === itemId)?.liked;
    toast({
      title: toggled ? "Removed from favorites" : "Added to favorites",
      description: `Item has been ${toggled ? "removed from" : "added to"} your favorites.`,
    });
  };

  // User's items and matching functionality
  const { user, supabaseConfigured } = useAuth();
  const { items: userItems, loading: userItemsLoading, error: userItemsError } = useUserItems();
  
  // Selected items state - auto-select first item
  const [selectedUserItemId, setSelectedUserItemId] = useState<string>('');
  
  // Auto-select first item when userItems are loaded
  useEffect(() => {
    if (userItems.length > 0 && !selectedUserItemId) {
      setSelectedUserItemId(userItems[0].id);
    }
  }, [userItems, selectedUserItemId]);
  
  // Get selected user item
  const selectedUserItem = userItems.find(item => item.id === selectedUserItemId) || null;
  
  // Get matches for selected item (real matches from DB)
  const { matches: dbMatches, loading: matchesLoading, error: matchesError } = useMatches(selectedUserItem);

  // Combine real matches with sample matches for testing (but prioritize real matches)
  const matches = selectedUserItem ? [...dbMatches, ...sampleMatches.slice(0, 3)] : [];

  // Handle selecting a user item
  const handleSelectUserItem = (itemId: string) => {
    setSelectedUserItemId(itemId);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <HomeWithLocationFilter>
        <div className="flex-1 p-4 md:p-6 flex flex-col h-full">
          {/* Friend Items Carousel */}
          <div className="mb-6 h-64">
            <FriendItemsCarousel 
              items={friendItems} 
              onLikeItem={handleLikeFriendItem} 
            />
          </div>

          {/* Main Two-Column Layout */}
          <div className="flex-1 min-h-0">
            {user && supabaseConfigured ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                {/* Left Column - Your Items */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Items</h2>
                  {userItemsLoading ? (
                    <div className="flex justify-center items-center min-h-[300px]">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : userItemsError ? (
                    <div className="text-red-600 text-center bg-red-50 p-4 rounded-lg text-sm">{userItemsError}</div>
                  ) : userItems.length === 0 ? (
                    <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">
                      <div className="text-4xl mb-3">📦</div>
                      <p className="text-base font-medium mb-1">No items yet</p>
                      <p className="text-sm">Post an item to see matches!</p>
                    </div>
                  ) : (
                    <MyItems
                      items={userItems}
                      selectedItemId={selectedUserItemId}
                      onSelectItem={handleSelectUserItem}
                    />
                  )}
                </div>

                {/* Right Column - Matches */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
                  {selectedUserItem ? (
                    <Matches
                      matches={matches}
                      selectedItemName={selectedUserItem.name}
                    />
                  ) : (
                    <div className="h-full flex flex-col">
                      <h2 className="text-2xl font-bold mb-4 text-gray-800">Matches</h2>
                      <div className="flex-1">
                        <Matches
                          matches={sampleMatches}
                          selectedItemName="Sample Item"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="text-4xl mb-3">🔐</div>
                <p className="text-base font-medium mb-1">Please log in</p>
                <p className="text-sm">Sign in to see your items and find matches</p>
              </div>
            )}
          </div>
        </div>
      </HomeWithLocationFilter>
    </div>
  );
};

export default Home;
