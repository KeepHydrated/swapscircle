import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TrendingItemCard } from './TrendingItemCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

interface TrendingItem {
  id: string;
  name: string;
  description: string;
  image_url: string;
  category: string;
  condition: string;
  looking_for_categories: string[];
  looking_for_conditions: string[];
  looking_for_description: string;
  created_at: string;
}

export const TrendingItems: React.FC = () => {
  const [items, setItems] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrendingItems();
  }, []);

  const fetchTrendingItems = async () => {
    try {
      setLoading(true);
      
      // Fetch recent published items
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('status', 'published')
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setItems(data || []);
    } catch (error) {
      console.error('Error fetching trending items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (itemId: string) => {
    navigate(`/item/${itemId}`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="border rounded-lg p-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-24 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center text-center text-gray-500 py-12">
        <div className="text-4xl mb-3">🔥</div>
        <p className="text-base font-medium mb-1">No trending items yet</p>
        <p className="text-sm">Check back soon for popular items</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
      {items.map((item) => (
        <TrendingItemCard
          key={item.id}
          item={item}
          onClick={() => handleItemClick(item.id)}
        />
      ))}
    </div>
  );
};
