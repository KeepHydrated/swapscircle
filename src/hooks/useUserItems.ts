
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
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_hidden', false) // Only show non-hidden items
          .in('status', includeDrafts ? ['published', 'draft', 'removed'] : ['published', 'removed']) // Include removed items for display
          .order('created_at', { ascending: false });

        if (error) throw error;

        console.log('🔍 RAW DATA FROM DB - First item:', data?.[0]);
        console.log('🔍 RAW DATA FROM DB - looking_for_categories:', data?.[0]?.looking_for_categories);

        // Map DB items to your app's Item shape
        setItems(
          (data || []).map((item: any) => ({
            id: item.id,
            name: item.name,
            image: item.image_url || null, // Don't use placeholder, show null when no image
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
          }))
        );
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
