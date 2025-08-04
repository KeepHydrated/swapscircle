import React, { useState, useEffect } from 'react';
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
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Notification {
  id: string;
  type: 'system' | 'message' | 'trade' | 'friend';
  title: string;
  content: string;
  isRead: boolean;
  timestamp: string;
  relatedId?: string;
}

interface NotificationDropdownProps {
  unreadCount: number;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ unreadCount }) => {
  const { user, supabaseConfigured } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecentNotifications = async () => {
    if (!user || !supabaseConfigured) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5); // Show only the 5 most recent notifications

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      // Map the database fields to our interface
      const formattedNotifications = (data || []).map((notification: any) => {
        const getTitle = () => {
          switch (notification.action_taken) {
            case 'match':
              return 'New Match!';
            case 'friend':
              return 'Friend Request';
            case 'message':
              return 'New Message';
            default:
              return 'Notification';
          }
        };

        const getType = (): 'system' | 'message' | 'trade' | 'friend' => {
          switch (notification.action_taken) {
            case 'match':
              return 'trade';
            case 'friend':
              return 'friend';
            case 'message':
              return 'message';
            default:
              return 'system';
          }
        };

        return {
          id: notification.id,
          type: getType(),
          title: getTitle(),
          content: notification.message || 'No message content',
          isRead: notification.status === 'read',
          timestamp: notification.created_at,
          relatedId: notification.reference_id
        };
      });

      setNotifications(formattedNotifications);
    } catch (error) {
      console.error('Error in notification fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!user || !supabaseConfigured) return;

    // Mark as read if not already read
    try {
      if (!notification.isRead) {
        const updatedNotifications = notifications.map(n => 
          n.id === notification.id ? { ...n, isRead: true } : n
        );
        setNotifications(updatedNotifications);
        
        await supabase
          .from('notifications')
          .update({ status: 'read' })
          .eq('id', notification.id);
      }
      
      // Navigate based on notification type
      if (notification.type === 'message' && notification.relatedId) {
        navigate('/messages');
      } else if (notification.type === 'trade' && notification.relatedId) {
        navigate(`/other-person-profile`);
      }
    } catch (error) {
      console.error('Error updating notification:', error);
    }
  };

  const handleViewAllClick = () => {
    navigate('/notifications');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'trade':
        return <Bell className="h-4 w-4 text-green-500" />;
      case 'friend':
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="hidden md:flex relative"
          onClick={fetchRecentNotifications}
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
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
            </p>
          )}
        </div>

        <ScrollArea className="max-h-80">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : notifications.length > 0 ? (
            <div className="p-2">
              {notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`mb-2 cursor-pointer hover:bg-accent/5 border-0 shadow-none ${notification.isRead ? 'opacity-75' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-3 flex items-start gap-3">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium truncate">{notification.title}</h4>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{notification.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(notification.timestamp)}
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