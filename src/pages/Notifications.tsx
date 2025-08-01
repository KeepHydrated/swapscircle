import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { mockNotifications } from '@/data/mockDemoData';

interface Notification {
  id: string;
  type: 'system' | 'message' | 'trade' | 'friend';
  title: string;
  content: string;
  isRead: boolean;
  timestamp: string;
  relatedId?: string;
}

const Notifications: React.FC = () => {
  const { user, supabaseConfigured } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        if (!supabaseConfigured) {
          // Demo mode - use mock notifications
          setNotifications(mockNotifications);
          setLoading(false);
          return;
        }

        try {
          const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching notifications:', error);
            throw error;
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
              isRead: notification.is_read,
              timestamp: notification.created_at,
              relatedId: notification.reference_id
            };
          });

          setNotifications(formattedNotifications);
        } catch (error) {
          console.error('Error in notification fetch:', error);
          // Fall back to placeholder notifications
          setNotifications([
            {
              id: '1',
              type: 'message',
              title: 'New message',
              content: 'You have received a new message from Marcus Thompson.',
              isRead: false,
              timestamp: new Date().toISOString(),
              relatedId: 'user2'
            },
            {
              id: '2',
              type: 'trade',
              title: 'Trade request',
              content: 'Jessica Parker wants to trade her Vintage Leather Jacket for your item.',
              isRead: true,
              timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
              relatedId: 'user1'
            },
            {
              id: '3',
              type: 'system',
              title: 'Welcome to TradeMate',
              content: 'Thank you for joining TradeMate. Start adding items to trade!',
              isRead: true,
              timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            },
          ]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user, supabaseConfigured]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!user) return;
    
    // Mark as read
    try {
      if (!notification.isRead) {
        const updatedNotifications = notifications.map(n => 
          n.id === notification.id ? { ...n, isRead: true } : n
        );
        setNotifications(updatedNotifications);
        
        // In a real app, update the read status in the database
        if (supabaseConfigured) {
          await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notification.id);
        }
      }
      
      // Navigate based on notification type
      if (notification.type === 'message' && notification.relatedId) {
        navigate('/messages');
      } else if (notification.type === 'trade' && notification.relatedId) {
        navigate(`/other-person-profile`);
      }
    } catch (error) {
      console.error('Error updating notification:', error);
      toast.error('Failed to update notification');
    }
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
              className={`cursor-pointer hover:bg-accent/5 ${notification.isRead ? 'opacity-75' : ''}`}
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
                      {!notification.isRead && (
                        <Badge variant="default" className="text-xs">New</Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(notification.timestamp)}
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

// Helper functions for notification UI
function getNotificationIcon(type: string) {
  switch (type) {
    case 'message':
      return <MessageCircle className="h-5 w-5 text-white" />;
    case 'trade':
      return <Bell className="h-5 w-5 text-white" />;
    default:
      return <Bell className="h-5 w-5 text-white" />;
  }
}

function getNotificationIconBackground(type: string) {
  switch (type) {
    case 'message':
      return 'bg-blue-500';
    case 'trade':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
}

function formatTimestamp(timestamp: string) {
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
}

export default Notifications;
