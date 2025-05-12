
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ProfileHeader from '@/components/profile/ProfileHeader';
import FriendRequestButton from '@/components/profile/FriendRequestButton';
import CompletedTradesTab from '@/components/profile/CompletedTradesTab';
import ReviewsTab from '@/components/profile/ReviewsTab';
import FriendsTab from '@/components/profile/FriendsTab';
import { Star, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import ItemDetails from '@/components/messages/details/ItemDetails';

// Import mock data
import { mockProfileData } from '@/data/mockProfileData';
import { myAvailableItems } from '@/data/mockMyItems';
import { myCompletedTrades } from '@/data/mockMyTrades';
import { myReviews } from '@/data/mockMyReviews';
import { myFriends } from '@/data/mockMyFriends';
import { Item } from '@/types/item';

const ProfileDuplicate: React.FC = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState('available');
  // State for selected item
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Function to navigate to specific tab
  const navigateToTab = (tabValue: string) => {
    setActiveTab(tabValue);
  };

  // Function to handle item click
  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
  };

  // Function to clear selected item
  const handleCloseItemDetails = () => {
    setSelectedItem(null);
  };

  return (
    <MainLayout>
      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        {/* Profile Header with Friend Request Button */}
        <div className="relative">
          <ProfileHeader 
            profile={mockProfileData} 
            friendCount={myFriends.length}
            onReviewsClick={() => navigateToTab('reviews')}
            onFriendsClick={() => navigateToTab('friends')}
          />
          <div className="absolute top-6 right-6">
            <FriendRequestButton userId="profile1" initialStatus="none" />
          </div>
        </div>

        {/* Tabs */}
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="w-full flex rounded-none h-12 bg-white border-b justify-start">
            <TabsTrigger 
              value="available" 
              className="flex-1 md:flex-none md:min-w-[180px] data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none data-[state=active]:shadow-none"
            >
              Items For Trade
            </TabsTrigger>
            <TabsTrigger 
              value="completed" 
              className="flex-1 md:flex-none md:min-w-[180px] data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none data-[state=active]:shadow-none"
            >
              Completed Trades
            </TabsTrigger>
            <TabsTrigger 
              value="reviews" 
              className="flex-1 md:flex-none md:min-w-[180px] data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none data-[state=active]:shadow-none"
            >
              <Star className="mr-2 h-4 w-4" />
              Reviews
            </TabsTrigger>
            <TabsTrigger 
              value="friends" 
              className="flex-1 md:flex-none md:min-w-[180px] data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none data-[state=active]:shadow-none"
            >
              <Users className="mr-2 h-4 w-4" />
              Friends
            </TabsTrigger>
          </TabsList>

          {/* Available Items Tab Content */}
          <TabsContent value="available" className="p-6">
            <div className="space-y-6">
              {/* Show items grid */}
              <ProfileItemsForTrade items={myAvailableItems} onItemClick={handleItemClick} />
              
              {/* Item Details Section - Show when an item is selected but in a compact format */}
              {selectedItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4" onClick={handleCloseItemDetails}>
                  <Card 
                    className="max-w-md w-full max-h-[80vh] overflow-y-auto bg-white rounded-lg shadow-xl" 
                    onClick={e => e.stopPropagation()}
                  >
                    <button 
                      className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                      onClick={handleCloseItemDetails}
                    >
                      ×
                    </button>
                    <div className="p-1">
                      <ItemDetails name={selectedItem.name} showProfileInfo={false} />
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Completed Trades Tab Content */}
          <TabsContent value="completed" className="p-6">
            <CompletedTradesTab trades={myCompletedTrades} />
          </TabsContent>
          
          {/* Reviews Tab Content */}
          <TabsContent value="reviews" className="p-6">
            <ReviewsTab reviews={myReviews} />
          </TabsContent>
          
          {/* Friends Tab Content */}
          <TabsContent value="friends" className="p-6">
            <FriendsTab friends={myFriends} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

// Create a new component for Items For Trade without edit functionality
const ProfileItemsForTrade: React.FC<{
  items: Item[];
  onItemClick: (item: Item) => void;
}> = ({ items, onItemClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map(item => (
        <Card 
          key={item.id} 
          className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onItemClick(item)}
        >
          <div className="aspect-[4/3] relative overflow-hidden">
            <img 
              src={item.image} 
              alt={item.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4">
            <h3 className="font-medium text-gray-800">{item.name}</h3>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ProfileDuplicate;
