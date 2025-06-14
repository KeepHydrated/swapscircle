import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ProfileHeader from '@/components/profile/ProfileHeader';
import { Star, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client'; 
import ItemsForTradeTab from '@/components/profile/ItemsForTradeTab';
import CompletedTradesTab from '@/components/profile/CompletedTradesTab';
import ReviewsTab from '@/components/profile/ReviewsTab';
import FriendsTab from '@/components/profile/FriendsTab';
import ProfileItemsManager from '@/components/profile/ProfileItemsManager';
import { MatchItem } from '@/types/item';
import { CompletedTrade } from '@/types/profile';
import { toast } from 'sonner';

const UserProfile: React.FC = () => {
  const { user, supabaseConfigured } = useAuth();
  const [activeTab, setActiveTab] = useState('available');
  const [userItems, setUserItems] = useState<MatchItem[]>([]);
  const [userTrades, setUserTrades] = useState<CompletedTrade[]>([]);
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [userFriends, setUserFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileKey, setProfileKey] = useState(0);

  // State for bio and location
  const [profileBio, setProfileBio] = useState('');
  const [profileLocation, setProfileLocation] = useState('');

  // To ensure fetchProfileExtras is stable for cleanup/add/remove event listeners
  const fetchProfileExtras = useCallback(async () => {
    if (user && user.id && supabaseConfigured) {
      const { data, error } = await supabase
        .from('profiles')
        .select('bio, location')
        .eq('id', user.id)
        .maybeSingle();
      if (error) {
        console.error('Failed to fetch bio/location:', error);
        setProfileBio('');
        setProfileLocation('');
      } else if (data) {
        setProfileBio(data.bio || "");
        setProfileLocation(data.location || "");
      } else {
        setProfileBio('');
        setProfileLocation('');
      }
    }
  }, [user, supabaseConfigured]);

  // Force re-render profile header key if name/avatar_url changed
  useEffect(() => {
    setProfileKey(prev => prev + 1);
  }, [user?.name, user?.avatar_url]);

  // Fetch extended profile info (bio/location)
  useEffect(() => {
    fetchProfileExtras();
  }, [fetchProfileExtras]);

  // Listen for page focus/visibilitychange to update profile info
  useEffect(() => {
    function handleRefreshOnFocusOrVisibility() {
      if (document.visibilityState === 'visible') {
        fetchProfileExtras();
      }
    }

    window.addEventListener('focus', fetchProfileExtras);
    document.addEventListener('visibilitychange', handleRefreshOnFocusOrVisibility);

    return () => {
      window.removeEventListener('focus', fetchProfileExtras);
      document.removeEventListener('visibilitychange', handleRefreshOnFocusOrVisibility);
    };
  }, [fetchProfileExtras]);

  useEffect(() => {
    if (user && supabaseConfigured) {
      const fetchUserData = async () => {
        setLoading(true);
        try {
          // Fetch user items from DB
          const { data: items, error: itemsError } = await supabase
            .from('items')
            .select('*')
            .eq('user_id', user.id);
          if (itemsError) {
            console.error('Error fetching items:', itemsError);
            toast.error('Error loading items');
            setUserItems([]);
          } else if (items && Array.isArray(items)) {
            const formattedItems = items.map(item => ({
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
          } else {
            setUserItems([]);
          }

          // The following data will come from DB in the future. Now, return empty arrays (no mocks)
          setUserTrades([]);
          setUserReviews([]);
          setUserFriends([]);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserItems([]);
          setUserTrades([]);
          setUserReviews([]);
          setUserFriends([]);
        } finally {
          setLoading(false);
        }
      };
      fetchUserData();
    }
  }, [user, supabaseConfigured]);

  if (!user) {
    return null; // Should be handled by RequireAuth
  }

  // Use the fetched bio and location if available
  const profileData = {
    name: user?.name || 'User',
    description: profileBio || 'Your profile description goes here. Edit your profile in Settings to update this information.',
    rating: 0, // Placeholder until implemented in DB. Remove this when ratings are implemented
    reviewCount: userReviews.length,
    location: profileLocation || 'Update your location in Settings',
    memberSince: new Date().getFullYear().toString(),  // Placeholder, replace with user's actual date if stored
    avatar_url: user?.avatar_url,
  };

  return (
    <MainLayout>
      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        {/* Profile Header */}
        <ProfileHeader 
          key={profileKey}
          profile={profileData}
          friendCount={userFriends.length}
          onReviewsClick={() => setActiveTab('reviews')}
          onFriendsClick={() => setActiveTab('friends')}
        />
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="w-full flex rounded-none h-12 bg-white dark:bg-gray-800 border-b justify-start">
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
          <TabsContent value="available" className="p-6">
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <ProfileItemsManager initialItems={userItems} />
            )}
          </TabsContent>
          <TabsContent value="completed" className="p-6">
            <CompletedTradesTab trades={userTrades} />
          </TabsContent>
          <TabsContent value="reviews" className="p-6">
            <ReviewsTab reviews={userReviews} />
          </TabsContent>
          <TabsContent value="friends" className="p-6">
            <FriendsTab friends={userFriends} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default UserProfile;
