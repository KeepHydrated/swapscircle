
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ItemsForTradeTab from '@/components/profile/ItemsForTradeTab';
import CompletedTradesTab from '@/components/profile/CompletedTradesTab';
import ReviewsTab from '@/components/profile/ReviewsTab';
import FriendsTab from '@/components/profile/FriendsTab';
import { Star, Users, ArrowLeft } from 'lucide-react';
import FriendRequestButton, { FriendRequestStatus } from '@/components/profile/FriendRequestButton';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { mockUsers, mockUserItems, mockUserTrades } from '@/data/mockUsers';
import { ProfileUser } from '@/types/profile';

// Separate data into dedicated files
import { getUserReviews } from '@/data/mockReviews';
import { getUserFriends } from '@/data/mockFriends';

const OtherProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  // Default to user1 if no userId is provided
  const safeUserId = userId || "user1";
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('available');
  
  // Get user data
  const [profile, setProfile] = useState<ProfileUser | undefined>(mockUsers[safeUserId as keyof typeof mockUsers]);
  
  // Get user's items for trade
  const [availableItems, setAvailableItems] = useState(
    mockUserItems[safeUserId as keyof typeof mockUserItems] || []
  );
  
  // Get user's completed trades
  const completedTrades = mockUserTrades[safeUserId as keyof typeof mockUserTrades] || [];

  // Get user's reviews and friends
  const reviews = getUserReviews(safeUserId);
  const friends = getUserFriends(safeUserId);

  const handleGoBack = () => {
    navigate(-1);
  };

  // Handle friend request status change
  const handleFriendStatusChange = (status: FriendRequestStatus) => {
    if (profile) {
      setProfile({
        ...profile,
        friendStatus: status
      });
    }
  };

  if (!profile) {
    return (
      <MainLayout>
        <div className="p-6">
          <h1>User not found</h1>
          <Button onClick={handleGoBack}>Go Back</Button>
        </div>
      </MainLayout>
    );
  }

  const handleItemClick = () => {}; // Empty function for ItemsForTradeTab

  return (
    <MainLayout>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" onClick={handleGoBack} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{profile.name}'s Profile</h1>
            <p className="text-muted-foreground mt-1">View their items and trade history</p>
          </div>
        </div>
        <div>
          <FriendRequestButton 
            userId={profile.id} 
            initialStatus={profile.friendStatus}
            onStatusChange={handleFriendStatusChange}
          />
        </div>
      </div>
      
      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        {/* Profile Header */}
        <ProfileHeader 
          profile={{
            name: profile.name,
            description: profile.description,
            rating: profile.rating,
            reviewCount: profile.reviewCount,
            location: profile.location,
            memberSince: profile.memberSince,
          }}
          friendCount={friends.length}
          onReviewsClick={() => setActiveTab('reviews')}
          onFriendsClick={() => setActiveTab('friends')}
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
            <ItemsForTradeTab items={availableItems} onItemClick={handleItemClick} />
          </TabsContent>

          {/* Completed Trades Tab Content */}
          <TabsContent value="completed" className="p-6">
            <CompletedTradesTab trades={completedTrades} />
          </TabsContent>
          
          {/* Reviews Tab Content */}
          <TabsContent value="reviews" className="p-6">
            <ReviewsTab reviews={reviews} />
          </TabsContent>
          
          {/* Friends Tab Content */}
          <TabsContent value="friends" className="p-6">
            <FriendsTab friends={friends} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default OtherProfile;
