
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileItemsManager from '@/components/profile/ProfileItemsManager';
import CompletedTradesTab from '@/components/profile/CompletedTradesTab';
import ReviewsTab from '@/components/profile/ReviewsTab';
import FriendsTab from '@/components/profile/FriendsTab';
import { Star, Users } from 'lucide-react';
import { MatchItem } from '@/types/item';
import ItemDetailsPopup from '@/components/profile/carousel/ItemDetailsPopup';

// Import mock data
import { mockProfileData } from '@/data/mockProfileData';
import { myAvailableItems } from '@/data/mockMyItems';
import { myCompletedTrades } from '@/data/mockMyTrades';
import { myReviews } from '@/data/mockMyReviews';
import { myFriends } from '@/data/mockMyFriends';

const Profile: React.FC = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState('available');
  // State for popup
  const [popupItem, setPopupItem] = useState<MatchItem | null>(null);

  // Function to navigate to specific tab
  const navigateToTab = (tabValue: string) => {
    setActiveTab(tabValue);
  };

  // Convert items to MatchItem type to use with popup
  const itemsAsMatchItems = myAvailableItems.map(item => ({...item, liked: false}));
  
  // Handle item click for popup
  const handleItemClick = (itemId: string) => {
    const item = itemsAsMatchItems.find(i => i.id === itemId);
    if (item) {
      setPopupItem(item);
    }
  };
  
  // Handle popup close
  const handlePopupClose = () => {
    setPopupItem(null);
  };

  return (
    <MainLayout>
      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        {/* Profile Header */}
        <ProfileHeader 
          profile={mockProfileData} 
          friendCount={myFriends.length}
          onReviewsClick={() => navigateToTab('reviews')}
          onFriendsClick={() => navigateToTab('friends')}
        />

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
            <ProfileItemsManager initialItems={myAvailableItems} onItemClick={handleItemClick} />
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
          canEdit={true} // Allow editing for own items
        />
      )}
    </MainLayout>
  );
};

export default Profile;
