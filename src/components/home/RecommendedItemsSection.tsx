import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import ExploreItemModal from "@/components/items/ExploreItemModal";
import TradeItemSelectionModal from "@/components/trade/TradeItemSelectionModal";
import { Item } from "@/types/item";
import { useItemsInActiveTrades } from "@/hooks/useItemsInActiveTrades";
import { Heart, Repeat } from "lucide-react";
import { toast } from "sonner";

interface RecommendedItem {
  id: string;
  name: string;
  image_url: string | null;
  category: string | null;
  condition: string | null;
  price_range_min: number | null;
  price_range_max: number | null;
  user_id: string;
  description?: string | null;
}

// Sample fallback items
const SAMPLE_ITEMS: RecommendedItem[] = [
  {
    id: 'rec-sample-1',
    name: 'Espresso Machine',
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400',
    category: 'Home',
    condition: 'Like New',
    price_range_min: 200,
    price_range_max: 400,
    user_id: 'sample-user-1',
    description: 'Professional grade espresso machine'
  },
  {
    id: 'rec-sample-2',
    name: 'Antique Desk Lamp',
    image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
    category: 'Home',
    condition: 'Good',
    price_range_min: 50,
    price_range_max: 120,
    user_id: 'sample-user-2',
    description: 'Vintage brass desk lamp'
  },
  {
    id: 'rec-sample-3',
    name: 'Vintage Watch Collection',
    image_url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400',
    category: 'Accessories',
    condition: 'Good',
    price_range_min: 150,
    price_range_max: 400,
    user_id: 'sample-user-3',
    description: 'Collection of vintage timepieces'
  },
  {
    id: 'rec-sample-4',
    name: 'Leather Messenger Bag',
    image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
    category: 'Fashion',
    condition: 'Like New',
    price_range_min: 80,
    price_range_max: 180,
    user_id: 'sample-user-4',
    description: 'Handcrafted leather bag'
  },
  {
    id: 'rec-sample-5',
    name: 'Polaroid Camera',
    image_url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400',
    category: 'Electronics',
    condition: 'Good',
    price_range_min: 60,
    price_range_max: 120,
    user_id: 'sample-user-5',
    description: 'Instant film camera'
  },
  {
    id: 'rec-sample-6',
    name: 'Vinyl Record Player',
    image_url: 'https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?w=400',
    category: 'Electronics',
    condition: 'Like New',
    price_range_min: 150,
    price_range_max: 300,
    user_id: 'sample-user-6',
    description: 'High fidelity turntable'
  }
];

const RecommendedItemsSection = () => {
  const [items, setItems] = useState<RecommendedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedItemIds, setLikedItemIds] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeTargetItem, setTradeTargetItem] = useState<Item | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { itemsInActiveTrades } = useItemsInActiveTrades();

  useEffect(() => {
    fetchRecommendedItems();
    if (user) {
      fetchLikedItems();
    }
  }, [user, itemsInActiveTrades]);

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

  const fetchRecommendedItems = async () => {
    try {
      let preferredCategories: string[] = [];

      if (user) {
        // Get categories from items user has liked
        const { data: likedItems } = await supabase
          .from('liked_items')
          .select('item_id')
          .eq('user_id', user.id);

        if (likedItems && likedItems.length > 0) {
          const { data: likedItemDetails } = await supabase
            .from('items')
            .select('category')
            .in('id', likedItems.map(l => l.item_id));

          if (likedItemDetails) {
            const likedCategories = likedItemDetails
              .map(i => i.category)
              .filter(Boolean) as string[];
            preferredCategories.push(...likedCategories);
          }
        }

        // Get "looking for" categories from user's posted items
        const { data: myItems } = await supabase
          .from('items')
          .select('looking_for_categories')
          .eq('user_id', user.id)
          .eq('is_available', true)
          .eq('status', 'published');

        if (myItems) {
          for (const item of myItems) {
            if (item.looking_for_categories) {
              preferredCategories.push(...item.looking_for_categories);
            }
          }
        }
      }

      // Remove duplicates
      preferredCategories = [...new Set(preferredCategories)];

      let recommendedItems: RecommendedItem[] = [];

      if (preferredCategories.length > 0) {
        // Fetch items matching preferred categories
        const { data, error } = await supabase
          .from('items')
          .select('id, name, image_url, category, condition, price_range_min, price_range_max, user_id, description')
          .eq('is_available', true)
          .eq('status', 'published')
          .neq('user_id', user?.id || '')
          .in('category', preferredCategories)
          .limit(10);

        if (!error && data && data.length > 0) {
          recommendedItems = data.filter(item => !itemsInActiveTrades.has(item.id));
        }
      }

      // If not enough items, fetch additional general items
      if (recommendedItems.length < 6) {
        const existingIds = recommendedItems.map(i => i.id);
        const { data: moreItems } = await supabase
          .from('items')
          .select('id, name, image_url, category, condition, price_range_min, price_range_max, user_id, description')
          .eq('is_available', true)
          .eq('status', 'published')
          .neq('user_id', user?.id || '')
          .limit(10 - recommendedItems.length);

        if (moreItems) {
          const filteredMore = moreItems
            .filter(item => !existingIds.includes(item.id))
            .filter(item => !itemsInActiveTrades.has(item.id));
          recommendedItems = [...recommendedItems, ...filteredMore];
        }
      }

      setItems(recommendedItems.length > 0 ? recommendedItems : SAMPLE_ITEMS);
    } catch (error) {
      console.error("Error fetching recommended items:", error);
      setItems(SAMPLE_ITEMS);
    } finally {
      setLoading(false);
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

  const handleTradeClick = (item: RecommendedItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/auth');
      return;
    }
    
    const mappedItem: Item = {
      id: item.id,
      name: item.name,
      image: item.image_url || '/placeholder.svg',
      priceRangeMin: item.price_range_min || undefined,
      priceRangeMax: item.price_range_max || undefined,
      condition: item.condition || undefined,
      user_id: item.user_id
    };
    setTradeTargetItem(mappedItem);
    setTradeModalOpen(true);
  };

  const handleItemClick = (item: RecommendedItem, index: number) => {
    const mappedItem: Item = {
      id: item.id,
      name: item.name,
      image: item.image_url || '/placeholder.svg',
      category: item.category || undefined,
      condition: item.condition || undefined,
      description: item.description || undefined,
      priceRangeMin: item.price_range_min || undefined,
      priceRangeMax: item.price_range_max || undefined,
      user_id: item.user_id
    };
    setSelectedItem(mappedItem);
    setSelectedItemIndex(index);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="w-full space-y-4">
        <div>
          <Skeleton className="h-6 w-48" />
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
    <>
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">
            Recommended For You
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
            {items.map((item, index) => {
              const isLiked = likedItemIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className="flex-shrink-0 w-48 sm:w-56 md:w-64 h-72 sm:h-80 relative bg-card rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer group flex flex-col"
                  onClick={() => handleItemClick(item, index)}
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

                    {/* Action buttons - visible on hover */}
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Trade button */}
                      <button
                        onClick={(e) => handleTradeClick(item, e)}
                        className="w-10 h-10 bg-white hover:bg-gray-50 rounded-full shadow-md flex items-center justify-center transition-colors"
                      >
                        <Repeat className="w-5 h-5 text-green-600" />
                      </button>
                      {/* Like button */}
                      <button
                        onClick={(e) => handleLike(item.id, e)}
                        className="w-10 h-10 bg-white hover:bg-gray-50 rounded-full shadow-md flex items-center justify-center transition-colors"
                      >
                        <Heart 
                          className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-red-500'}`} 
                        />
                      </button>
                    </div>
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
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Item detail modal */}
      <ExploreItemModal
        item={selectedItem}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentIndex={selectedItemIndex}
        totalItems={items.length}
        onNavigatePrev={() => {
          const newIndex = selectedItemIndex > 0 ? selectedItemIndex - 1 : items.length - 1;
          const item = items[newIndex];
          if (item) {
            handleItemClick(item, newIndex);
          }
        }}
        onNavigateNext={() => {
          const newIndex = selectedItemIndex < items.length - 1 ? selectedItemIndex + 1 : 0;
          const item = items[newIndex];
          if (item) {
            handleItemClick(item, newIndex);
          }
        }}
      />

      {/* Trade selection modal */}
      {tradeTargetItem && (
        <TradeItemSelectionModal
          isOpen={tradeModalOpen}
          onClose={() => {
            setTradeModalOpen(false);
            setTradeTargetItem(null);
          }}
          targetItem={tradeTargetItem}
        />
      )}
    </>
  );
};

export default RecommendedItemsSection;
