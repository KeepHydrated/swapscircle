import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useUserHiddenItems = () => {
  const [hiddenItems, setHiddenItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHiddenItems = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setHiddenItems([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_hidden', true) // Only show hidden items
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching hidden items:', error);
        toast.error('Failed to load hidden items');
        setHiddenItems([]);
      } else {
        setHiddenItems(data || []);
      }
    } catch (error) {
      console.error('Error fetching hidden items:', error);
      toast.error('Failed to load hidden items');
      setHiddenItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHiddenItems();
  }, []);

  return {
    hiddenItems,
    loading,
    refetch: fetchHiddenItems
  };
};