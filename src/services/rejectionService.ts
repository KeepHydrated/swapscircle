import { supabase } from '@/integrations/supabase/client';

export const rejectItem = async (itemId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('rejections')
      .insert({
        item_id: itemId,
        user_id: (await supabase.auth.getUser()).data.user?.id
      });

    if (error) {
      console.error('Error rejecting item:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error rejecting item:', error);
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