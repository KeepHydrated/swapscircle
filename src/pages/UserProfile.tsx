import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ProfileHeader from '@/components/profile/ProfileHeader';
import { Star, Users, User, Package } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'available');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userItems, setUserItems] = useState<MatchItem[]>([]);
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [userFriends, setUserFriends] = useState<any[]>([]);
  const [tradesCompleted, setTradesCompleted] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set default tab based on mobile state when it's available
  useEffect(() => {
    if (!searchParams.get('tab')) {
      setActiveTab(isMobile ? 'profile' : 'available');
    }
  }, [isMobile, searchParams]);

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
        location: profile.location || '',
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
      location: userProfile.location,
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

  // Mobile items-only view
  if (isMobile && activeTab === 'available') {
    return (
      <MainLayout>
        <div className="bg-card">
          {/* Mobile Icon Bar */}
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
          {/* Just the items content */}
          <div className="p-6">
            <ProfileItemsManager initialItems={userItems} userProfile={userProfile} />
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
          {/* Mobile Icon Bar */}
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
          {/* Just the reviews content */}
          <div className="p-6">
            <ReviewsTab reviews={userReviews} />
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
          {/* Mobile Icon Bar */}
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
          {/* Just the friends content */}
          <div className="p-6">
            <FriendsTab friends={userFriends} />
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
          {/* Mobile Icon Bar */}
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
          {/* Just the profile header */}
          <ProfileHeader 
            profile={profileData}
            friendCount={userFriends.length}
            onReviewsClick={() => setActiveTab('reviews')}
            onFriendsClick={() => setActiveTab('friends')}
            userId={userProfile?.id}
            isOwnProfile={true}
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        {/* Mobile Icon Bar */}
        {isMobile && (
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
        )}
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
          onValueChange={(value) => {
            const main = document.querySelector('main') as HTMLElement | null;
            const scrollingEl = document.scrollingElement as HTMLElement | null;

            const candidates = [main, scrollingEl].filter(Boolean) as HTMLElement[];
            const target =
              candidates.find((el) => el.scrollTop > 0) ||
              candidates.find((el) => el.scrollHeight > el.clientHeight) ||
              main ||
              scrollingEl;

            const prevTop = target?.scrollTop ?? window.scrollY;

            setActiveTab(value);

            const restore = () => {
              if (target) target.scrollTop = prevTop;
              else window.scrollTo(0, prevTop);
            };

            // Restore multiple times to beat focus/roving-tabindex scroll adjustments
            requestAnimationFrame(() => {
              restore();
              requestAnimationFrame(restore);
            });
            setTimeout(restore, 50);
          }}
          className="w-full"
        >
          <TabsList className="w-full flex rounded-none h-12 bg-card border-b justify-start">
            <TabsTrigger 
              value="available" 
              onMouseDown={(e) => e.preventDefault()}
              className="flex-1 md:flex-none md:min-w-[180px] data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none data-[state=active]:shadow-none"
            >
              Items
            </TabsTrigger>
            <TabsTrigger 
              value="reviews" 
              onMouseDown={(e) => e.preventDefault()}
              className="flex-1 md:flex-none md:min-w-[180px] data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none data-[state=active]:shadow-none"
            >
              Reviews
            </TabsTrigger>
            <TabsTrigger 
              value="friends" 
              onMouseDown={(e) => e.preventDefault()}
              className="flex-1 md:flex-none md:min-w-[180px] data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none data-[state=active]:shadow-none"
            >
              Friends
            </TabsTrigger>
          </TabsList>
          <TabsContent forceMount value="available" className={`p-6 ${activeTab !== 'available' ? 'hidden' : ''}`}>
            <ProfileItemsManager initialItems={userItems} userProfile={userProfile} />
          </TabsContent>
          <TabsContent forceMount value="reviews" className={`p-6 ${activeTab !== 'reviews' ? 'hidden' : ''}`}>
            <ReviewsTab reviews={userReviews} />
          </TabsContent>
          <TabsContent forceMount value="friends" className={`p-6 ${activeTab !== 'friends' ? 'hidden' : ''}`}>
            <FriendsTab friends={userFriends} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default UserProfile;