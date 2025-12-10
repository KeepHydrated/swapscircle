import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeftRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TradeItem {
  id: string;
  name: string;
  image_url: string;
  category: string;
  user_id: string;
}

export const RecommendedTradesSlider = () => {
  const [items, setItems] = useState<TradeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendedTrades();
  }, []);

  const fetchRecommendedTrades = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('id, name, image_url, category, user_id')
        .eq('is_available', true)
        .eq('status', 'published')
        .limit(10);

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching recommended trades:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Trending Items</h2>
        </div>
        <div className="overflow-x-auto overflow-y-hidden pb-2">
          <div className="flex gap-3 min-w-max">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-shrink-0 w-48 sm:w-56 md:w-64 h-64 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Trending Items</h2>
        <Link to="/" className="text-sm text-primary hover:underline">View all</Link>
      </div>
      
      <div className="overflow-x-auto overflow-y-hidden pb-2">
        <div className="flex gap-3 min-w-max">
          {items.map((item) => (
            <div key={item.id} className="flex-shrink-0 w-48 sm:w-56 md:w-64">
              <div className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all">
                <div className="relative aspect-[4/3]">
                  <img
                    src={item.image_url || '/placeholder.svg'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <button className="w-8 h-8 bg-green-500 rounded-full shadow-md flex items-center justify-center hover:bg-green-600 transition-colors">
                      <ArrowLeftRight className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold truncate text-foreground">{item.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
