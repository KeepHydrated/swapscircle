import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Repeat, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import ExploreItemModal from "@/components/items/ExploreItemModal";
import TradeItemSelectionModal from "@/components/trade/TradeItemSelectionModal";
import { Item } from "@/types/item";
import { useItemsInActiveTrades } from "@/hooks/useItemsInActiveTrades";

interface TradeItem {
  id: string;
  name: string;
  image_url: string | null;
  category: string | null;
  condition: string | null;
  price_range_min: number | null;
  price_range_max: number | null;
  user_id: string;
  description?: string | null;
  // Match-related fields
  isMatch?: boolean;
  myItemImage?: string;
  myItemId?: string;
  myItemName?: string;
}

const RecommendedLocalTradesSection = () => {
  const [items, setItems] = useState<TradeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedItemIds, setLikedItemIds] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);
  const [selectedMatchedItemImage, setSelectedMatchedItemImage] = useState<string>('');
  const [selectedMatchedItemId, setSelectedMatchedItemId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeTargetItem, setTradeTargetItem] = useState<Item | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { itemsInActiveTrades } = useItemsInActiveTrades();

  // Sample fallback items to ensure content is always displayed
  const SAMPLE_ITEMS: TradeItem[] = [
    {
      id: '9a1c5bbb-3dc6-411a-990f-1fe3d3272ec8',
      name: 'Canon DSLR Camera',
      image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400',
      category: 'Electronics',
      condition: 'Like New',
      price_range_min: 300,
      price_range_max: 600,
      user_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      description: 'Professional grade camera with 18-55mm lens'
    },
    {
      id: '97d0aedc-c4c7-420d-9caa-8aa5e92f2498',
      name: 'Taylor Acoustic Guitar',
      image_url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400',
      category: 'Music',
      condition: 'Good',
      price_range_min: 200,
      price_range_max: 400,
      user_id: 'b2c3d4e5-f6a7-8901-bcde-f23456789012',
      description: 'Beautiful sound, well-maintained'
    },
    {
      id: '35db9963-a8e4-4b04-bd1e-ef5ea56f3755',
      name: 'Vintage Watch Collection',
      image_url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400',
      category: 'Fashion',
      condition: 'Good',
      price_range_min: 150,
      price_range_max: 400,
      user_id: 'e5f6a7b8-c9d0-1234-efab-567890123456',
      description: 'Set of 3 classic timepieces'
    },
    {
      id: 'cd867711-6abc-4896-88ed-444f2f8c609c',
      name: 'Vintage Leather Messenger Bag',
      image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
      category: 'Fashion',
      condition: 'Good',
      price_range_min: 50,
      price_range_max: 150,
      user_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      description: 'Beautiful aged leather messenger bag'
    },
    {
      id: '4a5d56cd-272d-483b-aa5c-c80c7eb4491c',
      name: 'Espresso Machine',
      image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400',
      category: 'Home',
      condition: 'Like New',
      price_range_min: 200,
      price_range_max: 400,
      user_id: 'd4e5f6a7-b8c9-0123-defa-456789012345',
      description: 'Makes great coffee, fully automatic'
    },
    {
      id: 'dbf0d188-1b1a-4c1c-ba26-9d5561622645',
      name: 'Wireless Bluetooth Speaker',
      image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
      category: 'Electronics',
      condition: 'Like New',
      price_range_min: 80,
      price_range_max: 180,
      user_id: 'f6a7b8c9-d0e1-2345-fabc-678901234567',
      description: 'JBL, excellent sound quality'
    }
  ];

  useEffect(() => {
    fetchLocalTrades();
    if (user) {
      fetchLikedItems();
    }
  }, [user, itemsInActiveTrades]);

  const fetchLocalTrades = async () => {
    try {
      // If user is logged in, try to fetch items with matches first
      if (user) {
        // Get user's items
        const { data: myItems } = await supabase
          .from('items')
          .select('id, name, image_url, looking_for_categories')
          .eq('user_id', user.id)
          .eq('is_available', true)
          .eq('status', 'published');

        if (myItems && myItems.length > 0) {
          // Find items that match with user's items (mutual likes create matches)
          const { data: likedByMe } = await supabase
            .from('liked_items')
            .select('item_id, my_item_id')
            .eq('user_id', user.id);

          const { data: likedByOthers } = await supabase
            .from('liked_items')
            .select('item_id, user_id, my_item_id')
            .in('item_id', myItems.map(i => i.id));

          // Find mutual matches
          const matchedItems: TradeItem[] = [];
          
          if (likedByMe && likedByOthers) {
            for (const otherLike of likedByOthers) {
              // Check if I liked any of their items
              const { data: theirItems } = await supabase
                .from('items')
                .select('id')
                .eq('user_id', otherLike.user_id)
                .eq('is_available', true);
              
              if (theirItems) {
                for (const theirItem of theirItems) {
                  const myLikeOfTheirs = likedByMe.find(l => l.item_id === theirItem.id);
                  if (myLikeOfTheirs) {
                    // This is a match - get the full item details
                    const { data: fullItem } = await supabase
                      .from('items')
                      .select('*')
                      .eq('id', theirItem.id)
                      .single();

                    const myMatchedItem = myItems.find(i => i.id === otherLike.item_id);
                    
                    if (fullItem && myMatchedItem) {
                      matchedItems.push({
                        id: fullItem.id,
                        name: fullItem.name,
                        image_url: fullItem.image_url,
                        category: fullItem.category,
                        condition: fullItem.condition,
                        price_range_min: fullItem.price_range_min,
                        price_range_max: fullItem.price_range_max,
                        user_id: fullItem.user_id,
                        description: fullItem.description,
                        isMatch: true,
                        myItemImage: myMatchedItem.image_url || undefined,
                        myItemId: myMatchedItem.id,
                        myItemName: myMatchedItem.name
                      });
                    }
                  }
                }
              }
            }
          }

          if (matchedItems.length > 0) {
            // Also fetch some regular items to fill the carousel
            const { data: regularItems } = await supabase
              .from("items")
              .select("id, name, image_url, category, condition, price_range_min, price_range_max, user_id, description")
              .eq("is_available", true)
              .eq("status", "published")
              .neq("user_id", user.id)
              .not('id', 'in', `(${matchedItems.map(i => i.id).join(',')})`)
              .limit(6);

            // Filter out items in active trades
            const allItems = [...matchedItems, ...(regularItems || [])].filter(item => !itemsInActiveTrades.has(item.id));
            setItems(allItems);
            setLoading(false);
            return;
          }
        }
      }

      // Fallback: fetch regular local items if no matches
      const { data, error } = await supabase
        .from("items")
        .select("id, name, image_url, category, condition, price_range_min, price_range_max, user_id, description")
        .eq("is_available", true)
        .eq("status", "published")
        .limit(8);

      if (error) throw error;
      // Filter out items in active trades
      const filteredData = (data || []).filter(item => !itemsInActiveTrades.has(item.id));
      // Use sample items as fallback if no real items found
      setItems(filteredData.length > 0 ? filteredData : SAMPLE_ITEMS);
    } catch (error) {
      console.error("Error fetching local trades:", error);
      // Use sample items as fallback on error
      setItems(SAMPLE_ITEMS);
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

  const handleItemClick = (item: TradeItem, index: number) => {
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
    
    // Set matched item data if this is a match
    if (item.isMatch && item.myItemImage && item.myItemId) {
      setSelectedMatchedItemImage(item.myItemImage);
      setSelectedMatchedItemId(item.myItemId);
    } else {
      setSelectedMatchedItemImage('');
      setSelectedMatchedItemId('');
    }
    
    setIsModalOpen(true);
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

  const handleTradeClick = async (item: TradeItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // For matched items, create a real trade conversation
    if (item.isMatch && item.myItemId) {
      try {
        // Check if a conversation already exists
        const { data: existing } = await supabase
          .from('trade_conversations')
          .select('id')
          .eq('requester_id', user.id)
          .eq('owner_id', item.user_id)
          .eq('owner_item_id', item.id)
          .maybeSingle();

        if (existing) {
          navigate(`/messages?conversation=${existing.id}`);
          return;
        }

        // Create new trade conversation
        const { data: conversation, error } = await supabase
          .from('trade_conversations')
          .insert({
            requester_id: user.id,
            owner_id: item.user_id,
            requester_item_id: item.myItemId,
            requester_item_ids: [item.myItemId],
            owner_item_id: item.id,
            status: 'pending'
          })
          .select('*')
          .single();

        if (error) {
          console.error('Error creating trade:', error);
          toast.error('Failed to start trade chat');
          return;
        }

        // Send initial trade message
        const message = `Hi! I'd like to trade my ${item.myItemName} for your ${item.name}. Let me know if you're interested!`;

        await supabase
          .from('trade_messages')
          .insert({
            conversation_id: conversation.id,
            sender_id: user.id,
            message: message
          });

        navigate('/messages', { 
          state: { 
            tradeConversationId: conversation.id, 
            newTrade: true 
          } 
        });
      } catch (error) {
        console.error('Error requesting trade:', error);
        toast.error('Failed to start trade chat');
      }
      return;
    }
    
    // Open trade modal for non-matched items
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

  // Always render - we have fallback items now

  return (
    <>
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
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex-shrink-0 w-48 sm:w-56 md:w-64 h-72 sm:h-80 relative bg-card rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer group flex flex-col"
                onClick={() => handleItemClick(item, index)}
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
                        onClick={(e) => handleTradeClick(item, e)}
                        className="w-8 h-8 bg-white hover:bg-gray-50 rounded-full shadow-md flex items-center justify-center"
                        aria-label="Accept trade"
                      >
                        <Check className="w-4 h-4 text-green-500" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleTradeClick(item, e)}
                        className="w-8 h-8 bg-white hover:bg-gray-50 rounded-full shadow-md flex items-center justify-center"
                        aria-label="Suggest trade"
                      >
                        <Repeat className="w-4 h-4 text-green-500" />
                      </button>
                    )}
                  </div>
                  {/* Heart button - always visible when liked, hover otherwise */}
                  <button
                    onClick={(e) => handleLike(item.id, e)}
                    className={`w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-opacity ${
                      likedItemIds.has(item.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                    aria-label={likedItemIds.has(item.id) ? "Unlike" : "Like"}
                  >
                    <Heart 
                      className="w-4 h-4 text-red-500" 
                      fill={likedItemIds.has(item.id) ? "red" : "none"}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Item Modal */}
      {selectedItem && (
        <ExploreItemModal
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedItem(null);
          }}
          item={selectedItem}
          matchedItemImage={selectedMatchedItemImage}
          matchedItemId={selectedMatchedItemId}
          onNavigatePrev={() => {
            if (selectedItemIndex > 0) {
              handleItemClick(items[selectedItemIndex - 1], selectedItemIndex - 1);
            }
          }}
          onNavigateNext={() => {
            if (selectedItemIndex < items.length - 1) {
              handleItemClick(items[selectedItemIndex + 1], selectedItemIndex + 1);
            }
          }}
          currentIndex={selectedItemIndex}
          totalItems={items.length}
          liked={likedItemIds.has(selectedItem.id)}
          onLike={() => {
            setLikedItemIds(prev => {
              const newSet = new Set(prev);
              if (newSet.has(selectedItem.id)) {
                newSet.delete(selectedItem.id);
              } else {
                newSet.add(selectedItem.id);
              }
              return newSet;
            });
          }}
        />
      )}

      {/* Trade Selection Modal */}
      <TradeItemSelectionModal
        isOpen={tradeModalOpen}
        onClose={() => {
          setTradeModalOpen(false);
          setTradeTargetItem(null);
        }}
        targetItem={tradeTargetItem}
      />
    </>
  );
};

export default RecommendedLocalTradesSection;
