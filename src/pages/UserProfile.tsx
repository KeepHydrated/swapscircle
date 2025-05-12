
import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import FriendRequestButton, { FriendRequestStatus } from '@/components/profile/FriendRequestButton';
import ProfileHeader from '@/components/profile/ProfileHeader';
import UserAvailableItems from '@/components/profile/UserAvailableItems';
import UserCompletedTrades from '@/components/profile/UserCompletedTrades';
import { mockUsers, mockUserItems, mockUserTrades } from '@/data/mockUsers';
import { ProfileUser } from '@/types/profile';

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  // Default to user1 if no userId is provided
  const safeUserId = userId || "user1";
  
  // Get user data
  const [profile, setProfile] = useState<ProfileUser | undefined>(mockUsers[safeUserId]);
  
  // Get user's items for trade
  const [availableItems, setAvailableItems] = useState(
    mockUserItems[safeUserId] || []
  );
  
  // Get user's completed trades
  const completedTrades = mockUserTrades[safeUserId] || [];

  // Effect to show toast when user is not found
  useEffect(() => {
    if (!profile && userId) {
      toast.error(`User with ID "${userId}" not found`);
    }
  }, [profile, userId]);

  const handleGoBack = () => {
    navigate(-1);
  };

  // Handle liking an item
  const handleLikeItem = (itemId: string) => {
    setAvailableItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, liked: !item.liked } : item
      )
    );
    
    // Show a toast notification when liking an item
    const item = availableItems.find(item => item.id === itemId);
    if (item) {
      const action = item.liked ? "unliked" : "liked";
      toast(`You ${action} ${item.name}`);
    }
  };
  
  // Handle selecting an item (no action for now, just for the ItemCard props)
  const handleSelectItem = (itemId: string) => {
    // In a real app, this could navigate to an item detail page
    console.log(`Selected item: ${itemId}`);
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
          <h1 className="text-2xl font-bold mb-4">User not found</h1>
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
        <ProfileHeader profile={profile} />

        {/* Tabs */}
        <Tabs defaultValue="available" className="w-full">
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
          </TabsList>

          {/* Available Items Tab Content */}
          <TabsContent value="available" className="p-6">
            <UserAvailableItems 
              items={availableItems}
              onLikeItem={handleLikeItem}
              onSelectItem={handleSelectItem}
            />
          </TabsContent>

          {/* Completed Trades Tab Content */}
          <TabsContent value="completed" className="p-6">
            <UserCompletedTrades trades={completedTrades} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default UserProfile;
