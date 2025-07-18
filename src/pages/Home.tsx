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
  // Friend items - empty for now
  const [friendItems, setFriendItems] = useState([]);


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

  // Use only real matches from database
  const matches = selectedUserItem ? dbMatches : [];

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
                      <div className="flex-1 flex flex-col justify-center items-center text-center text-gray-500 py-8">
                        <div className="text-4xl mb-3">🔍</div>
                        <p className="text-base font-medium mb-1">No item selected</p>
                        <p className="text-sm">Select an item to see matches</p>
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
