import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Heart, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface TradeItem {
  id: string;
  name: string;
  image_url: string | null;
  category: string | null;
  condition: string | null;
  price_range_min: number | null;
  price_range_max: number | null;
  user_id: string;
}

const RecommendedLocalTradesSection = () => {
  const [items, setItems] = useState<TradeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedItemIds, setLikedItemIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchLocalTrades();
    if (user) {
      fetchLikedItems();
    }
  }, [user]);

  const fetchLocalTrades = async () => {
    try {
      const { data, error } = await supabase
        .from("items")
        .select("id, name, image_url, category, condition, price_range_min, price_range_max, user_id")
        .eq("is_available", true)
        .eq("status", "published")
        .limit(10);

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching local trades:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikedItems = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('liked_items')
        .select('item_id')
        .eq('user_id', user.id);
      
      if (data) {
        setLikedItemIds(new Set(data.map(l => l.item_id)));
      }
    } catch (error) {
      console.error('Error fetching liked items:', error);
    }
  };

  const handleLike = async (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/auth');
      return;
    }

    const isLiked = likedItemIds.has(itemId);
    
    // Optimistic update
    setLikedItemIds(prev => {
      const next = new Set(prev);
      if (isLiked) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });

    try {
      if (isLiked) {
        await supabase
          .from('liked_items')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', itemId);
      } else {
        await supabase
          .from('liked_items')
          .insert({ user_id: user.id, item_id: itemId });
      }
    } catch (error) {
      // Revert on error
      setLikedItemIds(prev => {
        const next = new Set(prev);
        if (isLiked) {
          next.add(itemId);
        } else {
          next.delete(itemId);
        }
        return next;
      });
      toast.error('Failed to update like');
    }
  };

  const handleTrade = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/auth');
      return;
    }
    // Navigate to item page for now - trade modal would be added here
    navigate(`/item/${itemId}`);
  };

  if (loading) {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="flex-shrink-0 w-48 sm:w-56 md:w-64 h-72 sm:h-80 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Local Items
        </h2>
        <button 
          onClick={() => navigate("/search")}
          className="text-sm text-primary hover:underline"
        >
          View all
        </button>
      </div>

      <div className="overflow-x-auto overflow-y-hidden pb-2 -mx-4 px-4">
        <div className="flex gap-3 min-w-max">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0 w-48 sm:w-56 md:w-64 h-72 sm:h-80 relative bg-card rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer group flex flex-col"
              onClick={() => navigate(`/item/${item.id}`)}
            >
              {/* Image */}
              <div className="flex-1 relative overflow-hidden">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <span className="text-muted-foreground text-sm">No image</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-3 h-20 flex flex-col justify-center">
                <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {item.price_range_min !== null && item.price_range_max !== null && (
                    <span className="text-xs text-muted-foreground">
                      ${item.price_range_min} - ${item.price_range_max}
                    </span>
                  )}
                  {item.condition && (
                    <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
                      {item.condition}
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleTrade(item.id, e)}
                  className="w-8 h-8 bg-primary rounded-full shadow-md flex items-center justify-center hover:bg-primary/90"
                  aria-label="Suggest trade"
                >
                  <RefreshCw className="w-4 h-4 text-primary-foreground" />
                </button>
                <button
                  onClick={(e) => handleLike(item.id, e)}
                  className={`w-8 h-8 rounded-full shadow-md flex items-center justify-center ${
                    likedItemIds.has(item.id) 
                      ? 'bg-red-500 text-white' 
                      : 'bg-background/90 text-foreground hover:bg-background'
                  }`}
                  aria-label={likedItemIds.has(item.id) ? "Unlike" : "Like"}
                >
                  <Heart 
                    className={`w-4 h-4 ${likedItemIds.has(item.id) ? 'fill-current' : ''}`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecommendedLocalTradesSection;
