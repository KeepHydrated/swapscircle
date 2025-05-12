
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Item } from '@/types/item';
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

// Mock users data - in a real app this would come from an API call
const mockUsers = {
  "user1": {
    id: "user1",
    name: "Jessica Parker",
    description: "Vintage clothing enthusiast and collector of rare books. Always looking for unique fashion pieces from the 70s and 80s, as well as first edition novels.",
    rating: 4,
    reviewCount: 87,
    location: "Seattle, WA",
    memberSince: "2023",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    friendStatus: "none" as FriendRequestStatus
  },
  "user2": {
    id: "user2",
    name: "Marcus Thompson",
    description: "Tech gadget collector focusing on retro gaming and audio equipment. Looking to expand my collection of vintage consoles and high-quality headphones.",
    rating: 5,
    reviewCount: 134,
    location: "Austin, TX",
    memberSince: "2021",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    friendStatus: "pending" as FriendRequestStatus
  }
};

// Mock items for trade
const mockUserItems = {
  "user1": [
    {
      id: "item1",
      name: "Vintage Leather Jacket",
      description: "Genuine leather jacket from the 1970s in excellent condition.",
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5",
      condition: "Excellent",
      category: "Fashion",
      priceRange: "$200-$300"
    },
    {
      id: "item2",
      name: "First Edition Hemingway",
      description: "First edition copy of 'The Old Man and the Sea' in good condition.",
      image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f",
      condition: "Good",
      category: "Books",
      priceRange: "$150-$250"
    },
    {
      id: "item3",
      name: "80s Sequin Dress",
      description: "Vintage 1980s sequin evening dress, size 8, barely worn.",
      image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae",
      condition: "Near Mint",
      category: "Fashion",
      priceRange: "$100-$150"
    }
  ],
  "user2": [
    {
      id: "item4",
      name: "SEGA Genesis Console",
      description: "Original SEGA Genesis with two controllers and 5 games.",
      image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
      condition: "Good",
      category: "Gaming",
      priceRange: "$80-$120"
    },
    {
      id: "item5",
      name: "Vintage Headphones",
      description: "1970s studio headphones, recently refurbished with new ear pads.",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
      condition: "Good",
      category: "Audio",
      priceRange: "$150-$200"
    },
    {
      id: "item6",
      name: "Retro Game Collection",
      description: "Collection of 20 retro games from NES, SNES and Genesis eras.",
      image: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8",
      condition: "Mixed",
      category: "Gaming",
      priceRange: "$200-$300"
    }
  ]
};

// Mock completed trades
const mockUserTrades = {
  "user1": [
    {
      id: 101,
      name: "Designer Handbag",
      tradedFor: "Vintage Camera",
      tradedWith: "Michael R.",
      tradeDate: "April 10, 2025",
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3"
    },
    {
      id: 102,
      name: "Antique Brooch",
      tradedFor: "First Edition Book",
      tradedWith: "Sophia T.",
      tradeDate: "March 22, 2025",
      image: "https://images.unsplash.com/photo-1586878341523-7c1ef1a0e9c0"
    }
  ],
  "user2": [
    {
      id: 103,
      name: "Nintendo 64 Console",
      tradedFor: "Bluetooth Speaker",
      tradedWith: "Alex P.",
      tradeDate: "May 5, 2025",
      image: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e"
    },
    {
      id: 104,
      name: "Record Player",
      tradedFor: "Gaming Headset",
      tradedWith: "Emma L.",
      tradeDate: "April 17, 2025",
      image: "https://images.unsplash.com/photo-1487887235947-a955ef187fcc"
    }
  ]
};

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
  const [profile, setProfile] = useState(mockUsers[safeUserId as keyof typeof mockUsers]);
  
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
