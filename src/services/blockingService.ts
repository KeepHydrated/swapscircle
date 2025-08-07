import { supabase } from '@/integrations/supabase/client';

export interface BlockedUser {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

export const blockingService = {
  // Check if a user is blocked by the current user
  async isUserBlocked(userId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('blocked_users')
        .select('id')
        .eq('blocker_id', user.id)
        .eq('blocked_id', userId)
        .maybeSingle();

      return !error && !!data;
    } catch (error) {
      console.error('Error checking if user is blocked:', error);
      return false;
    }
  },

  // Check if current user is blocked by another user
  async isCurrentUserBlockedBy(userId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('blocked_users')
        .select('id')
        .eq('blocker_id', userId)
        .eq('blocked_id', user.id)
        .maybeSingle();

      return !error && !!data;
    } catch (error) {
      console.error('Error checking if current user is blocked:', error);
      return false;
    }
  },

  // Get list of users blocked by current user
  async getBlockedUsers(): Promise<string[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('blocked_users')
        .select('blocked_id')
        .eq('blocker_id', user.id);

      if (error) throw error;
      return data?.map(item => item.blocked_id) || [];
    } catch (error) {
      console.error('Error getting blocked users:', error);
      return [];
    }
  },

  // Get list of users who have blocked the current user
  async getUsersWhoBlockedMe(): Promise<string[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('blocked_users')
        .select('blocker_id')
        .eq('blocked_id', user.id);

      if (error) throw error;
      return data?.map(item => item.blocker_id) || [];
    } catch (error) {
      console.error('Error getting users who blocked me:', error);
      return [];
    }
  },

  // Block a user
  async blockUser(userId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('blocked_users')
        .insert({
          blocker_id: user.id,
          blocked_id: userId
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error blocking user:', error);
      return false;
    }
  },

  // Unblock a user
  async unblockUser(userId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error unblocking user:', error);
      return false;
    }
  }
};