import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { User, MapPin, FileText, Calendar, Mail, EyeOff } from 'lucide-react';
import { format } from 'date-fns';

interface UserProfile {
  id: string;
  username: string | null;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  vacation_mode: boolean | null;
  show_location: boolean | null;
  created_at: string;
  updated_at: string | null;
}

interface UserSettingsModalProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ userId, open, onOpenChange }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hiddenItemsCount, setHiddenItemsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !open) return;

    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch hidden items count
        const { count, error: hiddenError } = await supabase
          .from('items')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_hidden', true);

        if (!hiddenError) {
          setHiddenItemsCount(count || 0);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, open]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            User Settings (Read Only)
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : profile ? (
          <div className="space-y-4">
            {/* Profile Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={profile.avatar_url || ''} />
                    <AvatarFallback>
                      {(profile.username || profile.name || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-lg">
                      {profile.username || profile.name || 'No username set'}
                    </p>
                    {profile.email && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {profile.email}
                      </p>
                    )}
                  </div>
                </div>

                {profile.bio && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      Bio
                    </p>
                    <p className="text-sm">{profile.bio}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Joined
                    </p>
                    <p>{format(new Date(profile.created_at), 'MMM d, yyyy')}</p>
                  </div>
                  {profile.updated_at && (
                    <div>
                      <p className="font-medium text-muted-foreground">Last Updated</p>
                      <p>{format(new Date(profile.updated_at), 'MMM d, yyyy')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Location Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Location</p>
                    <p>{profile.location || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">City</p>
                    <p>{profile.city || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">State</p>
                    <p>{profile.state || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Zip Code</p>
                    <p>{profile.zip_code || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Show Location:</span>
                  <Badge variant={profile.show_location ? 'default' : 'secondary'}>
                    {profile.show_location ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Privacy & Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Vacation Mode</span>
                  <Badge variant={profile.vacation_mode ? 'destructive' : 'secondary'}>
                    {profile.vacation_mode ? 'On' : 'Off'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-1">
                    <EyeOff className="w-3 h-3" />
                    Hidden Items
                  </span>
                  <Badge variant="outline">{hiddenItemsCount}</Badge>
                </div>
              </CardContent>
            </Card>
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

export default UserSettingsModal;
