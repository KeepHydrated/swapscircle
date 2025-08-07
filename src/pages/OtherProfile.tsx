
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ItemsForTradeTab from '@/components/profile/ItemsForTradeTab';
import ReviewsTab from '@/components/profile/ReviewsTab';
import FriendsTab from '@/components/profile/FriendsTab';
import { Star, Users, ArrowLeft } from 'lucide-react';
import FriendRequestButton, { FriendRequestStatus } from '@/components/profile/FriendRequestButton';
import { ReportButton } from '@/components/profile/ReportButton';
import BlockUserButton from '@/components/profile/BlockUserButton';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserReviews } from '@/services/authService';
import { MatchItem } from '@/types/item';
import { toast } from 'sonner';
import { blockingService } from '@/services/blockingService';

const OtherProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('available');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for profile data
  const [profile, setProfile] = useState<any>(null);
  const [userItems, setUserItems] = useState<MatchItem[]>([]);
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [userFriends, setUserFriends] = useState<any[]>([]);

  // Fetch user profile and data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setError("No user ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Check if user is blocked before loading profile
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser && userId) {
          const [isUserBlocked, isCurrentUserBlocked] = await Promise.all([
            blockingService.isUserBlocked(userId),
            blockingService.isCurrentUserBlockedBy(userId)
          ]);

          if (isUserBlocked || isCurrentUserBlocked) {
            setError("This profile is not available");
            setLoading(false);
            return;
          }
        }

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, name, avatar_url, bio, location, created_at')
          .eq('id', userId)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setError("Failed to fetch user profile");
          setLoading(false);
          return;
        }

        if (!profileData) {
          setError("User not found");
          setLoading(false);
          return;
        }

        // Set profile data
        setProfile({
          id: profileData.id,
          name: profileData.name || profileData.username || "User",
          description: profileData.bio || 'No bio available',
          avatar_url: profileData.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&h=250&auto=format&fit=crop',
          location: profileData.location || 'Location not specified',
          memberSince: profileData.created_at ? new Date(profileData.created_at).getFullYear().toString() : new Date().getFullYear().toString(),
          rating: 0, // Will calculate from reviews
          reviewCount: 0, // Will calculate from reviews
          friendStatus: 'none' as FriendRequestStatus
        });

        // Fetch user's items (only visible and non-removed ones)
        const { data: itemsData, error: itemsError } = await supabase
          .from('items')
          .select('*')
          .eq('user_id', userId)
          .eq('is_available', true)
          .eq('is_hidden', false)
          .is('removed_at', null);

        if (itemsError) {
          console.error('Error fetching items:', itemsError);
        } else if (itemsData) {
          const formattedItems = itemsData.map(item => ({
            id: item.id,
            name: item.name,
            image: item.image_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f',
            category: item.category,
            condition: item.condition,
            description: item.description,
            tags: item.tags,
            liked: false,
          }));
          setUserItems(formattedItems);
        }

        // Fetch user's reviews
        const reviews = await fetchUserReviews(userId);
        setUserReviews(reviews);

        // Update profile with review data
        if (reviews.length > 0) {
          const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
          setProfile((prev: any) => ({
            ...prev,
            rating: Math.round(averageRating * 10) / 10,
            reviewCount: reviews.length
          }));
        }

        // Friends functionality not implemented yet
        setUserFriends([]);

      } catch (error) {
        console.error('Error fetching user data:', error);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleFriendStatusChange = (status: FriendRequestStatus) => {
    if (profile) {
      setProfile({
        ...profile,
        friendStatus: status
      });
    }
  };

  const handleItemClick = () => {}; // Empty function for ItemsForTradeTab

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center py-20">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </MainLayout>
    );
  }

  if (error || !profile) {
    return (
      <MainLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">{error || "User not found"}</h1>
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
        <div className="flex gap-2">
          <BlockUserButton 
            userId={profile.id} 
            username={profile.name}
          />
          <ReportButton 
            reportedUserId={profile.id}
            reportedUsername={profile.name}
          />
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
            memberSince: profile.memberSince,
            avatar_url: profile.avatar_url,
          }}
          friendCount={userFriends.length}
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
            <ItemsForTradeTab items={userItems} onItemClick={handleItemClick} />
          </TabsContent>

          {/* Reviews Tab Content */}
          <TabsContent value="reviews" className="p-6">
            <ReviewsTab reviews={userReviews} />
          </TabsContent>
          
          {/* Friends Tab Content */}
          <TabsContent value="friends" className="p-6">
            <FriendsTab friends={userFriends} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default OtherProfile;
