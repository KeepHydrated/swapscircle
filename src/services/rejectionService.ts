import { supabase } from '@/integrations/supabase/client';

export const rejectItem = async (itemId: string): Promise<boolean> => {
  console.log('DEBUG: rejectItem called with itemId:', itemId);
  
  try {
    const user = await supabase.auth.getUser();
    console.log('DEBUG: Current user:', user.data.user?.id);
    
    if (!user.data.user?.id) {
      console.error('DEBUG: No user found');
      return false;
    }

    const { error } = await supabase
      .from('rejections')
      .insert({
        item_id: itemId,
        user_id: user.data.user.id
      });

    if (error) {
      console.error('DEBUG: Error rejecting item:', error);
      return false;
    }

    console.log('DEBUG: Successfully rejected item:', itemId);
    return true;
  } catch (error) {
    console.error('DEBUG: Exception in rejectItem:', error);
    return false;
  }
};

export const getUserRejectedItems = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('rejections')
      .select('item_id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

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

export const undoRejectItem = async (itemId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('rejections')
      .delete()
      .eq('item_id', itemId)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

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