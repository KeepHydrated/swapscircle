import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export function useUnreadNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, supabaseConfigured } = useAuth();

  const fetchUnreadCount = async () => {
    if (!user || !supabaseConfigured) {
      setUnreadCount(0);
      return;
    }

    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'unread');

      if (error) {
        console.error('Error fetching unread notifications:', error);
        return;
      }

      console.log('DEBUG: Unread notifications count:', count);
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error in fetchUnreadCount:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    if (!user || !supabaseConfigured) {
      return;
    }

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

  const refreshUnreadCount = () => {
    fetchUnreadCount();
  };

  return { unreadCount, refreshUnreadCount };
}