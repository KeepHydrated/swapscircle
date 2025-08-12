import { supabase } from '@/integrations/supabase/client';

export const rejectItem = async (itemId: string, myItemId?: string): Promise<boolean> => {
  console.log('DEBUG: rejectItem called with itemId:', itemId, 'myItemId:', myItemId);
  
  try {
    const user = await supabase.auth.getUser();
    console.log('DEBUG: Current user:', user.data.user?.id);
    
    if (!user.data.user?.id) {
      console.error('DEBUG: No user found');
      return false;
    }

    // If this is a pair-specific rejection, remove any previous GLOBAL rejection
    if (myItemId) {
      try {
        await supabase
          .from('rejections')
          .delete()
          .eq('item_id', itemId)
          .eq('user_id', user.data.user.id)
          .is('my_item_id', null);
      } catch (cleanupErr) {
        console.warn('DEBUG: Failed to cleanup existing global rejection (safe to ignore):', cleanupErr);
      }

      // If a pair-specific rejection already exists, short-circuit to success
      const { data: existingPair, error: existingErr } = await supabase
        .from('rejections')
        .select('item_id')
        .eq('item_id', itemId)
        .eq('user_id', user.data.user.id)
        .eq('my_item_id', myItemId)
        .maybeSingle();
      if (!existingErr && existingPair) {
        console.log('DEBUG: Pair-specific rejection already exists. Skipping insert.');
        return true;
      }
    }

    const { error } = await supabase
      .from('rejections')
      .insert({
        item_id: itemId,
        user_id: user.data.user.id,
        my_item_id: myItemId || null // If no myItemId provided, it's a global rejection
      });

    if (error) {
      console.error('DEBUG: Error rejecting item:', error);
      return false;
    }

    console.log('DEBUG: Successfully rejected item:', itemId, 'for my item:', myItemId);
    return true;
  } catch (error) {
    console.error('DEBUG: Exception in rejectItem:', error);
    return false;
  }
};

export const getUserRejectedItems = async (myItemId?: string): Promise<string[]> => {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user?.id) return [];

    let query = supabase
      .from('rejections')
      .select('item_id')
      .eq('user_id', user.data.user.id);

    if (myItemId) {
      // Get rejections specific to this item pair OR global rejections (where my_item_id is null)
      query = query.or(`my_item_id.eq.${myItemId},my_item_id.is.null`);
    } else {
      // If no specific item, only get global rejections
      query = query.is('my_item_id', null);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching rejected items:', error);
      return [];
    }

    return data?.map(r => r.item_id) || [];
  } catch (error) {
    console.error('Error fetching rejected items:', error);
    return [];
  }
};

export const undoRejectItem = async (itemId: string, myItemId?: string): Promise<boolean> => {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user?.id) return false;

    let query = supabase
      .from('rejections')
      .delete()
      .eq('item_id', itemId)
      .eq('user_id', user.data.user.id);

    if (myItemId) {
      query = query.eq('my_item_id', myItemId);
    } else {
      query = query.is('my_item_id', null);
    }

    const { error } = await query;

    if (error) {
      console.error('Error undoing rejection:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error undoing rejection:', error);
    return false;
  }
};