import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";

interface TradeItem {
  id: string;
  name: string;
  image_url: string | null;
  category: string | null;
  condition: string | null;
  price_range_min: number | null;
  price_range_max: number | null;
}

const RecommendedLocalTradesSection = () => {
  const [items, setItems] = useState<TradeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLocalTrades();
  }, []);

  const fetchLocalTrades = async () => {
    try {
      const { data, error } = await supabase
        .from("items")
        .select("id, name, image_url, category, condition, price_range_min, price_range_max")
        .eq("is_available", true)
        .eq("status", "published")
        .limit(6);

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching local trades:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Recommended Local Trades</h2>
          </div>
          <p className="text-muted-foreground">
            Discover great trading opportunities near you
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate("/")}>
          View All
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card
            key={item.id}
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-all group"
            onClick={() => navigate(`/item/${item.id}`)}
          >
            <div className="aspect-square relative overflow-hidden bg-muted">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-muted-foreground">No image</span>
                </div>
              )}
              {item.condition && (
                <Badge className="absolute top-2 right-2" variant="secondary">
                  {item.condition}
                </Badge>
              )}
            </div>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold text-foreground line-clamp-1">
                {item.name}
              </h3>
              {item.category && (
                <p className="text-sm text-muted-foreground">{item.category}</p>
              )}
              {item.price_range_min !== null && item.price_range_max !== null && (
                <p className="text-sm font-medium text-foreground">
                  ${item.price_range_min} - ${item.price_range_max}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RecommendedLocalTradesSection;
