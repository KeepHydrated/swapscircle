
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ProfileHeader from '@/components/profile/ProfileHeader';
import FriendRequestButton from '@/components/profile/FriendRequestButton';
import CompletedTradesTab from '@/components/profile/CompletedTradesTab';
import ReviewsTab from '@/components/profile/ReviewsTab';
import FriendsTab from '@/components/profile/FriendsTab';
import { Star, Users } from 'lucide-react';
import { Item, MatchItem } from '@/types/item';
import ItemDetailsPopup from '@/components/profile/carousel/ItemDetailsPopup';

// Import mock data
import { myAvailableItems } from '@/data/mockMyItems';
import { myCompletedTrades } from '@/data/mockMyTrades';
import { myReviews } from '@/data/mockMyReviews';
import { myFriends } from '@/data/mockMyFriends';
import { mockUserItems } from '@/data/mockUsers';

// Create a different profile for this page
const otherPersonProfileData = {
  name: "Jordan Taylor",
  description: "Tech gadget enthusiast with a passion for photography. I collect vintage cameras and modern tech accessories. Looking to trade with fellow collectors who appreciate quality items!",
  rating: 4.8,
  reviewCount: 92,
  location: "Seattle, WA",
  memberSince: "2023"
};

const OtherPersonProfile: React.FC = () => {
  // Combine items from myAvailableItems and mockUserItems to get 10 items total
  const combinedItems = [...myAvailableItems, ...Object.values(mockUserItems).flat()].slice(0, 10);
  const itemsAsMatchItems: MatchItem[] = combinedItems.map(item => ({...item, liked: false}));

  // State for active tab
  const [activeTab, setActiveTab] = useState('available');
  // State for selected item
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  // State for popup
  const [popupItem, setPopupItem] = useState<MatchItem | null>(null);

  // Function to navigate to specific tab
  const navigateToTab = (tabValue: string) => {
    setActiveTab(tabValue);
  };

  // Function to handle item click
  const handleItemClick = (item: Item) => {
    setSelectedItem(prevItem => prevItem?.id === item.id ? null : item);
    
    // Find the item in our match items list
    const matchItem = itemsAsMatchItems.find(match => match.id === item.id);
    if (matchItem) {
      setPopupItem(matchItem);
    }
  };

  // Handle popup close
  const handlePopupClose = () => {
    setPopupItem(null);
  };
  
  // Handle like item in popup
  const handlePopupLikeClick = (item: MatchItem) => {
    // Update the liked status in our items list
    const updatedItems = itemsAsMatchItems.map(i => 
      i.id === item.id ? {...i, liked: !i.liked} : i
    );
    
    // Close the popup
    setPopupItem(null);
  };

  return (
    <MainLayout>
      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        {/* Profile Header with Friend Request Button */}
        <div className="relative">
          <ProfileHeader 
            profile={otherPersonProfileData} 
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {combinedItems.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => handleItemClick(item)}
                    className="cursor-pointer"
                  >
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full aspect-square object-cover rounded-md"
                    />
                    <h3 className="mt-2 font-medium text-sm">{item.name}</h3>
                  </div>
                ))}
              </div>
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

      {/* Item Details Popup */}
      {popupItem && (
        <ItemDetailsPopup 
          item={popupItem}
          isOpen={!!popupItem}
          onClose={handlePopupClose}
          onLikeClick={handlePopupLikeClick}
        />
      )}
    </MainLayout>
  );
};

export default OtherPersonProfile;
