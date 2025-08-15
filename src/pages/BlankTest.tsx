import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Star, MessageCircle } from 'lucide-react';

const BlankTest = () => {
  const { user } = useAuth();

  // Mock profile data from chat user
  const profileData = {
    id: user?.id || 'unknown',
    name: (user as any)?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Chat User',
    email: user?.email || 'user@example.com',
    avatar: (user as any)?.user_metadata?.avatar_url || '',
    memberSince: (user as any)?.created_at || new Date().toISOString(),
    location: 'Nationwide', // Default location
    rating: 4.5,
    reviewCount: 12,
    totalMessages: 5, // Mock data
    responseTime: 'Usually responds within an hour'
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Profile Info */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-foreground">Chat User Profile</h2>
              
              <div className="space-y-6">
                {/* Avatar and Basic Info */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profileData.avatar} alt={profileData.name} />
                    <AvatarFallback className="text-lg font-semibold">
                      {profileData.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{profileData.name}</h3>
                    <p className="text-muted-foreground">{profileData.email}</p>
                    <div className="flex items-center mt-2 space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{profileData.rating}</span>
                      <span className="text-sm text-muted-foreground">
                        ({profileData.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Member Details */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      Member since {new Date(profileData.memberSince).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{profileData.location}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm">{profileData.totalMessages} messages sent</span>
                  </div>
                </div>

                {/* Response Info */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-foreground mb-2">Response Info</h4>
                  <Badge variant="secondary" className="mb-2">
                    {profileData.responseTime}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    This user actively participates in chat support and provides helpful feedback.
                  </p>
                </div>

                {/* Status */}
                <div className="border-t pt-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-foreground">Active now</span>
                  </div>
                </div>
              </div>
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