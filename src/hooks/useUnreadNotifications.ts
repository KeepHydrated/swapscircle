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
  const [locallyReadIds, setLocallyReadIds] = useState<Set<string>>(() => {
    // Initialize from localStorage
    const stored = localStorage.getItem('locally-read-notifications');
    return stored ? new Set(JSON.parse(stored)) : new Set();
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

      // Map database fields to our interface and fetch sender profiles for friend requests
      const mappedNotifications = await Promise.all((data || []).map(async (notification: any) => {
        let content = notification.message || 'No message content';
        
        // For friend requests, always try to get the correct sender name and override the message
        if (notification.action_taken === 'friend' || notification.action_taken === 'friend_accepted') {
          let senderName = 'Someone';
          
          console.log('🔔 Processing friend notification:', { 
            id: notification.id, 
            action_by: notification.action_by, 
            reference_id: notification.reference_id 
          });
          
          try {
            // First try using action_by if it exists
            if (notification.action_by) {
              console.log('🔔 Fetching profile for action_by:', notification.action_by);
              const { data: senderProfile, error: profileError } = await supabase
                .from('profiles')
                .select('name, username')
                .eq('id', notification.action_by)
                .single();
              
              console.log('🔔 Profile query result:', { data: senderProfile, error: profileError });
              
              if (senderProfile && !profileError) {
                senderName = senderProfile.name || senderProfile.username || 'Someone';
                console.log('🔔 Successfully got sender name:', senderName);
              } else {
                console.log('🔔 No profile found or error occurred');
              }
            } else {
              console.log('🔔 No action_by, trying fallback method');
              // Fallback: try to find the most recent friend request to this user
              const { data: friendRequest } = await supabase
                .from('friend_requests')
                .select('requester_id')
                .eq('recipient_id', user.id)
                .eq('status', 'accepted')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
              
              if (friendRequest) {
                const { data: requesterProfile } = await supabase
                  .from('profiles')
                  .select('name, username')
                  .eq('id', friendRequest.requester_id)
                  .single();
                
                if (requesterProfile) {
                  senderName = requesterProfile.name || requesterProfile.username || 'Someone';
                }
              }
            }
          } catch (profileError) {
            console.error('🔔 Error fetching sender profile:', profileError);
          }
          
          console.log('🔔 Final sender name for notification:', senderName);
          // Always override the content for friend requests with the fetched name
          if (notification.action_taken === 'friend') {
            content = `${senderName} sent you a friend request.`;
          } else if (notification.action_taken === 'friend_accepted') {
            content = `${senderName} accepted your friend request.`;
          }
        }
        
        return {
          id: notification.id,
          type: notification.action_taken || 'message',
          title: getNotificationTitle(notification.action_taken),
          content: content,
          is_read: notification.status === 'read',
          action_url: getActionUrl(notification.action_taken, notification.reference_id, notification.id, notification.action_by),
          reference_id: notification.reference_id,
          created_at: notification.created_at
        };
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
      case 'friend_accepted':
        return 'Friend Request Accepted';
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
  const getActionUrl = (actionTaken: string, referenceId: string, notificationId: string, actionBy?: string) => {
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
        // Use action_by (requester ID) instead of reference_id (recipient ID) for friend requests
        return actionBy ? `/other-person-profile?userId=${actionBy}` : `/other-person-profile?userId=${referenceId}`;
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
        // Persist to localStorage
        localStorage.setItem('locally-read-notifications', JSON.stringify([...next]));
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

    console.log('🔔 HOOK: Starting markAllAsRead for user:', user.id);
    
    const unreadNotifications = notifications.filter(n => !n.is_read);
    console.log('🔔 HOOK: Found unread notifications:', unreadNotifications.map(n => n.id));

    if (unreadNotifications.length === 0) {
      console.log('🔔 HOOK: No unread notifications to mark as read');
      return;
    }

    try {
      // Use RPC calls for each notification to ensure they get marked as read
      console.log('🔔 HOOK: Using RPC calls to mark notifications as read');
      const results = await Promise.allSettled(
        unreadNotifications.map(notification => 
          supabase.rpc('mark_notification_as_read', { p_notification_id: notification.id })
        )
      );
      
      // Check if any failed
      const failures = results.filter(result => result.status === 'rejected');
      if (failures.length > 0) {
        console.error('🔔 HOOK: Some RPC calls failed:', failures);
      }

      // Update local state immediately regardless of RPC results
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      setLocallyReadIds(prev => {
        const next = new Set(prev);
        unreadNotifications.forEach(n => next.add(n.id));
        // Persist to localStorage
        localStorage.setItem('locally-read-notifications', JSON.stringify([...next]));
        return next;
      });

      console.log('🔔 HOOK: Local state updated, all notifications marked as read');

      toast({
        title: "All notifications marked as read",
        description: "You've cleared all unread notifications"
      });
    } catch (error) {
      console.error('🔔 HOOK: Error marking all notifications as read:', error);
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

    // Clear localStorage cache when user changes
    localStorage.removeItem('locally-read-notifications');
    localStorage.removeItem('notifications-viewed');
    setLocallyReadIds(new Set());

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