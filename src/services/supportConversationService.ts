import { supabase } from '@/integrations/supabase/client';

const ADMIN_EMAIL = 'nadiachibri@gmail.com';

/**
 * Create or find an existing support conversation between admin and a user.
 * The admin is stored as requester_id, the user as owner_id, with is_support = true.
 */
export const createOrFindSupportConversation = async (targetUserId: string): Promise<string | null> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const currentUser = session?.session?.user;
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
      console.error('Only admin can create support conversations');
      return null;
    }

    // Check if a support conversation already exists with this user
    const { data: existing } = await supabase
      .from('trade_conversations')
      .select('id')
      .eq('owner_id', targetUserId)
      .eq('requester_id', currentUser.id)
      .eq('is_support', true)
      .maybeSingle();

    if (existing) return existing.id;

    // Create new support conversation
    const { data: newConv, error } = await supabase
      .from('trade_conversations')
      .insert({
        requester_id: currentUser.id,
        owner_id: targetUserId,
        is_support: true,
        status: 'active',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating support conversation:', error);
      return null;
    }

    return newConv.id;
  } catch (error) {
    console.error('Error in createOrFindSupportConversation:', error);
    return null;
  }
};

/**
 * Check if a conversation is a support conversation
 */
export const isSupportConversation = (conversation: any): boolean => {
  return conversation?.is_support === true;
};
