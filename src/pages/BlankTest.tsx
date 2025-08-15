import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Star, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import SupportChat from '@/components/chat/SupportChat';

const BlankTest = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    id: user?.id || 'unknown',
    name: user?.name || user?.email?.split('@')[0] || 'Chat User',
    email: user?.email || 'user@example.com',
    avatar: '',
    memberSince: new Date().toISOString(),
    location: 'Location not set',
    rating: 0,
    reviewCount: 0,
    totalTrades: 0,
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) return;

      try {
        console.log('🔍 Fetching profile data for user:', user.id);
        console.log('👤 Auth user data:', user);
        
        // Fetch user profile from profiles table to get avatar
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('avatar_url, username, name')
          .eq('id', user.id)
          .single();

        console.log('📸 Profile data with avatar:', JSON.stringify(userProfile, null, 2));
        
        // Fetch reviews where user is the reviewee
        const { data: reviews, error: reviewsError } = await supabase
          .from('reviews')
          .select('rating')
          .eq('reviewee_id', user.id);

        console.log('📊 Reviews query result:', { reviews, error: reviewsError });

        // Try different approaches to count completed trades
        // First, let's check what statuses exist in trade_conversations table (this is the correct table)
        const { data: tradeConversationStatuses } = await supabase
          .from('trade_conversations')
          .select('status')
          .or(`requester_id.eq.${user.id},owner_id.eq.${user.id}`);

        console.log('🔍 Trade conversation statuses found:', tradeConversationStatuses);

        // Count completed trade conversations (this is the actual completed trades)
        const { data: completedTradeConversations } = await supabase
          .from('trade_conversations')
          .select('id, status')
          .or(`requester_id.eq.${user.id},owner_id.eq.${user.id}`)
          .eq('status', 'completed');

        console.log('✅ Completed trade conversations:', completedTradeConversations);

        // Alternative: Count from notifications table
        const { data: tradeNotifications } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', user.id)
          .eq('action_taken', 'trade_completed');

        console.log('📢 Trade completion notifications:', tradeNotifications);

        // Calculate average rating
        const avgRating = reviews && reviews.length > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
          : 0;

        // Use the highest count from either method
        const tradeCount = Math.max(
          completedTradeConversations?.length || 0,
          tradeNotifications?.length || 0
        );

        const finalData = {
          rating: Number(avgRating.toFixed(1)),
          reviewCount: reviews?.length || 0,
          totalTrades: tradeCount,
          name: userProfile?.name || userProfile?.username || user?.name || user?.email?.split('@')[0] || 'Chat User',
          avatar: userProfile?.avatar_url || '',
        };
        
        console.log('📈 Final calculated data:', JSON.stringify(finalData, null, 2));

        setProfileData(prev => ({
          ...prev,
          name: userProfile?.name || userProfile?.username || user?.name || user?.email?.split('@')[0] || 'Chat User',
          avatar: userProfile?.avatar_url || '',
          rating: Number(avgRating.toFixed(1)),
          reviewCount: reviews?.length || 0,
          totalTrades: tradeCount,
        }));
      } catch (error) {
        console.error('❌ Error fetching profile data:', error);
      }
    };

    fetchProfileData();
  }, [user?.id]);

  return (
    <MainLayout>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Profile Info */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-foreground">Chat User Profile</h2>
              
              {/* Compact Profile Layout */}
              <Link to="/profile" className="block">
                <div className="flex items-center space-x-4 hover:bg-muted/50 p-4 rounded-lg transition-colors cursor-pointer">
                  <Avatar className="h-16 w-16">
                    {profileData.avatar && profileData.avatar.trim() !== '' ? (
                      <AvatarImage src={profileData.avatar} alt={profileData.name} />
                    ) : null}
                    <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                      {profileData.name.substring(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-xl font-semibold text-foreground">{profileData.name}</h3>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{profileData.rating}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      Since {new Date(profileData.memberSince).getFullYear()}
                    </p>
                    
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <MessageCircle className="h-4 w-4" />
                      <span>{profileData.totalTrades} trades completed</span>
                    </div>
                  </div>
                </div>
              </Link>
            </Card>

            {/* Right Column - Support Chat Messages */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-foreground">Support Messages</h2>
              <SupportChat />
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BlankTest;