import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { User, MapPin, Calendar, Star, Repeat, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: string;
  username: string | null;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
}

interface UserStats {
  rating: number;
  reviewCount: number;
  tradesCompleted: number;
  itemsCount: number;
  friendsCount: number;
}

interface UserProfileModalProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ userId, open, onOpenChange }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    rating: 0,
    reviewCount: 0,
    tradesCompleted: 0,
    itemsCount: 0,
    friendsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !open) return;

    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, name, avatar_url, bio, location, city, state, created_at')
          .eq('id', userId)
          .maybeSingle();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch stats in parallel
        const [reviewsResult, itemsResult, friendsResult, tradesResult] = await Promise.all([
          // Reviews
          supabase
            .from('reviews')
            .select('rating')
            .eq('reviewee_id', userId),
          // Items count
          supabase
            .from('items')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'published')
            .eq('is_hidden', false),
          // Friends count
          supabase
            .from('friend_requests')
            .select('*', { count: 'exact', head: true })
            .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
            .eq('status', 'accepted'),
          // Completed trades
          supabase
            .from('trade_conversations')
            .select('*', { count: 'exact', head: true })
            .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
            .eq('status', 'completed'),
        ]);

        // Calculate average rating
        const reviews = reviewsResult.data || [];
        const avgRating = reviews.length > 0 
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
          : 0;

        setStats({
          rating: Math.round(avgRating * 10) / 10,
          reviewCount: reviews.length,
          tradesCompleted: tradesResult.count || 0,
          itemsCount: itemsResult.count || 0,
          friendsCount: friendsResult.count || 0,
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, open]);

  const getLocationDisplay = () => {
    if (profile?.city && profile?.state) {
      return `${profile.city}, ${profile.state}`;
    }
    if (profile?.location) {
      // Check if it's coordinates
      const isCoordinates = profile.location.includes(',') && profile.location.includes('.');
      if (isCoordinates) return null;
      
      // Check if location contains letters (city name)
      const hasLetters = /[a-zA-Z]/.test(profile.location);
      if (hasLetters) {
        const parts = profile.location.split(',');
        if (parts.length >= 2) {
          return `${parts[0].trim()}, ${parts[1].trim()}`;
        }
        return profile.location.trim();
      }
    }
    return null;
  };

  const getMemberYear = () => {
    if (!profile?.created_at) return null;
    return new Date(profile.created_at).getFullYear();
  };

  const handleViewFullProfile = () => {
    onOpenChange(false);
    navigate(`/other-person-profile?userId=${userId}`);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Live Profile Preview
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : profile ? (
          <div className="space-y-4">
            {/* Profile Header - mimics actual profile page */}
            <div className="bg-card border rounded-lg p-4">
              <div className="flex gap-4">
                <Avatar className="w-20 h-20 border-[3px] border-primary">
                  <AvatarImage 
                    src={profile.avatar_url || ''} 
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                    {(profile.username || profile.name || 'U')
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold">
                      {profile.username || profile.name || 'Anonymous'}
                    </h3>
                    <div className="flex items-center">
                      <Star size={14} fill="#FFD700" color="#FFD700" />
                      <span className="ml-1 text-sm text-muted-foreground">
                        {stats.rating === 0 ? '0.0' : stats.rating} ({stats.reviewCount})
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                    {getLocationDisplay() && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{getLocationDisplay()}</span>
                      </div>
                    )}
                    {getMemberYear() && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{getMemberYear()}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Repeat className="h-3 w-3" />
                      <span>{stats.tradesCompleted} trade{stats.tradesCompleted !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
              </div>

              {profile.bio && (
                <p className="mt-3 text-sm text-muted-foreground">{profile.bio}</p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold">{stats.itemsCount}</p>
                <p className="text-xs text-muted-foreground">Items</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold">{stats.tradesCompleted}</p>
                <p className="text-xs text-muted-foreground">Trades</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold">{stats.friendsCount}</p>
                <p className="text-xs text-muted-foreground">Friends</p>
              </div>
            </div>

            {/* View Full Profile Button */}
            <Button 
              onClick={handleViewFullProfile}
              className="w-full"
              variant="outline"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Full Profile
            </Button>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            User not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;
