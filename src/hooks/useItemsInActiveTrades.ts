import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook to get item IDs that are currently in active trade conversations.
 * These items should be hidden from search, matches, and feeds.
 */
export function useItemsInActiveTrades() {
  const [itemIds, setItemIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchActiveTradeItems = async () => {
      if (!user) {
        setItemIds(new Set());
        setLoading(false);
        return;
      }

      try {
        // Fetch active trade conversations (pending or in progress - not completed/rejected)
        const { data: conversations, error } = await supabase
          .from('trade_conversations')
          .select('requester_item_id, requester_item_ids, owner_item_id, owner_item_ids')
          .or(`requester_id.eq.${user.id},owner_id.eq.${user.id}`)
          .in('status', ['pending', 'accepted', 'in_progress']);

        if (error) {
          console.error('Error fetching active trade items:', error);
          setLoading(false);
          return;
        }

        // Collect all item IDs from active trades
        const activeItemIds = new Set<string>();
        
        conversations?.forEach(conv => {
          // Add single item IDs
          if (conv.requester_item_id) {
            activeItemIds.add(conv.requester_item_id);
          }
          if (conv.owner_item_id) {
            activeItemIds.add(conv.owner_item_id);
          }
          
          // Add array item IDs
          if (conv.requester_item_ids && Array.isArray(conv.requester_item_ids)) {
            conv.requester_item_ids.forEach((id: string) => activeItemIds.add(id));
          }
          if (conv.owner_item_ids && Array.isArray(conv.owner_item_ids)) {
            conv.owner_item_ids.forEach((id: string) => activeItemIds.add(id));
          }
        });

        setItemIds(activeItemIds);
      } catch (err) {
        console.error('Error in fetchActiveTradeItems:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveTradeItems();
  }, [user]);

  return { itemsInActiveTrades: itemIds, loading };
}
