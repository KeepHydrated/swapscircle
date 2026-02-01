import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ProfileHeader from '@/components/profile/ProfileHeader';
import { Star, Users, User, Package, ImageIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import ReviewsTab from '@/components/profile/ReviewsTab';
import FriendsTab from '@/components/profile/FriendsTab';

// Demo profile data
const demoProfileData = {
  name: "Alex Morgan",
  description: "Vintage collector and trading enthusiast based in Portland. I specialize in retro gaming items, vinyl records, and collectible figurines. Always looking for fair trades and new additions to my collection!",
  rating: 4.8,
  reviewCount: 127,
  memberSince: "2022",
  avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  tradesCompleted: 89,
  location: "Portland, OR",
};

// Demo items
const demoItems = [
  {
    id: 'demo1',
    name: 'Vintage Nintendo Game Boy',
    image: 'https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?w=400',
    category: 'Gaming',
    condition: 'Good',
  },
  {
    id: 'demo2',
    name: 'Vinyl Record Collection',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400',
    category: 'Music',
    condition: 'Excellent',
  },
  {
    id: 'demo3',
    name: 'Polaroid Camera',
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400',
    category: 'Photography',
    condition: 'Like New',
  },
  {
    id: 'demo4',
    name: 'Mechanical Keyboard',
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=400',
    category: 'Electronics',
    condition: 'Excellent',
  },
  {
    id: 'demo5',
    name: 'Designer Watch',
    image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=400',
    category: 'Fashion',
    condition: 'Good',
  },
  {
    id: 'demo6',
    name: 'Vintage Film Camera',
    image: 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?w=400',
    category: 'Photography',
    condition: 'Good',
  },
];

// Demo reviews with correct type
const demoReviews = [
  {
    id: 1,
    user: "Jessica L.",
    rating: 5,
    comment: "Excellent trader! The item was exactly as described, and shipping was fast. Would definitely trade again!",
    date: "December 15, 2025",
  },
  {
    id: 2,
    user: "Marcus T.",
    rating: 5,
    comment: "Great communication and smooth transaction. Very trustworthy!",
    date: "November 28, 2025",
  },
  {
    id: 3,
    user: "Sophia R.",
    rating: 4,
    comment: "Very satisfied with my trade. Item was in good condition as described.",
    date: "October 12, 2025",
  },
];

// Demo friends
const demoFriends = [
  {
    id: "friend1",
    name: "Jessica L.",
    friendCount: 24,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    items: [],
  },
  {
    id: "friend2",
    name: "Marcus T.",
    friendCount: 18,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
    items: [],
  },
  {
    id: "friend3",
    name: "Sophia R.",
    friendCount: 32,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
    items: [],
  },
];

// Simple demo item card (no edit actions)
const DemoItemCard = ({ item }: { item: typeof demoItems[0] }) => {
  return (
    <div className="relative bg-card rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer group">
      <div className="aspect-square relative overflow-hidden bg-muted flex items-center justify-center">
        {item.image ? (
          <img 
            src={item.image} 
            alt={item.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <ImageIcon className="h-12 w-12 text-muted-foreground" />
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm truncate">{item.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          {item.condition && (
            <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
              {item.condition}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Demo items grid
const DemoItemsGrid = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
    {demoItems.map(item => (
      <DemoItemCard key={item.id} item={item} />
    ))}
  </div>
);

const DemoProfile: React.FC = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState(isMobile ? 'profile' : 'available');

  // Mobile items-only view
  if (isMobile && activeTab === 'available') {
    return (
      <MainLayout>
        <div className="bg-card">
          <div className="flex items-center justify-around py-4 px-6 border-b bg-background">
            <button 
              onClick={() => setActiveTab('profile')}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10"
            >
              <User className="w-5 h-5 text-primary" />
            </button>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white">
              <Package className="w-5 h-5" />
            </div>
            <button 
              onClick={() => setActiveTab('reviews')}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10"
            >
              <Star className="w-5 h-5 text-primary" />
            </button>
            <button 
              onClick={() => setActiveTab('friends')}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10"
            >
              <Users className="w-5 h-5 text-primary" />
            </button>
          </div>
          <div className="p-6">
            <DemoItemsGrid />
          </div>
        </div>
      </MainLayout>
    );
  }

  // Mobile reviews-only view
  if (isMobile && activeTab === 'reviews') {
    return (
      <MainLayout>
        <div className="bg-card">
          <div className="flex items-center justify-around py-4 px-6 border-b bg-background">
            <button 
              onClick={() => setActiveTab('profile')}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10"
            >
              <User className="w-5 h-5 text-primary" />
            </button>
            <button 
              onClick={() => setActiveTab('available')}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10"
            >
              <Package className="w-5 h-5 text-primary" />
            </button>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white">
              <Star className="w-5 h-5" />
            </div>
            <button 
              onClick={() => setActiveTab('friends')}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10"
            >
              <Users className="w-5 h-5 text-primary" />
            </button>
          </div>
          <div className="p-6">
            <ReviewsTab reviews={demoReviews} />
          </div>
        </div>
      </MainLayout>
    );
  }

  // Mobile friends-only view
  if (isMobile && activeTab === 'friends') {
    return (
      <MainLayout>
        <div className="bg-card">
          <div className="flex items-center justify-around py-4 px-6 border-b bg-background">
            <button 
              onClick={() => setActiveTab('profile')}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10"
            >
              <User className="w-5 h-5 text-primary" />
            </button>
            <button 
              onClick={() => setActiveTab('available')}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10"
            >
              <Package className="w-5 h-5 text-primary" />
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10"
            >
              <Star className="w-5 h-5 text-primary" />
            </button>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="p-6">
            <FriendsTab friends={demoFriends} />
          </div>
        </div>
      </MainLayout>
    );
  }

  // Mobile profile-only view
  if (isMobile && activeTab === 'profile') {
    return (
      <MainLayout>
        <div className="bg-card">
          <div className="flex items-center justify-around py-4 px-6 border-b bg-background">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white">
              <User className="w-5 h-5" />
            </div>
            <button 
              onClick={() => setActiveTab('available')}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10"
            >
              <Package className="w-5 h-5 text-primary" />
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10"
            >
              <Star className="w-5 h-5 text-primary" />
            </button>
            <button 
              onClick={() => setActiveTab('friends')}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10"
            >
              <Users className="w-5 h-5 text-primary" />
            </button>
          </div>
          <ProfileHeader 
            profile={demoProfileData}
            friendCount={demoFriends.length}
            onReviewsClick={() => setActiveTab('reviews')}
            onFriendsClick={() => setActiveTab('friends')}
            isOwnProfile={false}
          />
        </div>
      </MainLayout>
    );
  }

  // Desktop view
  return (
    <MainLayout>
      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        <ProfileHeader 
          profile={demoProfileData}
          friendCount={demoFriends.length}
          onReviewsClick={() => setActiveTab('reviews')}
          onFriendsClick={() => setActiveTab('friends')}
          isOwnProfile={false}
        />
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="w-full flex rounded-none h-12 bg-card border-b justify-start">
            <TabsTrigger 
              value="available" 
              className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              Items for Trade
            </TabsTrigger>
            <TabsTrigger 
              value="reviews"
              className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              Reviews ({demoReviews.length})
            </TabsTrigger>
            <TabsTrigger 
              value="friends"
              className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              Friends ({demoFriends.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="available" className="mt-0 p-6">
            <DemoItemsGrid />
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-0 p-6">
            <ReviewsTab reviews={demoReviews} />
          </TabsContent>
          
          <TabsContent value="friends" className="mt-0 p-6">
            <FriendsTab friends={demoFriends} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default DemoProfile;
