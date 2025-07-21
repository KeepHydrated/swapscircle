import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileHeader from '@/components/profile/ProfileHeader';
import FriendRequestButton from '@/components/profile/FriendRequestButton';
import { Star } from 'lucide-react';
import { MatchItem } from '@/types/item';
import ItemDetailsModal from '@/components/profile/carousel/ItemDetailsModal';
import { otherPersonProfileData, getOtherPersonItems } from '@/data/otherPersonProfileData';
import OtherProfileTabContent from '@/components/profile/OtherProfileTabContent';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { likeItem, unlikeItem, isItemLiked } from '@/services/authService';
import { toast } from 'sonner';

const OtherPersonProfile: React.FC = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  
  // State for profile data and loading
  const [profileData, setProfileData] = useState({
    ...otherPersonProfileData,
    avatar_url: undefined as string | undefined
  });
  const [isLoading, setIsLoading] = useState(!!userId); // Only show loading if we have a userId to fetch
  const [userItems, setUserItems] = useState<any[]>([]);
  
  // Convert items to MatchItems and add liked property
  const itemsAsMatchItems: MatchItem[] = userItems.map(item => ({
    ...item, 
    image: item.image_url, // Map image_url to image for ItemCard component
    liked: false
  }));
  
  // Fetch profile data if userId is provided
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      console.log('Fetching profile for userId:', userId);
      try {
        // Get current user for friend status checking
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setCurrentUserId(currentUser?.id || null);

        // Check friend status if user is logged in
        if (currentUser) {
          const { data: friendRequests } = await supabase
            .from('friend_requests')
            .select('*')
            .or(`and(requester_id.eq.${currentUser.id},recipient_id.eq.${userId}),and(requester_id.eq.${userId},recipient_id.eq.${currentUser.id})`)
            .eq('status', 'accepted');
          
          const areFriends = friendRequests && friendRequests.length > 0;
          setIsFriend(areFriends);
          console.log('Friend status:', areFriends);
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        
        const { data: itemsData, error: itemsError } = await supabase
          .from('items')
          .select('*')
          .eq('user_id', userId);
        
        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setIsLoading(false);
          return;
        }
        
        if (itemsError) {
          console.error('Error fetching items:', itemsError);
        }
        
        if (profileData) {
          console.log('Fetched profile data:', profileData);
          setProfileData({
            name: profileData.username || profileData.name || 'Unknown User',
            description: profileData.bio || 'No bio available',
            rating: 0, // Show 0 rating until we implement real reviews
            reviewCount: 0, // Show 0 reviews until we implement real reviews
            location: profileData.location || 'Update your location in Settings',
            memberSince: new Date(profileData.created_at).getFullYear().toString(),
            friendCount: 0, // Show 0 friends until we implement real friends
            avatar_url: profileData.avatar_url
          });
        }
        
        if (itemsData) {
          console.log('Fetched items data:', itemsData);
          setUserItems(itemsData);
          
          // Load liked status for each item if user is logged in
          if (currentUser) {
            const likedStatus: Record<string, boolean> = {};
            for (const item of itemsData) {
              try {
                const liked = await isItemLiked(item.id);
                likedStatus[item.id] = liked;
              } catch (e) {
                likedStatus[item.id] = false;
              }
            }
            setLikedItems(likedStatus);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [userId]);

  // State for active tab
  const [activeTab, setActiveTab] = useState('available');
  // State for popup
  const [popupItem, setPopupItem] = useState<MatchItem | null>(null);
  // State to track liked items
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  // State for friendship status - defaulting to false (not friends)
  const [isFriend, setIsFriend] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Function to navigate to specific tab
  const navigateToTab = (tabValue: string) => {
    setActiveTab(tabValue);
  };

  // Handle popup close
  const handlePopupClose = () => {
    setPopupItem(null);
  };
  
  // Handle like item in popup
  const handlePopupLikeClick = (item: MatchItem) => {
    handleLikeItem(item.id);
    setPopupItem(null);
  };

  // Handle liking an item - now with real backend calls
  const handleLikeItem = async (id: string) => {
    if (!currentUserId) {
      toast.error('Please log in to like items');
      return;
    }

    if (!isFriend) {
      toast.error('You must be friends to like items from this profile');
      return;
    }

    const currentLikedStatus = likedItems[id] || false;

    try {
      // Optimistically update UI
      setLikedItems(prev => ({
        ...prev,
        [id]: !currentLikedStatus
      }));

      if (currentLikedStatus) {
        // Unlike the item
        const success = await unlikeItem(id);
        if (!success) {
          // Revert on failure
          setLikedItems(prev => ({
            ...prev,
            [id]: currentLikedStatus
          }));
        }
      } else {
        // Like the item
        const result = await likeItem(id);
        if (!result || !result.success) {
          // Revert on failure
          setLikedItems(prev => ({
            ...prev,
            [id]: currentLikedStatus
          }));
        }
      }
    } catch (error) {
      console.error('Error liking/unliking item:', error);
      // Revert optimistic update
      setLikedItems(prev => ({
        ...prev,
        [id]: currentLikedStatus
      }));
    }
  };

  // Update items with liked status
  const itemsWithLikedStatus = itemsAsMatchItems.map(item => ({
    ...item,
    liked: likedItems[item.id] || false
  }));

  if (isLoading) {
    return (
      <MainLayout>
        <div className="bg-card rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 animate-pulse">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-20 w-20 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        {/* Profile Header with Friend Request Button */}
        <div className="relative">
          <ProfileHeader 
            profile={profileData} 
            friendCount={profileData.friendCount}
            onReviewsClick={() => navigateToTab('reviews')}
          />
          <div className="absolute top-6 right-6">
            <FriendRequestButton 
              userId={userId || "profile1"} 
              initialStatus="none" 
              onStatusChange={(status) => setIsFriend(status === 'accepted')}
            />
          </div>
        </div>

        {/* Tabs with sticky header */}
        <div className="sticky top-16 bg-white z-10">
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
            </TabsList>
            
            {/* We're moving the tab content inside the Tabs component */}
            <OtherProfileTabContent 
              activeTab={activeTab}
              items={itemsWithLikedStatus}
              setPopupItem={setPopupItem}
              onLikeItem={handleLikeItem}
              isFriend={isFriend}
            />
          </Tabs>
        </div>
      </div>

      {/* Item Details Popup - no edit controls for other person's items */}
      {popupItem && (
        <ItemDetailsModal 
          item={popupItem}
          isOpen={!!popupItem}
          onClose={handlePopupClose}
          onLikeClick={handlePopupLikeClick}
          showProfileInfo={false}
        />
      )}
    </MainLayout>
  );
};

export default OtherPersonProfile;
