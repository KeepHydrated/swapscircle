
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ProfileHeader from '@/components/profile/ProfileHeader';
import FriendRequestButton from '@/components/profile/FriendRequestButton';
import { Star } from 'lucide-react';
import { MatchItem } from '@/types/item';
import ItemDetailsPopup from '@/components/profile/carousel/ItemDetailsPopup';
import { otherPersonProfileData, getOtherPersonItems } from '@/data/otherPersonProfileData';
import ReviewsTab from '@/components/profile/ReviewsTab';
import { myReviews } from '@/data/mockMyReviews';

const OtherPersonProfile: React.FC = () => {
  // Convert items to MatchItems
  const itemsAsMatchItems: MatchItem[] = getOtherPersonItems().map(item => ({...item, liked: false}));

  // State for active tab
  const [activeTab, setActiveTab] = useState('available');
  // State for popup
  const [popupItem, setPopupItem] = useState<MatchItem | null>(null);

  // Function to navigate to specific tab
  const navigateToTab = (tabValue: string) => {
    setActiveTab(tabValue);
  };

  // Handle popup close
  const handlePopupClose = () => {
    setPopupItem(null);
  };
  
  // Handle item click
  const handleItemClick = (item: MatchItem) => {
    setPopupItem(item);
  };
  
  // Handle like item in popup
  const handlePopupLikeClick = (item: MatchItem) => {
    // Logic to handle liking an item would go here
    // Close the popup after liking
    setPopupItem(null);
  };

  return (
    <MainLayout>
      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        {/* Profile Header with Friend Request Button */}
        <div className="relative">
          <ProfileHeader 
            profile={otherPersonProfileData} 
            friendCount={otherPersonProfileData.friendCount}
            onReviewsClick={() => navigateToTab('reviews')}
          />
          <div className="absolute top-6 right-6">
            <FriendRequestButton userId="profile1" initialStatus="none" />
          </div>
        </div>

        {/* Tabs with sticky header */}
        <div className="sticky top-16 bg-white z-10">
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
            </TabsList>
          </Tabs>
        </div>

        {/* Available Items Tab Content */}
        <TabsContent value="available" className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {itemsAsMatchItems.map((item) => (
              <div 
                key={item.id} 
                onClick={() => handleItemClick(item)}
                className="cursor-pointer group"
              >
                <div className="relative aspect-square overflow-hidden rounded-md">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-2 font-medium text-sm truncate">{item.name}</h3>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Completed Trades Tab Content */}
        <TabsContent value="completed" className="p-6">
          <p className="text-muted-foreground">This user's completed trades will appear here.</p>
        </TabsContent>
        
        {/* Reviews Tab Content */}
        <TabsContent value="reviews" className="p-6">
          <ReviewsTab reviews={myReviews} />
        </TabsContent>
      </div>

      {/* Item Details Popup - no edit controls for other person's items */}
      {popupItem && (
        <ItemDetailsPopup 
          item={popupItem}
          isOpen={!!popupItem}
          onClose={handlePopupClose}
          onLikeClick={handlePopupLikeClick}
          showProfileInfo={false}
        />
      )}
    </MainLayout>
  );
};

export default OtherPersonProfile;
