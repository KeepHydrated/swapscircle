import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export function useUnreadNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, supabaseConfigured } = useAuth();

  useEffect(() => {
    if (!user || !supabaseConfigured) {
      setUnreadCount(0);
      return;
    }

    // Fetch initial unread count
    const fetchUnreadCount = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('is_read', false);

        if (error) {
          console.error('Error fetching unread notifications:', error);
          return;
        }

        setUnreadCount(data?.length || 0);
      } catch (error) {
        console.error('Error in fetchUnreadCount:', error);
      }
    };

    fetchUnreadCount();

    // Set up real-time subscription for notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Refetch count when notifications change
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabaseConfigured]);

  return unreadCount;
}