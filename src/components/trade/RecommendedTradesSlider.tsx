import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { supabase } from '@/integrations/supabase/client';
import { Heart } from 'lucide-react';

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
      <div className="w-full px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Recommended Trades</h2>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-64 h-80 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="w-full px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-foreground">Recommended Trades</h2>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {items.map((item) => (
            <CarouselItem key={item.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="relative aspect-square">
                  <img
                    src={item.image_url || '/placeholder.svg'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <button className="absolute top-2 right-2 bg-background/80 rounded-full p-2 hover:bg-background transition-colors">
                    <Heart className="w-5 h-5 text-foreground" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 truncate text-foreground">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{item.category}</p>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0" />
        <CarouselNext className="right-0" />
      </Carousel>
    </div>
  );
};
