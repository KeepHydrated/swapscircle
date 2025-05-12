
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ItemsForTradeTab from '@/components/profile/ItemsForTradeTab';
import CompletedTradesTab from '@/components/profile/CompletedTradesTab';
import ReviewsTab from '@/components/profile/ReviewsTab';
import FriendsTab from '@/components/profile/FriendsTab';
import { Star, Users } from 'lucide-react';
import FriendRequestButton, { FriendRequestStatus } from '@/components/profile/FriendRequestButton';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { mockUsers, mockUserItems, mockUserTrades } from '@/data/mockUsers';
import { ProfileUser } from '@/types/profile';
import { Item } from '@/types/item';

// Mock reviews data
const mockUserReviews = {
  "user1": [
    {
      id: 1,
      user: "Michael R.",
      rating: 5,
      comment: "Great trader! Item was exactly as described, and Jessica was a pleasure to work with.",
      date: "April 15, 2025"
    },
    {
      id: 2,
      user: "Sophia T.",
      rating: 4,
      comment: "Good communication and fair trade. The book was in slightly worse condition than I expected, but still a good deal.",
      date: "March 28, 2025"
    }
  ],
  "user2": [
    {
      id: 3,
      user: "Alex P.",
      rating: 5,
      comment: "Marcus is a trustworthy trader. The console was in perfect condition and he shipped it quickly.",
      date: "May 7, 2025"
    },
    {
      id: 4,
      user: "Emma L.",
      rating: 5,
      comment: "Amazing experience trading with Marcus. The record player works perfectly!",
      date: "April 20, 2025"
    }
  ]
};

// Mock friends data
const mockUserFriends = {
  "user1": [
    {
      id: "friend1",
      name: "Michael R.",
      mutualItems: 4,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e"
    },
    {
      id: "friend2",
      name: "Sophia T.",
      mutualItems: 2,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
    }
  ],
  "user2": [
    {
      id: "friend3",
      name: "Alex P.",
      mutualItems: 5,
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61"
    },
    {
      id: "friend4",
      name: "Emma L.",
      mutualItems: 3,
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956"
    }
  ]
};

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
  const [availableItems, setAvailableItems] = useState<Item[]>(
    mockUserItems[safeUserId as keyof typeof mockUserItems] || []
  );
  
  // Get user's completed trades
  const completedTrades = mockUserTrades[safeUserId as keyof typeof mockUserTrades] || [];

  // Get user's reviews
  const reviews = mockUserReviews[safeUserId as keyof typeof mockUserReviews] || [];

  // Get user's friends
  const friends = mockUserFriends[safeUserId as keyof typeof mockUserFriends] || [];

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
            <ItemsForTradeTab items={availableItems} onItemClick={() => {}} />
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
