
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ProfileHeader from '@/components/profile/ProfileHeader';
import { Star, Users, Pencil } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client'; 
import ItemsForTradeTab from '@/components/profile/ItemsForTradeTab';
import CompletedTradesTab from '@/components/profile/CompletedTradesTab';
import ReviewsTab from '@/components/profile/ReviewsTab';
import FriendsTab from '@/components/profile/FriendsTab';
import ProfileItemsManager from '@/components/profile/ProfileItemsManager';
import { Button } from '@/components/ui/button';
import { MatchItem } from '@/types/item';
import { CompletedTrade } from '@/types/profile';
import { toast } from 'sonner';

const UserProfile: React.FC = () => {
  const { user, supabaseConfigured } = useAuth();
  // State for active tab
  const [activeTab, setActiveTab] = useState('available');
  
  // State for user data
  const [userItems, setUserItems] = useState<MatchItem[]>([]);
  const [userTrades, setUserTrades] = useState<CompletedTrade[]>([]);
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [userFriends, setUserFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user items and data
  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        setLoading(true);
        try {
          if (!supabaseConfigured) {
            // If not configured, use mock data or empty arrays
            setUserItems([]);
            setUserTrades([]);
            setUserReviews([]);
            setUserFriends([]);
            toast.error("Supabase not configured. Using demo mode with empty data.");
            setLoading(false);
            return;
          }
          
          // Fetch user items
          try {
            const { data: items, error: itemsError } = await supabase
              .from('items')
              .select('*')
              .eq('user_id', user.id);
            
            if (itemsError) {
              console.error('Error fetching items:', itemsError);
              toast.error('Error loading items');
              setUserItems([]);
            } else if (items && Array.isArray(items)) {
              // Convert to MatchItem format
              const formattedItems = items.map(item => ({
                id: item.id,
                name: item.name,
                image: item.image_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f',
                category: item.category,
                condition: item.condition,
                description: item.description,
                tags: item.tags,
                liked: false
              }));
              
              setUserItems(formattedItems);
            } else {
              setUserItems([]);
            }
          } catch (error) {
            console.error('Error in items fetch:', error);
            setUserItems([]);
          }
          
          // For now, we'll use empty arrays for trades, reviews, and friends
          // These would be fetched from your Supabase tables once you set them up
          setUserTrades([]);
          setUserReviews([]);
          setUserFriends([]);
          
        } catch (error) {
          console.error('Error fetching user data:', error);
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

  const profileData = {
    name: user?.name || 'User',
    description: 'Your profile description goes here. Edit your profile to update this information.',
    rating: 0,
    reviewCount: userReviews.length,
    location: 'Update your location',
    memberSince: new Date().getFullYear().toString(),
  };

  return (
    <MainLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <Button variant="outline" asChild>
          <a href="/settings">
            <Pencil className="h-4 w-4 mr-2" />
            Edit Profile
          </a>
        </Button>
      </div>
      
      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        {/* Profile Header */}
        <ProfileHeader 
          profile={profileData}
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

          {/* Available Items Tab Content */}
          <TabsContent value="available" className="p-6">
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <ProfileItemsManager initialItems={userItems} />
            )}
          </TabsContent>

          {/* Completed Trades Tab Content */}
          <TabsContent value="completed" className="p-6">
            <CompletedTradesTab trades={userTrades} />
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

export default UserProfile;
