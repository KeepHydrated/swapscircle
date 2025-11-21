import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, MapPin, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [existingFriends, setExistingFriends] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

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

      // Check for existing friendships
      if (user && data) {
        const profileIds = data.map(p => p.id);
        const { data: friendships } = await supabase
          .from('friend_requests')
          .select('requester_id, recipient_id')
          .eq('status', 'accepted')
          .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

        if (friendships) {
          const friendIds = new Set(
            friendships.map(f => 
              f.requester_id === user.id ? f.recipient_id : f.requester_id
            ).filter(id => profileIds.includes(id))
          );
          setExistingFriends(friendIds);
        }
      }
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
      
      setSentRequests(prev => new Set(prev).add(profileId));
      toast({
        title: "Friend request sent",
        description: "Your friend request has been sent successfully.",
      });
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Error",
        description: "Failed to send friend request. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="h-8 w-64 bg-muted animate-pulse rounded mb-2" />
        <div className="h-4 w-96 bg-muted animate-pulse rounded mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="w-full">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4 text-foreground">Recommended Friends</h2>
          <p className="text-muted-foreground">No recommendations available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-2">Recommended Friends</h2>
          <p className="text-muted-foreground">Connect with traders in your area</p>
        </div>
      </div>
      
      <div className="overflow-x-auto pb-4 -mr-4 pr-4">
        <div className="flex gap-3 min-w-max">
          {profiles.map((profile) => (
            <div key={profile.id} className="w-64 flex-shrink-0">
              <div className="p-6">
              <div className="flex flex-col items-center mb-4">
                <div className="relative">
                  <Avatar 
                    className="w-24 h-24 border-4 border-background mb-3 cursor-pointer"
                    onClick={() => navigate(`/other-person-profile?userId=${profile.id}`)}
                  >
                    <AvatarImage src={profile.avatar_url} alt={profile.name} />
                    <AvatarFallback className="text-2xl">
                      {profile.name?.charAt(0) || profile.username?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant={existingFriends.has(profile.id) ? "default" : "ghost"}
                    className={`absolute -top-1 -right-1 h-8 w-8 shadow-md border-2 ${
                      existingFriends.has(profile.id)
                        ? 'bg-green-600 border-green-600 hover:bg-green-700'
                        : 'bg-background border-border hover:bg-accent'
                    }`}
                    onClick={() => !sentRequests.has(profile.id) && !existingFriends.has(profile.id) && handleAddFriend(profile.id)}
                  >
                    {sentRequests.has(profile.id) ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <UserPlus className={existingFriends.has(profile.id) ? "w-4 h-4 text-white" : "w-4 h-4"} />
                    )}
                  </Button>
                </div>
                <h3 
                  className="font-semibold text-xl text-foreground text-center cursor-pointer"
                  onClick={() => navigate(`/other-person-profile?userId=${profile.id}`)}
                >
                  {profile.name || profile.username}
                </h3>
                {profile.username && profile.name !== profile.username && (
                  <p className="text-sm text-muted-foreground">@{profile.username}</p>
                )}
              </div>

              {profile.bio && (
                <p className="text-sm text-muted-foreground text-center mb-4 line-clamp-2">
                  {profile.bio}
                </p>
              )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
