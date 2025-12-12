import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Heart, RefreshCw, Check } from "lucide-react";
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
  // Match-related fields
  isMatch?: boolean;
  myItemImage?: string;
  myItemId?: string;
  myItemName?: string;
}

// Mock matched items to show in Local Items
const mockMatchedItems: TradeItem[] = [
  {
    id: "local-match-1",
    name: "Vintage Record Player",
    image_url: "https://images.unsplash.com/photo-1616707977737-3a6e64f7e3f0?w=800",
    category: "Electronics",
    condition: "Good",
    price_range_min: 150,
    price_range_max: 250,
    user_id: "demo-local-1",
    isMatch: true,
    myItemImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    myItemId: "my-local-1",
    myItemName: "Wireless Headphones"
  },
  {
    id: "local-match-2",
    name: "Leather Messenger Bag",
    image_url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800",
    category: "Fashion",
    condition: "Like New",
    price_range_min: 80,
    price_range_max: 120,
    user_id: "demo-local-2",
    isMatch: true,
    myItemImage: "https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=800",
    myItemId: "my-local-2",
    myItemName: "Denim Jacket"
  },
];

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
        .limit(8);

      if (error) throw error;
      // Merge mock matched items at the beginning with real items
      setItems([...mockMatchedItems, ...(data || [])]);
    } catch (error) {
      console.error("Error fetching local trades:", error);
      // Still show mock matched items on error
      setItems(mockMatchedItems);
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

  const handleTrade = (item: TradeItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // For matched demo items, navigate to messages with demo trade
    if (item.isMatch) {
      navigate('/messages', { 
        state: { 
          demoTrade: true,
          demoData: {
            theirItem: {
              name: item.name,
              image: item.image_url,
              image_url: item.image_url,
              image_urls: [item.image_url],
              description: 'Item available for trade',
              category: item.category,
              condition: item.condition,
              price_range_min: item.price_range_min,
              price_range_max: item.price_range_max
            },
            myItem: {
              name: item.myItemName,
              image: item.myItemImage,
              image_url: item.myItemImage,
              image_urls: [item.myItemImage],
              description: 'Your item for trade',
              category: 'Your Items',
              condition: 'Good'
            },
            partnerProfile: {
              id: item.user_id,
              username: 'Local Trader',
              avatar_url: null,
              created_at: '2024-01-15T10:30:00Z'
            }
          }
        } 
      });
      return;
    }
    
    // Navigate to item page for real items
    navigate(`/item/${item.id}`);
  };

  if (loading) {
    return (
      <div className="w-full space-y-4">
        <div>
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
        <h2 className="text-xl font-bold text-foreground">
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
              {/* Matched item thumbnail */}
              {item.isMatch && item.myItemImage && (
                <div className="absolute top-3 left-3 z-10">
                  <div className="w-12 h-12 rounded-full border-2 border-background shadow-lg overflow-hidden bg-background">
                    <img 
                      src={item.myItemImage} 
                      alt="Your matched item" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

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
              <div className="absolute top-3 right-3 flex gap-2">
                {/* Trade button - hover only */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.isMatch ? (
                    <button
                      onClick={(e) => handleTrade(item, e)}
                      className="w-8 h-8 bg-background rounded-full shadow-md flex items-center justify-center hover:bg-background/90"
                      aria-label="Accept trade"
                    >
                      <Check className="w-4 h-4 text-green-500" />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handleTrade(item, e)}
                      className="w-8 h-8 bg-primary rounded-full shadow-md flex items-center justify-center hover:bg-primary/90"
                      aria-label="Suggest trade"
                    >
                      <RefreshCw className="w-4 h-4 text-primary-foreground" />
                    </button>
                  )}
                </div>
                {/* Heart button - always visible when liked, hover otherwise */}
                <button
                  onClick={(e) => handleLike(item.id, e)}
                  className={`w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-opacity ${
                    likedItemIds.has(item.id) 
                      ? 'bg-red-500 text-white opacity-100' 
                      : 'bg-background/90 text-foreground hover:bg-background opacity-0 group-hover:opacity-100'
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
