import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Heart, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TradeItem {
  id: string;
  name: string;
  image_url: string;
  category: string;
  condition: string;
  price_range_min: number;
  price_range_max: number;
}

export const RecommendedTradesSection = () => {
  const [items, setItems] = useState<TradeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecommendedTrades();
  }, []);

  const fetchRecommendedTrades = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('id, name, image_url, category, condition, price_range_min, price_range_max')
        .eq('is_available', true)
        .eq('status', 'published')
        .limit(6);

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
      <div className="w-full px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-64 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-96 bg-muted animate-pulse rounded mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="w-full px-4 py-12">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Recommended Trades</h2>
          <p className="text-muted-foreground">No items available at the moment. Check back soon!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-12 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Recommended Trades</h2>
            <p className="text-muted-foreground">Items you might be interested in based on your preferences</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>
            View All <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="relative bg-card rounded-xl overflow-hidden shadow-md cursor-pointer group"
              onClick={() => navigate(`/item/${item.id}`)}
            >
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={item.image_url || '/placeholder.svg'}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <button
                  className="absolute top-3 right-3 w-8 h-8 bg-white hover:bg-gray-50 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Heart className="w-4 h-4 text-red-500" />
                </button>
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    ${item.price_range_min} - ${item.price_range_max}
                  </span>
                  {item.condition && (
                    <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
                      {item.condition}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
