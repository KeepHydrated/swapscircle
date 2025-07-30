
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ProfileHeader from '@/components/profile/ProfileHeader';
import { Star, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client'; 
import { fetchUserReviews } from '@/services/authService';
import ItemsForTradeTab from '@/components/profile/ItemsForTradeTab';
import ReviewsTab from '@/components/profile/ReviewsTab';
import FriendsTab from '@/components/profile/FriendsTab';
import ProfileItemsManager from '@/components/profile/ProfileItemsManager';
import { MatchItem } from '@/types/item';
import { toast } from 'sonner';

const UserProfile: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'available');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userItems, setUserItems] = useState<MatchItem[]>([]);
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [userFriends, setUserFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: auth } = await supabase.auth.getSession();
      const user_id = auth?.session?.user?.id;
      
      if (!user_id) {
        setError("Please sign in to view your profile");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user_id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        setError("Could not load profile data");
        return;
      }

      // Set profile with safe defaults
      setUserProfile({
        id: profile.id,
        name: profile.name || profile.username || "User",
        avatar_url: profile.avatar_url || "/placeholder.svg",
        bio: profile.bio || 'Edit your profile in Settings to add a description.',
        location: profile.location || 'Set your location in Settings',
        created_at: profile.created_at || new Date().toISOString(),
      });

      // Fetch items
      const { data: items } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user_id)
        .eq('is_available', true);

      if (items) {
        const formattedItems = items.map(item => ({
          id: item.id,
          name: item.name || 'Untitled Item',
          image: item.image_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f',
          image_url: item.image_url,
          image_urls: item.image_urls || [],
          category: item.category,
          condition: item.condition, 
          description: item.description,
          tags: item.tags || [],
          price_range_min: item.price_range_min,
          price_range_max: item.price_range_max,
          liked: false,
          is_hidden: item.is_hidden || false,
        }));
        setUserItems(formattedItems);
      }

      // Fetch reviews
      try {
        const reviews = await fetchUserReviews(user_id);
        setUserReviews(reviews || []);
      } catch (reviewError) {
        console.error('Reviews error:', reviewError);
        setUserReviews([]);
      }

      setUserFriends([]);

    } catch (e) {
      console.error('Profile fetch error:', e);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Memoize profile data for header
  const profileData = useMemo(() => {
    if (!userProfile) return null;

    const averageRating = userReviews.length > 0 
      ? Math.round((userReviews.reduce((sum, review) => sum + review.rating, 0) / userReviews.length) * 10) / 10
      : 0;
    
    return {
      name: userProfile.name,
      description: userProfile.bio,
      rating: averageRating,
      reviewCount: userReviews.length,
      location: userProfile.location,
      memberSince: userProfile.created_at
        ? new Date(userProfile.created_at).getFullYear().toString()
        : "",
      avatar_url: userProfile.avatar_url,
    };
  }, [userProfile, userReviews]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center py-20">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="py-20 flex flex-col items-center">
          <div className="text-lg font-semibold text-red-500 mb-4">{error}</div>
          <button 
            className="px-4 py-2 rounded bg-primary text-white" 
            onClick={() => fetchProfile()}
          >
            Try Again
          </button>
        </div>
      </MainLayout>
    );
  }

  if (!userProfile || !profileData) {
    return (
      <MainLayout>
        <div className="py-20 flex flex-col items-center">
          <div className="text-lg">Profile not found</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        <ProfileHeader 
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
            <ProfileItemsManager initialItems={userItems} userProfile={userProfile} />
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
