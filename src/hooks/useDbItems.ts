
import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { Item } from '@/types/item';

export function useDbItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      setError(null);
      if (!isSupabaseConfigured()) {
        setError("Supabase is not configured.");
        setItems([]);
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('items')
          .select('id, name, image_url, category, condition, description, tags');

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

