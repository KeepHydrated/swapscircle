
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
    setSelectedItem(prevItem => prevItem?.id === item.id ? null : item);
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
              <ProfileItemsForTrade items={myAvailableItems} onItemClick={handleItemClick} selectedItem={selectedItem} />
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
  selectedItem: Item | null;
}> = ({ items, onItemClick, selectedItem }) => {
  // Function to determine if an item should show the dropdown
  const shouldShowDropdown = (index: number) => {
    if (!selectedItem) return false;
    return items.findIndex(item => item.id === selectedItem.id) === index;
  };
  
  // Calculate column position for each item (0 for even, 1 for odd)
  const getColumnPosition = (index: number) => {
    return index % 2 === 0 ? 0 : 1;
  };
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item, index) => {
        // Determine if this item should display its dropdown
        const showDropdown = shouldShowDropdown(index);
        // Get column position (0 or 1)
        const colPosition = getColumnPosition(index);
        
        return (
          <div key={item.id} className="flex flex-col">
            <Card 
              className={`overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${
                selectedItem?.id === item.id ? 'ring-2 ring-primary shadow-md' : ''
              }`}
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
          </div>
        );
      })}
      
      {/* Separate details dropdown that spans two columns */}
      {selectedItem && (
        <div className="sm:col-span-2 lg:col-span-2 xl:col-span-2 -mt-4 z-10">
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden mt-2">
            <ItemDetails name={selectedItem.name} showProfileInfo={false} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDuplicate;
