
import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Item } from '@/types/item';

export function useUserItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, supabaseConfigured } = useAuth();

  useEffect(() => {
    async function fetchUserItems() {
      setLoading(true);
      setError(null);
      
      if (!isSupabaseConfigured() || !user) {
        setItems([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_available', true) // Only show available items
          .eq('is_hidden', false) // Only show non-hidden items
          .order('created_at', { ascending: false });

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
            lookingForCategories: item.looking_for_categories,
            lookingForConditions: item.looking_for_conditions,
            lookingForDescription: item.looking_for_description,
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
  }, [user, supabaseConfigured]);

  return { items, loading, error };
}
