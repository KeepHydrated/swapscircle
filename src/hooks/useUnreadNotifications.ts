import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  type: 'message' | 'like' | 'match' | 'friend' | 'trade' | 'trade_completed' | 'follower' | 'newItem' | 'rental_request' | 'discount' | 'feedback' | 'item_removed';
  title: string;
  content: string;
  is_read: boolean;
  action_url?: string;
  reference_id?: string;
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
  const [locallyReadIds, setLocallyReadIds] = useState<Set<string>>(new Set());

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
        action_url: getActionUrl(notification.action_taken, notification.reference_id, notification.id),
        reference_id: notification.reference_id,
        created_at: notification.created_at
      }));

      console.log('🔔 HOOK: Mapped notifications with read status:', mappedNotifications.map(n => ({ id: n.id, is_read: n.is_read, status: n.is_read ? 'read' : 'unread' })));

      const withLocalOverrides = mappedNotifications.map(n => locallyReadIds.has(n.id) ? { ...n, is_read: true } : n);
      setNotifications(withLocalOverrides);
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
      case 'trade_completed':
        return 'Trade Completed';
      case 'item_removed':
        return 'Item removed for policy violation';
      default:
        return 'Notification';
    }
  };
  // Helper function to get action URL
  const getActionUrl = (actionTaken: string, referenceId: string, notificationId: string) => {
    const isUuid = (v?: string) => !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
    switch (actionTaken) {
      case 'message':
        return '/messages';
      case 'match':
        // For backward compatibility we don't know if referenceId is a conversationId or a partner userId (both UUIDs)
        // Include both so the Messages page can resolve correctly
        return referenceId
          ? `/messages?conversation=${referenceId}&partnerId=${referenceId}`
          : '/messages';
      case 'friend':
        return `/other-person-profile?userId=${referenceId}`;
      case 'item_removed':
        return `/notifications/${notificationId}`; // Go to dedicated details page
      case 'trade':
        return referenceId ? `/messages?conversation=${referenceId}` : '/messages';
      case 'trade_completed':
        return referenceId ? `/messages?conversation=${referenceId}` : '/messages';
      default:
        return undefined;
    }
  };
  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      // Prefer RPC to bypass RLS issues
      const { error } = await supabase.rpc('mark_notification_as_read', { p_notification_id: notificationId });
      if (error) throw error;

      // Update local state immediately
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
      setLocallyReadIds(prev => {
        const next = new Set(prev);
        next.add(notificationId);
        return next;
      });

      // Only re-fetch after a short delay to allow DB updates to propagate  
      setTimeout(() => {
        fetchNotifications();
      }, 500);

      console.log('Notification marked as read via RPC:', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      let err: any = null;
      const { error: updError } = await supabase
        .from('notifications')
        .update({ status: 'read' })
        .eq('user_id', user.id)
        .eq('status', 'unread');
      err = updError;

      // If direct update fails due to RLS, fall back to per-item RPC calls
      if (err) {
        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
        const results = await Promise.all(
          unreadIds.map(id => supabase.rpc('mark_notification_as_read', { p_notification_id: id }))
        );
        const anyErr = results.find((r: any) => r && r.error);
        if (anyErr && anyErr.error) throw anyErr.error;
      }

      // Update local state
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      setLocallyReadIds(prev => {
        const next = new Set(prev);
        notifications.forEach(n => next.add(n.id));
        return next;
      });

      // Only re-fetch after a short delay to allow DB updates to propagate
      setTimeout(() => {
        fetchNotifications();
      }, 1000);

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

    // Listen for manual refresh events (fallback in case realtime misses)
    const refreshHandler = () => fetchNotifications();
    window.addEventListener('notificationsRefresh', refreshHandler);

    // Subscribe to real-time changes with unique channel name  
    const channelName = `notifications-${user.id}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔔 HOOK: New notification received (INSERT):', payload);
          // Reset the viewed state when new notifications arrive
          setHasViewedDropdown(false);
          localStorage.setItem('notifications-viewed', 'false');
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('notificationsRefresh', refreshHandler);
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Calculate unread count - always reflect real unread items
  const unreadCount = notifications.filter(n => !n.is_read).length;
  console.log('🔔 HOOK: Unread count calculation:', { 
    totalNotifications: notifications.length, 
    unreadCount, 
    notificationStatuses: notifications.map(n => ({ id: n.id, is_read: n.is_read }))
  });

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