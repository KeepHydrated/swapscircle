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
              
              {/* Compact Profile Layout */}
              <div className="flex items-center space-x-4">
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
                    <span>{profileData.totalMessages} trades completed</span>
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