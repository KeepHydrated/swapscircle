import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  type: 'message' | 'like' | 'match' | 'friend' | 'trade' | 'follower' | 'newItem' | 'rental_request' | 'discount' | 'feedback';
  title: string;
  content: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasViewedDropdown, setHasViewedDropdown] = useState(() => {
    // Initialize from localStorage
    return localStorage.getItem('notifications-viewed') === 'true';
  });

  // Fetch notifications
  const fetchNotifications = async () => {
    console.log('🔔 HOOK: Fetching notifications for user:', user?.id);
    if (!user) {
      console.log('🔔 HOOK: No user found, skipping fetch');
      return;
    }

    setLoading(true);
    try {
      console.log('🔔 HOOK: Querying notifications table...');
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      console.log('🔔 HOOK: Query result:', { data, error, dataLength: data?.length });
      if (error) throw error;

      // Map database fields to our interface
      const mappedNotifications = (data || []).map((notification: any) => ({
        id: notification.id,
        type: notification.action_taken || 'message',
        title: getNotificationTitle(notification.action_taken),
        content: notification.message || 'No message content',
        is_read: notification.status === 'read',
        action_url: getActionUrl(notification.action_taken, notification.reference_id),
        created_at: notification.created_at
      }));

      setNotifications(mappedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get notification title
  const getNotificationTitle = (actionTaken: string) => {
    switch (actionTaken) {
      case 'match':
        return 'New Match!';
      case 'friend':
        return 'Friend Request';
      case 'message':
        return 'New Message';
      case 'trade':
        return 'Trade Accepted';
      default:
        return 'Notification';
    }
  };

  // Helper function to get action URL
  const getActionUrl = (actionTaken: string, referenceId: string) => {
    const isUuid = (v?: string) => !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
    switch (actionTaken) {
      case 'message':
        return '/messages';
      case 'match':
        // If referenceId is a conversation id use it, otherwise treat it as partner user id
        return referenceId
          ? (isUuid(referenceId)
              ? `/messages?conversation=${referenceId}`
              : `/messages?partnerId=${referenceId}`)
          : '/messages';
      case 'friend':
        return `/other-person-profile?userId=${referenceId}`;
      case 'item_removed':
        return '/profile'; // Direct to profile to see items
      case 'trade':
        return referenceId ? `/messages?conversation=${referenceId}` : '/messages';
      default:
        return undefined;
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      // First update the database
      const { error } = await supabase
        .from('notifications')
        .update({ status: 'read' })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Then update local state immediately (don't wait for real-time update)
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );

      console.log('Notification marked as read:', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ status: 'read' })
        .eq('user_id', user.id)
        .eq('status', 'unread');

      if (error) throw error;

      // Update local state
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, is_read: true }))
      );

      toast({
        title: "All notifications marked as read",
        description: "You've cleared all unread notifications"
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive"
      });
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    // Subscribe to real-time changes with unique channel name  
    const channelName = `notifications-${user.id}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT', // Only listen for new notifications, not updates
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New notification received:', payload);
          // Reset the viewed state when new notifications arrive
          setHasViewedDropdown(false);
          localStorage.setItem('notifications-viewed', 'false');
          // Only fetch new notifications on INSERT, not on UPDATE
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Calculate unread count - always reflect real unread items
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Function to mark dropdown as viewed (clears the badge)
  const markDropdownAsViewed = () => {
    setHasViewedDropdown(true);
    localStorage.setItem('notifications-viewed', 'true');
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    markDropdownAsViewed
  };
}