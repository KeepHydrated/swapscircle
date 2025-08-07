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
      console.log('🔍 BLOCKING SERVICE: Getting blocked users');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('🔍 BLOCKING SERVICE: No authenticated user');
        return [];
      }

      console.log('🔍 BLOCKING SERVICE: Current user ID:', user.id);

      const { data, error } = await supabase
        .from('blocked_users')
        .select('blocked_id')
        .eq('blocker_id', user.id);

      console.log('🔍 BLOCKING SERVICE: Blocked users query result:', {
        data,
        error: error?.message || null
      });

      if (error) throw error;
      const blockedIds = data?.map(item => item.blocked_id) || [];
      console.log('🔍 BLOCKING SERVICE: Final blocked user IDs:', blockedIds);
      return blockedIds;
    } catch (error) {
      console.error('Error getting blocked users:', error);
      return [];
    }
  },

  // Get list of users who have blocked the current user
  async getUsersWhoBlockedMe(): Promise<string[]> {
    try {
      console.log('🔍 BLOCKING SERVICE: Getting users who blocked me');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('🔍 BLOCKING SERVICE: No authenticated user');
        return [];
      }

      const { data, error } = await supabase
        .from('blocked_users')
        .select('blocker_id')
        .eq('blocked_id', user.id);

      console.log('🔍 BLOCKING SERVICE: Users who blocked me query result:', {
        data,
        error: error?.message || null
      });

      if (error) throw error;
      const blockerIds = data?.map(item => item.blocker_id) || [];
      console.log('🔍 BLOCKING SERVICE: Final blocker IDs:', blockerIds);
      return blockerIds;
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