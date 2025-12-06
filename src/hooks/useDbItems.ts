
import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { Item } from '@/types/item';
import { mockItems } from '@/data/mockDemoData';
import { blockingService } from '@/services/blockingService';

export function useDbItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      setError(null);
      if (!isSupabaseConfigured()) {
        // Demo mode - use mock data
        setItems(mockItems);
        setLoading(false);
        return;
      }
      try {
        console.log('🔍 BLOCKING DEBUG: Starting items fetch with blocking checks');
        
        // Get blocked users first
        const blockedUsers = await blockingService.getBlockedUsers();
        const usersWhoBlockedMe = await blockingService.getUsersWhoBlockedMe();
        const allBlockedUsers = [...blockedUsers, ...usersWhoBlockedMe];

        console.log('🔍 BLOCKING DEBUG: Blocked users:', {
          blockedUsers,
          usersWhoBlockedMe,
          allBlockedUsers
        });

        // Build the query
        let query = supabase
          .from('items')
          .select('id, name, image_url, category, condition, description, tags, user_id, price_range_min, price_range_max')
          .eq('is_available', true) // Only show available items
          .eq('is_hidden', false) // Only show non-hidden items
          .eq('status', 'published'); // Only show published items (exclude drafts and removed items)

        // If there are blocked users, exclude their items
        if (allBlockedUsers.length > 0) {
          console.log('🔍 BLOCKING DEBUG: Applying blocked users filter:', allBlockedUsers);
          // Use the correct Supabase syntax for NOT IN
          query = query.not('user_id', 'in', `(${allBlockedUsers.map(id => `"${id}"`).join(',')})`);
        }

        const { data, error } = await query;

        console.log('🔍 BLOCKING DEBUG: Items query result:', {
          itemCount: data?.length || 0,
          error: error?.message || null,
          sampleUserIds: data?.slice(0, 3).map(item => item.user_id) || []
        });

        if (error) throw error;

        // Map DB items to your app's Item shape
        setItems(
          (data || []).map((item: any) => ({
            id: item.id,
            name: item.name,
            image: item.image_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f",
            category: item.category,
            condition: item.condition,
            description: item.description,
            tags: item.tags,
            user_id: item.user_id,
            priceRangeMin: item.price_range_min,
            priceRangeMax: item.price_range_max,
          }))
        );
      } catch (e: any) {
        setError(e.message || "Failed to fetch items.");
        setItems([]);
      }
      setLoading(false);
    }
    fetchItems();
  }, []);

  return { items, loading, error };
}

