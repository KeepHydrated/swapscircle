
import React, { useState, useEffect, useCallback } from 'react';
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
  // Get tab from URL or default to 'available'
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'available');
  const [userProfile, setUserProfile] = useState<null | {
    id: string;
    name: string;
    avatar_url: string;
    bio: string;
    location: string;
    created_at: string;
  }>(null);
  const [userItems, setUserItems] = useState<MatchItem[]>([]);
  
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [userFriends, setUserFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileKey, setProfileKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Fetch current user's profile from DB
  const fetchProfile = useCallback(async (forceRefresh = false) => {
    // Only reset profile state on initial load, not on refreshes
    if (forceRefresh || !userProfile) {
      setLoading(true);
      setError(null);
      if (!userProfile) {
        setUserProfile(null); // Only reset if we don't have a profile yet
      }
    }
    
    try {
      // Try getting session for user id
      const { data: auth } = await supabase.auth.getSession();
      const user_id = auth?.session?.user?.id;
      if (!user_id) {
        setError("No user session found.");
        setLoading(false);
        return;
      }
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, name, avatar_url, bio, location, created_at')
        .eq('id', user_id)
        .maybeSingle();

      if (profileError) {
        setError("Failed to fetch profile from database.");
        setLoading(false);
        return;
      }
      if (!profile) {
        setError("Profile not found in database.");
        setLoading(false);
        return;
      }
      
      const newProfile = {
        id: profile.id,
        name: profile.name || profile.username || "User",
        avatar_url: profile.avatar_url || "/placeholder.svg",
        bio: profile.bio || 'Your profile description goes here. Edit your profile in Settings to update this information.',
        location: profile.location || 'Update your location in Settings',
        created_at: profile.created_at,
      };
      
      setUserProfile(newProfile);
      setProfileKey(prev => prev + 1);
    } catch (e) {
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  // Refetch DB profile on mount only, remove frequent refetches
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Fetch user's items for trade (by Supabase user id)
  useEffect(() => {
    const fetchUserItems = async () => {
      setUserItems([]);
      if (!userProfile?.id) return;
      try {
        const { data: items, error: itemsError } = await supabase
          .from('items')
          .select('*')
          .eq('user_id', userProfile.id)
          .eq('is_available', true)
          .order('updated_at', { ascending: false }); // Show most recently updated items first

        if (itemsError) {
          console.error('Error fetching items:', itemsError);
          toast.error('Error loading items');
          setUserItems([]);
        } else if (items && Array.isArray(items)) {
          const formattedItems = items.map(item => ({
            id: item.id,
            name: item.name,
            image: item.image_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f',
            image_url: item.image_url,
            image_urls: item.image_urls || [],
            category: item.category,
            condition: item.condition, 
            description: item.description,
            tags: item.tags,
            price_range_min: item.price_range_min,
            price_range_max: item.price_range_max,
            liked: false,
            is_hidden: item.is_hidden,
          })).sort((a, b) => {
            // Show visible items first (is_hidden: false), then hidden items (is_hidden: true)
            if (a.is_hidden === b.is_hidden) return 0;
            return a.is_hidden ? 1 : -1;
          });
          setUserItems(formattedItems);
        }
      } catch (error) {
        setUserItems([]);
      }
    };
    if (userProfile?.id) fetchUserItems();
  }, [userProfile]);

  // Fetch user reviews and friends
  useEffect(() => {
    const fetchReviews = async () => {
      if (userProfile?.id) {
        const reviews = await fetchUserReviews(userProfile.id);
        setUserReviews(reviews);
        
        // Update profile key to force ProfileHeader re-render with new review data
        setProfileKey(prev => prev + 1);
      }
    };
    
    fetchReviews();
    setUserFriends([]); // Friends feature not implemented yet
  }, [userProfile?.id]);

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
          <div className="text-lg font-semibold text-red-500">{error}</div>
          <button className="mt-6 px-4 py-2 rounded bg-primary text-white" onClick={() => fetchProfile()}>
            Retry
          </button>
        </div>
      </MainLayout>
    );
  }

  if (!userProfile) {
    return (
      <MainLayout>
        <div className="py-20 flex flex-col items-center">
          <div className="text-lg">No profile found.</div>
        </div>
      </MainLayout>
    );
  }

  // Calculate average rating from reviews
  const averageRating = userReviews.length > 0 
    ? Math.round((userReviews.reduce((sum, review) => sum + review.rating, 0) / userReviews.length) * 10) / 10
    : 0;

  const profileData = {
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

  return (
    <MainLayout>
      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
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
              <ProfileItemsManager initialItems={userItems} userProfile={userProfile} />
            )}
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

