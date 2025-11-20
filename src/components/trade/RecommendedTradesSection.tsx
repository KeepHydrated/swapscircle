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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card 
              key={item.id} 
              className="overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
              onClick={() => navigate(`/item/${item.id}`)}
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={item.image_url || '/placeholder.svg'}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <button 
                  className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm rounded-full p-2 hover:bg-background transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle like functionality
                  }}
                >
                  <Heart className="w-5 h-5 text-foreground" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <span className="inline-block bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded">
                    {item.condition}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-xl mb-2 text-foreground group-hover:text-primary transition-colors">
                  {item.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">{item.category}</p>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Value: </span>
                    <span className="font-semibold text-foreground">
                      ${item.price_range_min} - ${item.price_range_max}
                    </span>
                  </div>
                  <Button size="sm" variant="ghost" className="group-hover:bg-primary group-hover:text-primary-foreground">
                    View
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
