import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar_url: string;
  location: string;
  bio: string;
}

export const RecommendedFriendsSection = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchRecommendedFriends();
  }, [user]);

  const fetchRecommendedFriends = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url, location, bio')
        .neq('id', user?.id || '')
        .limit(6);

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching recommended friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (profileId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('friend_requests')
        .insert({
          requester_id: user.id,
          recipient_id: profileId,
          status: 'pending'
        });

      if (error) throw error;
      // You could show a toast notification here
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  if (loading) {
    return (
      <div className="w-full px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-64 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-96 bg-muted animate-pulse rounded mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="w-full px-4 py-12">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Recommended Friends</h2>
          <p className="text-muted-foreground">No recommendations available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Recommended Friends</h2>
            <p className="text-muted-foreground">Connect with traders in your area</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <Card 
              key={profile.id} 
              className="overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="relative h-24 bg-gradient-to-r from-primary/20 to-primary/10" />
              <div className="p-6 -mt-12">
                <div className="flex flex-col items-center mb-4">
                  <Avatar className="w-24 h-24 border-4 border-background mb-3">
                    <AvatarImage src={profile.avatar_url} alt={profile.name} />
                    <AvatarFallback className="text-2xl">
                      {profile.name?.charAt(0) || profile.username?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-xl text-foreground text-center">
                    {profile.name || profile.username}
                  </h3>
                  {profile.username && profile.name !== profile.username && (
                    <p className="text-sm text-muted-foreground">@{profile.username}</p>
                  )}
                </div>

                {profile.location && (
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}

                {profile.bio && (
                  <p className="text-sm text-muted-foreground text-center mb-4 line-clamp-2">
                    {profile.bio}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(`/other-person-profile?userId=${profile.id}`)}
                  >
                    View Profile
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => handleAddFriend(profile.id)}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Friend
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
