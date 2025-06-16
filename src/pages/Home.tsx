
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
import { isItemLiked, likeItem, unlikeItem } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

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
      image: "https://images.unsplash.com/photo-1461360228754-6e81c478b882",
      liked: false,
      category: "music"
    }
  ]);

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
  
  // Selected items state
  const [selectedUserItemId, setSelectedUserItemId] = useState<string>('');
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  
  // Get selected user item
  const selectedUserItem = userItems.find(item => item.id === selectedUserItemId) || null;
  
  // Get matches for selected item
  const { matches, loading: matchesLoading, error: matchesError } = useMatches(selectedUserItem);

  // Auto-select first user item when items load
  useEffect(() => {
    if (userItems.length > 0 && !selectedUserItemId) {
      setSelectedUserItemId(userItems[0].id);
    }
  }, [userItems, selectedUserItemId]);

  // Handle selecting a user item
  const handleSelectUserItem = (itemId: string) => {
    setSelectedUserItemId(itemId);
    setSelectedMatchId(null); // Clear match selection when changing user item
  };

  // Handle selecting a match
  const handleSelectMatch = (matchId: string) => {
    setSelectedMatchId(matchId);
  };

  // Handle liking matches
  const handleLikeMatch = async (itemId: string) => {
    if (!user || !supabaseConfigured) {
      toast({
        title: 'Please log in to like items.',
        variant: 'destructive',
      });
      return;
    }
    
    const match = matches.find(m => m.id === itemId);
    if (!match) return;
    
    const isCurrentlyLiked = match.liked;
    let success = false;
    
    if (isCurrentlyLiked) {
      success = await unlikeItem(itemId);
    } else {
      success = await likeItem(itemId);
    }
    
    if (success) {
      // The useMatches hook will automatically refresh, but we can provide immediate feedback
      toast({
        title: isCurrentlyLiked ? "Removed from favorites" : "Added to favorites",
        description: `${match.name} has been ${isCurrentlyLiked ? "removed from" : "added to"} your favorites.`,
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <HomeWithLocationFilter>
        <div className="flex-1 p-4 md:p-6 flex flex-col h-full">
          {/* Friend Items Carousel */}
          <div className="mb-6 h-80">
            <FriendItemsCarousel 
              items={friendItems} 
              onLikeItem={handleLikeFriendItem} 
            />
          </div>

          {/* Main Two-Column Layout */}
          <div className="flex-1 min-h-0">
            {user && supabaseConfigured ? (
              <div className="flex flex-col lg:flex-row gap-6 h-full">
                {/* Left Column - Your Items */}
                <div className="lg:w-2/5">
                  <h2 className="text-2xl font-bold mb-4">Your Items</h2>
                  {userItemsLoading ? (
                    <div className="flex justify-center items-center min-h-[200px]">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : userItemsError ? (
                    <div className="text-red-600 text-center">{userItemsError}</div>
                  ) : userItems.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p>You haven't posted any items yet.</p>
                      <p className="text-sm mt-2">Post an item to see matching opportunities!</p>
                    </div>
                  ) : (
                    <MyItems
                      items={userItems}
                      selectedItemId={selectedUserItemId}
                      onSelectItem={handleSelectUserItem}
                    />
                  )}
                </div>

                {/* Right Column - Matching Items */}
                <div className="lg:w-3/5">
                  {selectedUserItem ? (
                    <Matches
                      matches={matches}
                      selectedItemName={selectedUserItem.name}
                      selectedMatchId={selectedMatchId}
                      onSelectMatch={handleSelectMatch}
                    />
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <p>Select one of your items to see potential matches</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>Please log in to see your items and find matches</p>
              </div>
            )}
          </div>
        </div>
      </HomeWithLocationFilter>
    </div>
  );
};

export default Home;
