import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Star, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

const BlankTest = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    id: user?.id || 'unknown',
    name: user?.name || user?.email?.split('@')[0] || 'Chat User',
    email: user?.email || 'user@example.com',
    avatar: user?.avatar_url || '',
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
        // Fetch reviews where user is the reviewee
        const { data: reviews } = await supabase
          .from('reviews')
          .select('rating')
          .eq('reviewee_id', user.id);

        // Fetch completed trades
        const { data: trades } = await supabase
          .from('trades')
          .select('id')
          .or(`requester_id.eq.${user.id},owner_id.eq.${user.id}`)
          .eq('status', 'completed');

        // Calculate average rating
        const avgRating = reviews && reviews.length > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
          : 0;

        setProfileData(prev => ({
          ...prev,
          rating: Number(avgRating.toFixed(1)),
          reviewCount: reviews?.length || 0,
          totalTrades: trades?.length || 0,
        }));
      } catch (error) {
        console.error('Error fetching profile data:', error);
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
                    <AvatarImage src={profileData.avatar} alt={profileData.name} />
                    <AvatarFallback className="text-lg font-semibold bg-muted">
                      {profileData.name.substring(0, 2).toUpperCase()}
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

            {/* Right Column - Placeholder for future content */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-foreground">Additional Info</h2>
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <p>Right column content will go here</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BlankTest;