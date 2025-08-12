
import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Item } from '@/types/item';
import { mockUserItems } from '@/data/mockDemoData';

export function useUserItems(includeDrafts: boolean = false) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, supabaseConfigured } = useAuth();

  useEffect(() => {
    async function fetchUserItems() {
      setLoading(true);
      setError(null);
      
      if (!isSupabaseConfigured()) {
        // Demo mode - use mock data if user exists
        setItems(user ? mockUserItems : []);
        setLoading(false);
        return;
      }
      
      if (!user) {
        setItems([]);
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 FETCHING USER ITEMS - User ID:', user.id, 'Include Drafts:', includeDrafts);
        
        const { data, error } = await supabase
          .from('items')
          .select('id, name, looking_for_categories, looking_for_conditions, looking_for_description, image_url, image_urls, category, condition, description, tags, status, price_range_min, price_range_max, created_at')
          .eq('user_id', user.id)
          .eq('is_hidden', false) // Only show non-hidden items
          .in('status', includeDrafts ? ['published', 'draft', 'removed'] : ['published']) // Exclude removed items on homepage and matches
          .eq('is_available', true) // Hide items taken off the market after trade completion
          .order('created_at', { ascending: false });

        console.log('🔍 SUPABASE QUERY RESULT - Error:', error);
        console.log('🔍 SUPABASE QUERY RESULT - Data length:', data?.length);
        console.log('🔍 SUPABASE QUERY RESULT - First item RAW:', JSON.stringify(data?.[0], null, 2));

        if (error) throw error;

        // Map DB items to your app's Item shape
        const mappedItems = (data || []).map((item: any, index: number) => {
          if (index === 0) {
            console.log('🔍 MAPPING FIRST ITEM - Original:', {
              looking_for_categories: item.looking_for_categories,
              looking_for_conditions: item.looking_for_conditions,
              looking_for_description: item.looking_for_description
            });
          }
          
          const mappedItem = {
            id: item.id,
            name: item.name,
            image: item.image_url || (item.image_urls && item.image_urls.length > 0 ? item.image_urls[0] : null),
            image_url: item.image_url,
            image_urls: item.image_urls || [],
            category: item.category,
            condition: item.condition,
            description: item.description,
            tags: item.tags,
            status: item.status, // Include status to show draft/published state
            // Include both camelCase and snake_case for compatibility
            lookingForCategories: item.looking_for_categories,
            lookingForConditions: item.looking_for_conditions,
            lookingForDescription: item.looking_for_description,
            looking_for_categories: item.looking_for_categories,
            looking_for_conditions: item.looking_for_conditions,
            looking_for_description: item.looking_for_description,
            priceRangeMin: item.price_range_min,
            priceRangeMax: item.price_range_max,
          };
          
          if (index === 0) {
            console.log('🔍 MAPPING FIRST ITEM - Mapped:', {
              looking_for_categories: mappedItem.looking_for_categories,
              lookingForCategories: mappedItem.lookingForCategories,
              looking_for_conditions: mappedItem.looking_for_conditions,
              lookingForConditions: mappedItem.lookingForConditions
            });
          }
          
          return mappedItem;
        });
        
        console.log('🔍 FINAL MAPPED ITEMS - First item preview:', mappedItems[0] ? {
          id: mappedItems[0].id,
          name: mappedItems[0].name,
          looking_for_categories: mappedItems[0].looking_for_categories,
          lookingForCategories: mappedItems[0].lookingForCategories
        } : 'No items');
        
        setItems(mappedItems);
      } catch (e: any) {
        setError(e.message || "Failed to fetch your items.");
        setItems([]);
      }
      setLoading(false);
    }

    fetchUserItems();
    
    // Set up real-time subscription only if Supabase is configured
    if (!supabaseConfigured) {
      return;
    }

    const channel = supabase
      .channel('user-items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          console.log('Items changed, refetching...');
          fetchUserItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabaseConfigured]);

  return { items, loading, error };
}
