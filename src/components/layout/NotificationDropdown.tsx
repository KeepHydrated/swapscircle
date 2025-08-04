import React from 'react';
import { Bell, MessageCircle, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Notification } from '@/hooks/useUnreadNotifications';

interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  onNotificationRead: (notificationId: string) => Promise<void>;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ notifications, unreadCount, onNotificationRead }) => {
  const navigate = useNavigate();

  const handleNotificationClick = async (notification: Notification) => {
    // Navigate based on action URL or type (no need to mark as read here since it's done on open)
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const handleDropdownOpen = async () => {
    // Mark all unread notifications as read when dropdown opens
    const unreadNotifications = notifications.filter(n => !n.is_read);
    if (unreadNotifications.length > 0) {
      console.log('Marking notifications as read on dropdown open:', unreadNotifications.length);
      // Mark each unread notification as read
      for (const notification of unreadNotifications) {
        await onNotificationRead(notification.id);
      }
    }
  };

  const handleViewAllClick = () => {
    navigate('/notifications');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'like':
      case 'follower':
        return <Bell className="h-4 w-4 text-green-500" />;
      case 'newItem':
      case 'rental_request':
        return <User className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    }
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }
    
    return date.toLocaleDateString();
  };

  return (
    <DropdownMenu onOpenChange={(open) => { if (open) handleDropdownOpen(); }}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="hidden md:flex relative"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 bg-white border border-gray-200 shadow-lg z-50">{/* Added proper styling */}
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
            </p>
          )}
        </div>

        <ScrollArea className="max-h-80 overflow-auto">{/* Made sure overflow-auto is explicit */}
          <div className="max-h-80 overflow-y-auto">{/* Added explicit container for scroll */}
            {notifications.length > 0 ? (
              <div className="p-2">
              {notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`mb-2 cursor-pointer hover:bg-accent/5 border-0 shadow-none ${notification.is_read ? 'opacity-75' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-3 flex items-start gap-3">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium truncate">{notification.title}</h4>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{notification.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(notification.created_at)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              </div>
            ) : (
              <div className="text-center py-8 px-4">
                <Bell className="mx-auto h-8 w-8 text-muted-foreground opacity-50 mb-2" />
                <p className="text-sm text-muted-foreground">No notifications</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-3 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-between text-sm"
            onClick={handleViewAllClick}
          >
            View all notifications
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;