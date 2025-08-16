
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
import FriendItemsCarousel from '@/components/profile/FriendItemsCarousel';
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
  const [friendItems, setFriendItems] = useState<MatchItem[]>([]);
  const [tradesCompleted, setTradesCompleted] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    console.log('[UserProfile] fetchProfile called - start');
    try {
      setLoading(true);
      setError(null);
      
      const { data: auth } = await supabase.auth.getSession();
      const user_id = auth?.session?.user?.id;
      
      console.log('UserProfile - Current session:', {
        user_id,
        user_email: auth?.session?.user?.email
      });
      
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
      console.log('[UserProfile] Setting userProfile with data:', profile);
      console.log('[UserProfile] profile.name:', profile.name);
      console.log('[UserProfile] profile.username:', profile.username);
      
      const finalName = profile.name || profile.username || "User";
      console.log('[UserProfile] Final name for userProfile:', finalName);
      
      setUserProfile({
        id: profile.id,
        name: finalName,
        avatar_url: profile.avatar_url || "/placeholder.svg",
        bio: profile.bio || 'Edit your profile in Settings to add a description.',
        location: profile.location || 'Set your location in Settings',
        created_at: profile.created_at || new Date().toISOString(),
      });

      // Fetch items ordered by updated_at so recently published items appear first
      // Include both published and draft items for the user's own profile, but exclude traded (unavailable)
      const { data: items } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user_id)
        .eq('is_available', true) // Hide items that were traded
        .in('status', ['published', 'draft', 'removed']) // Include removed and hidden items for owner's view
        .order('updated_at', { ascending: false });

      if (items) {
        const formattedItems = items.map(item => ({
          id: item.id,
          name: item.name || 'Untitled Item',
          image: item.image_url || (item.image_urls && item.image_urls.length > 0 ? item.image_urls[0] : null),
          image_url: item.image_url,
          image_urls: item.image_urls || [],
          category: item.category,
          condition: item.condition, 
          description: item.description,
          tags: item.tags || [],
          price_range_min: item.price_range_min,
          price_range_max: item.price_range_max,
          // Add the missing "looking for" fields - both camelCase and snake_case for compatibility
          looking_for_categories: item.looking_for_categories || [],
          looking_for_conditions: item.looking_for_conditions || [],  
          looking_for_description: item.looking_for_description || '',
          looking_for_price_ranges: item.looking_for_price_ranges || [], // Add missing price ranges
          lookingForCategories: item.looking_for_categories || [],
          lookingForConditions: item.looking_for_conditions || [],
          lookingForDescription: item.looking_for_description || '',
          lookingForPriceRanges: item.looking_for_price_ranges || [], // Add missing price ranges
          priceRangeMin: item.price_range_min,
          priceRangeMax: item.price_range_max,
          liked: false,
          is_hidden: item.is_hidden || false,
          status: (item.status || 'published') as 'draft' | 'published' | 'removed', // Include status field with removed
          has_been_edited: item.has_been_edited !== false, // Include has_been_edited field
          removal_reason: item.removal_reason, // Include removal reason for removed items
        }));
        setUserItems(formattedItems);
      }

      // Fetch completed trades count
      const { data: tradesData } = await supabase
        .from('trade_conversations')
        .select('id')
        .eq('status', 'completed')
        .or(`requester_id.eq.${user_id},owner_id.eq.${user_id}`);

      const tradesCompletedCount = tradesData?.length || 0;
      setTradesCompleted(tradesCompletedCount);

      // Fetch reviews
      try {
        const reviews = await fetchUserReviews(user_id);
        setUserReviews(reviews || []);
      } catch (reviewError) {
        console.error('Reviews error:', reviewError);
        setUserReviews([]);
      }

      // Fetch friends' items
      await fetchFriendsItems(user_id);

      setUserFriends([]);

    } catch (e) {
      console.error('Profile fetch error:', e);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFriendsItems = async (user_id: string) => {
    try {
      // Get friends first (both directions)
      const { data: friendRequests, error: friendsError } = await supabase
        .from('friend_requests')
        .select('requester_id, recipient_id')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user_id},recipient_id.eq.${user_id}`);

      if (friendsError) {
        console.error('Error fetching friends:', friendsError);
        return;
      }

      // Get friend IDs (excluding self)
      const friendIds = friendRequests
        ?.map(fr => fr.requester_id === user_id ? fr.recipient_id : fr.requester_id)
        .filter(id => id !== user_id) || [];

      if (friendIds.length === 0) {
        setFriendItems([]);
        return;
      }

      // Get friends' items
      const { data: friendItemsData, error: friendItemsError } = await supabase
        .from('items')
        .select('*')
        .in('user_id', friendIds)
        .eq('status', 'published')
        .eq('is_available', true);

      if (friendItemsError) {
        console.error('Error fetching friends items:', friendItemsError);
        return;
      }

      // Fetch profiles for the friends
      const { data: friendProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url')
        .in('id', friendIds);

      if (profilesError) {
        console.error('Error fetching friend profiles:', profilesError);
        return;
      }

      // Create profile lookup
      const profilesMap = new Map();
      friendProfiles?.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });

      // Format friend items
      const formattedFriendItems: MatchItem[] = (friendItemsData || []).map(item => ({
        id: item.id,
        name: item.name,
        image: item.image_url || (item.image_urls && item.image_urls.length > 0 ? item.image_urls[0] : ''),
        image_url: item.image_url,
        image_urls: item.image_urls || [],
        category: item.category,
        condition: item.condition,
        description: item.description,
        tags: item.tags || [],
        priceRangeMin: item.price_range_min,
        priceRangeMax: item.price_range_max,
        user_id: item.user_id,
        liked: false,
        userProfile: {
          name: profilesMap.get(item.user_id)?.name || profilesMap.get(item.user_id)?.username || 'Unknown',
          username: profilesMap.get(item.user_id)?.username,
          avatar_url: profilesMap.get(item.user_id)?.avatar_url,
        }
      }));

      setFriendItems(formattedFriendItems);
    } catch (error) {
      console.error('Error fetching friends items:', error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Refetch profile when returning from settings or other pages
  useEffect(() => {
    const handleVisibilityChange = () => {
      console.log('[UserProfile] visibilitychange event - document.hidden:', document.hidden);
      if (!document.hidden) {
        console.log('[UserProfile] calling fetchProfile from visibilitychange');
        fetchProfile();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    return () => window.removeEventListener('visibilitychange', handleVisibilityChange);
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
      
      memberSince: userProfile.created_at
        ? new Date(userProfile.created_at).getFullYear().toString()
        : "",
      avatar_url: userProfile.avatar_url,
      tradesCompleted: tradesCompleted,
    };
  }, [userProfile, userReviews, tradesCompleted]);

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
          userId={userProfile?.id}
          isOwnProfile={true}
        />
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="w-full flex rounded-none h-12 bg-white dark:bg-gray-800 border-b justify-start">
            <TabsTrigger 
              value="available" 
              className="flex-1 md:flex-none md:min-w-[140px] data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none data-[state=active]:shadow-none"
            >
              Items For Trade
            </TabsTrigger>
            <TabsTrigger 
              value="friend-items" 
              className="flex-1 md:flex-none md:min-w-[140px] data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none data-[state=active]:shadow-none"
            >
              Friends' Items ({friendItems.length})
            </TabsTrigger>
            <TabsTrigger 
              value="reviews" 
              className="flex-1 md:flex-none md:min-w-[140px] data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none data-[state=active]:shadow-none"
            >
              <Star className="mr-2 h-4 w-4" />
              Reviews
            </TabsTrigger>
            <TabsTrigger 
              value="friends" 
              className="flex-1 md:flex-none md:min-w-[140px] data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none data-[state=active]:shadow-none"
            >
              <Users className="mr-2 h-4 w-4" />
              Friends
            </TabsTrigger>
          </TabsList>
          <TabsContent value="available" className="p-6">
            <ProfileItemsManager initialItems={userItems} userProfile={userProfile} />
          </TabsContent>
          <TabsContent value="friend-items" className="p-6">
            {friendItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Users className="h-16 w-16 mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No Friends' Items</h3>
                <p className="text-center">Add friends to see their items available for trade!</p>
              </div>
            ) : (
              <FriendItemsCarousel
                items={friendItems}
                onLikeItem={(itemId) => {
                  // Update the liked status
                  setFriendItems(prev => prev.map(item => 
                    item.id === itemId ? { ...item, liked: !item.liked } : item
                  ));
                  toast.success('Item liked!');
                }}
                title="Your Friends' Items"
              />
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
