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

const OtherPersonProfile: React.FC = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  
  // State for profile data
  const [profileData, setProfileData] = useState(otherPersonProfileData);
  
  // Convert items to MatchItems and add liked property
  const itemsAsMatchItems: MatchItem[] = getOtherPersonItems().map(item => ({...item, liked: false}));
  
  // Fetch profile data if userId is provided
  useEffect(() => {
    const fetchProfile = async () => {
      if (userId) {
        console.log('Fetching profile for userId:', userId);
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
          
          if (error) {
            console.error('Error fetching profile:', error);
            return;
          }
          
          if (data) {
            console.log('Fetched profile data:', data);
            setProfileData({
              name: data.username || data.name || 'Unknown User',
              description: data.bio || 'No bio available',
              rating: 5, // Default rating
              reviewCount: 42, // Default review count
              location: data.location || '2.3 mi away',
              memberSince: new Date(data.created_at).getFullYear().toString(),
              friendCount: 15 // Default friend count
            });
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
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

  // Handle liking an item
  const handleLikeItem = (id: string) => {
    setLikedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Update items with liked status
  const itemsWithLikedStatus = itemsAsMatchItems.map(item => ({
    ...item,
    liked: likedItems[item.id] || false
  }));

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
