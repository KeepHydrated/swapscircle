import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, MessageCircle, User, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/hooks/useUnreadNotifications';

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, loading, markAsRead } = useNotifications();

  const handleNotificationClick = async (notification: any) => {
    console.log('🔔 Notification clicked:', notification);
    
    // Mark as read
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    
    // Navigate based on action URL or type
    if (notification.action_url) {
      console.log('🔔 Navigating to action_url:', notification.action_url);
      navigate(notification.action_url);
    } else {
      console.log('🔔 No action_url, using fallback navigation for type:', notification.type);
      // Fallback navigation based on type
      switch (notification.type) {
        case 'message':
          navigate('/messages');
          break;
        case 'match':
        case 'like':
          navigate('/');
          break;
        case 'friend':
        case 'follower':
          navigate('/profile');
          break;
        default:
          navigate('/');
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="h-5 w-5 text-white" />;
      case 'like':
      case 'match':
        return <Heart className="h-5 w-5 text-white" />;
      case 'friend':
      case 'follower':
        return <User className="h-5 w-5 text-white" />;
      default:
        return <Bell className="h-5 w-5 text-white" />;
    }
  };

  const getNotificationIconBackground = (type: string) => {
    switch (type) {
      case 'message':
        return 'bg-blue-500';
      case 'like':
      case 'match':
        return 'bg-red-500';
      case 'friend':
      case 'follower':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} min ago`;
    }
    
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    }
    
    return date.toLocaleDateString();
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`cursor-pointer hover:bg-accent/5 ${notification.is_read ? 'opacity-75' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className={`p-2 rounded-full ${getNotificationIconBackground(notification.type)}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">{notification.title}</h3>
                      {!notification.is_read && (
                        <Badge variant="default" className="text-xs">New</Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(notification.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{notification.content}</p>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-10">
            <Bell className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-medium">No notifications</h3>
            <p className="text-muted-foreground">You're all caught up! Check back later for updates.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Notifications;