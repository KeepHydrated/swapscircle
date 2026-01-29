import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SponsoredProduct } from '@/types/sponsored';

export const useSponsoredProducts = (searchQuery?: string, category?: string) => {
  const [sponsoredProducts, setSponsoredProducts] = useState<SponsoredProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSponsoredProducts = async () => {
      setLoading(true);
      
      try {
        let query = supabase
          .from('sponsored_products')
          .select('*')
          .eq('is_active', true)
          .eq('status', 'approved')
          .limit(3); // Show max 3 sponsored products

        // Filter by category if provided
        if (category) {
          query = query.eq('category', category);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching sponsored products:', error);
          setSponsoredProducts([]);
        } else {
          // Shuffle the results to show different ads
          const shuffled = (data || []).sort(() => Math.random() - 0.5);
          setSponsoredProducts(shuffled as SponsoredProduct[]);
        }
      } catch (err) {
        console.error('Error:', err);
        setSponsoredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSponsoredProducts();
  }, [searchQuery, category]);

  return { sponsoredProducts, loading };
};

export const trackSponsoredClick = async (productId: string, searchQuery?: string) => {
  try {
    const { error } = await supabase.functions.invoke('track-sponsored-click', {
      body: { productId, searchQuery }
    });
    
    if (error) {
      console.error('Error tracking click:', error);
    }
  } catch (err) {
    console.error('Error tracking sponsored click:', err);
  }
};
