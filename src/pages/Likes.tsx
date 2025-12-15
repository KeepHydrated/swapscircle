import React, { useState, useEffect } from 'react';
import { Heart, Repeat, Check } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { supabase } from '@/integrations/supabase/client';
import { Item } from '@/types/item';
import ExploreItemModal from '@/components/items/ExploreItemModal';
import TradeItemSelectionModal from '@/components/trade/TradeItemSelectionModal';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { createTradeConversation, sendTradeMessage } from '@/services/tradeService';
interface MatchedItemInfo {
  id: string;
  name: string;
  image_url: string;
}

interface LikedItemWithMatch {
  id: string;
  item_id: string;
  created_at: string;
  matchedItem?: MatchedItemInfo;
  item: {
    id: string;
    name: string;
    image_url: string;
    image_urls: string[];
    description: string;
    category: string;
    condition: string;
    price_range_min: number;
    price_range_max: number;
    user_id: string;
    status: string;
  };
}
// Demo matched items for display - defined outside component
const demoMatchedItems: LikedItemWithMatch[] = [
  {
    id: 'demo-liked-1',
    item_id: 'demo-item-1',
    created_at: new Date().toISOString(),
    matchedItem: {
      id: 'my-demo-1',
      name: 'My Vintage Camera',
      image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200'
    },
    item: {
      id: 'demo-item-1',
      name: 'Leather Messenger Bag',
      image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
      image_urls: [],
      description: 'Beautiful leather bag',
      category: 'Accessories',
      condition: 'Like New',
      price_range_min: 80,
      price_range_max: 150,
      user_id: 'demo-user-1',
      status: 'published'
    }
  },
  {
    id: 'demo-liked-2',
    item_id: 'demo-item-2',
    created_at: new Date().toISOString(),
    matchedItem: {
      id: 'my-demo-2',
      name: 'My Headphones',
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'
    },
    item: {
      id: 'demo-item-2',
      name: 'Mechanical Keyboard',
      image_url: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=400',
      image_urls: [],
      description: 'Cherry MX switches',
      category: 'Electronics',
      condition: 'Good',
      price_range_min: 100,
      price_range_max: 200,
      user_id: 'demo-user-2',
      status: 'published'
    }
  },
  {
    id: 'demo-liked-3',
    item_id: 'demo-item-3',
    created_at: new Date().toISOString(),
    item: {
      id: 'demo-item-3',
      name: 'Vintage Record Player',
      image_url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400',
      image_urls: [],
      description: 'Classic turntable',
      category: 'Electronics',
      condition: 'Good',
      price_range_min: 150,
      price_range_max: 300,
      user_id: 'demo-user-3',
      status: 'published'
    }
  },
  {
    id: 'demo-liked-4',
    item_id: 'demo-item-4',
    created_at: new Date().toISOString(),
    matchedItem: {
      id: 'my-demo-3',
      name: 'My Watch',
      image_url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=200'
    },
    item: {
      id: 'demo-item-4',
      name: 'Polaroid Camera',
      image_url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400',
      image_urls: [],
      description: 'Instant film camera',
      category: 'Electronics',
      condition: 'Like New',
      price_range_min: 60,
      price_range_max: 120,
      user_id: 'demo-user-4',
      status: 'published'
    }
  }
];

const Likes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [likedItems, setLikedItems] = useState<LikedItemWithMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeTargetItem, setTradeTargetItem] = useState<Item | null>(null);
  const [preSelectedItemId, setPreSelectedItemId] = useState<string | undefined>(undefined);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (user) {
      fetchLikedItems();
    } else {
      setLikedItems([]);
      setLoading(false);
    }
  }, [user]);

  const fetchLikedItems = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      console.log('[Likes] fetchLikedItems called, authUser:', authUser?.id);
      
      if (!authUser) {
        console.log('[Likes] No auth user, setting empty');
        setLikedItems([]);
        setLoading(false);
        return;
      }

      // Get all liked item IDs
      const { data: likedData, error: likedError } = await supabase
        .from('liked_items')
        .select('id, item_id, created_at')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });

      console.log('[Likes] liked_items query result:', { likedData, likedError, count: likedData?.length });

      if (likedError) throw likedError;
      
      // If no real liked items, show empty list
      if (!likedData || likedData.length === 0) {
        console.log('[Likes] No liked items found');
        setLikedItems([]);
        setLoading(false);
        return;
      }

      // Fetch the actual items
      const itemIds = likedData.map(l => l.item_id);
      console.log('[Likes] Fetching items with IDs:', itemIds);
      
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('id, name, image_url, image_urls, description, category, condition, price_range_min, price_range_max, user_id, status')
        .in('id', itemIds);
      
      console.log('[Likes] items query result:', { itemsData, itemsError, count: itemsData?.length });

      if (itemsError) throw itemsError;

      // Fetch mutual matches for this user
      const { data: matchesData } = await supabase
        .from('mutual_matches')
        .select('*')
        .or(`user1_id.eq.${authUser.id},user2_id.eq.${authUser.id}`);

      // Create a map of other user's item -> my item for matches
      const matchMap = new Map<string, string>();
      matchesData?.forEach(match => {
        if (match.user1_id === authUser.id) {
          matchMap.set(match.user2_item_id, match.user1_item_id);
        } else {
          matchMap.set(match.user1_item_id, match.user2_item_id);
        }
      });

      // Get user's own items for match thumbnails
      const myItemIds = Array.from(new Set(matchMap.values()));
      let myItemsMap = new Map<string, MatchedItemInfo>();
      
      if (myItemIds.length > 0) {
        const { data: myItems } = await supabase
          .from('items')
          .select('id, name, image_url')
          .in('id', myItemIds);
        
        myItems?.forEach(item => {
          myItemsMap.set(item.id, {
            id: item.id,
            name: item.name,
            image_url: item.image_url || ''
          });
        });
      }

      // Merge the data with match info
      const itemsMap = new Map(itemsData?.map(item => [item.id, item]) || []);
      const mergedItems: LikedItemWithMatch[] = likedData.map(liked => {
        const myMatchedItemId = matchMap.get(liked.item_id);
        const matchedItem = myMatchedItemId ? myItemsMap.get(myMatchedItemId) : undefined;
        
        return {
          id: liked.id,
          item_id: liked.item_id,
          created_at: liked.created_at,
          matchedItem,
          item: itemsMap.get(liked.item_id)
        };
      }).filter(item => item.item && item.item.status !== 'removed') as LikedItemWithMatch[];

      // Only show real items
      setLikedItems(mergedItems);
    } catch (error) {
      console.error('Error fetching liked items:', error);
      // Show empty list on error
      setLikedItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlike = async (itemId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { error } = await supabase
        .from('liked_items')
        .delete()
        .eq('user_id', user.id)
        .eq('item_id', itemId);
      
      if (error) throw error;
      setLikedItems(prev => prev.filter(item => item.item_id !== itemId));
      toast({
        title: 'Removed',
        description: 'Item removed from likes'
      });
    } catch (error) {
      console.error('Error unliking item:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove item',
        variant: 'destructive'
      });
    }
  };

  const handleItemClick = (item: LikedItemWithMatch, index: number) => {
    setCurrentIndex(index);
    setSelectedItem({
      id: item.item.id,
      name: item.item.name,
      image: item.item.image_url || item.item.image_urls?.[0] || '',
      description: item.item.description,
      category: item.item.category,
      condition: item.item.condition,
      priceRangeMin: item.item.price_range_min,
      priceRangeMax: item.item.price_range_max,
      user_id: item.item.user_id
    } as Item);
    setIsModalOpen(true);
  };

  const handleNavigatePrev = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      const item = likedItems[newIndex];
      setSelectedItem({
        id: item.item.id,
        name: item.item.name,
        image: item.item.image_url || item.item.image_urls?.[0] || '',
        description: item.item.description,
        category: item.item.category,
        condition: item.item.condition,
        priceRangeMin: item.item.price_range_min,
        priceRangeMax: item.item.price_range_max,
        user_id: item.item.user_id
      } as Item);
    }
  };

  const handleNavigateNext = () => {
    if (currentIndex < likedItems.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      const item = likedItems[newIndex];
      setSelectedItem({
        id: item.item.id,
        name: item.item.name,
        image: item.item.image_url || item.item.image_urls?.[0] || '',
        description: item.item.description,
        category: item.item.category,
        condition: item.item.condition,
        priceRangeMin: item.item.price_range_min,
        priceRangeMax: item.item.price_range_max,
        user_id: item.item.user_id
      } as Item);
    }
  };

  const handleTradeClick = (e: React.MouseEvent, item: LikedItemWithMatch) => {
    e.stopPropagation();
    setTradeTargetItem({
      id: item.item.id,
      name: item.item.name,
      image: item.item.image_url || item.item.image_urls?.[0] || '',
      user_id: item.item.user_id,
      priceRangeMin: item.item.price_range_min,
      priceRangeMax: item.item.price_range_max,
      condition: item.item.condition
    } as Item);
    setIsTradeModalOpen(true);
  };

  // Handle checkmark click for matched items - directly create trade and navigate to messages
  const handleMatchedTradeClick = async (e: React.MouseEvent, item: LikedItemWithMatch) => {
    e.stopPropagation();
    
    // Check if user is logged in
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Must have a matched item
    if (!item.matchedItem) {
      // Fall back to trade modal if no matched item
      handleTradeClick(e, item);
      return;
    }

    const myItemId = item.matchedItem.id;
    const theirItemId = item.item.id;
    const ownerId = item.item.user_id;

    // Check if it's a demo item - navigate to messages with test conversation
    const isDemo = ownerId.startsWith('demo-') || myItemId.startsWith('my-demo');
    if (isDemo) {
      navigate('/messages', {
        state: {
          tradeConversationId: 'test-conversation-123',
          newTrade: true
        }
      });
      return;
    }

    // Prevent trading with yourself
    if (ownerId === user.id) {
      toast({
        title: "Cannot trade",
        description: "You cannot trade with yourself",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if a conversation already exists
      const { data: existing } = await supabase
        .from('trade_conversations')
        .select('id')
        .eq('requester_id', user.id)
        .eq('owner_id', ownerId)
        .eq('owner_item_id', theirItemId)
        .maybeSingle();

      if (existing) {
        // Navigate to existing conversation
        navigate(`/messages?conversation=${existing.id}`);
        return;
      }

      // Create new trade conversation
      const { data: conversation, error } = await supabase
        .from('trade_conversations')
        .insert({
          requester_id: user.id,
          owner_id: ownerId,
          requester_item_id: myItemId,
          requester_item_ids: [myItemId],
          owner_item_id: theirItemId,
          status: 'pending'
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error creating trade:', error);
        toast({
          title: "Error",
          description: "Failed to start trade chat",
          variant: "destructive"
        });
        return;
      }

      // Send initial trade message
      const myItemName = item.matchedItem.name;
      const theirItemName = item.item.name;
      const message = `Hi! I'd like to trade my ${myItemName} for your ${theirItemName}. Let me know if you're interested!`;

      await supabase
        .from('trade_messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: user.id,
          message: message
        });

      // Navigate to messages with the new conversation
      navigate('/messages', { 
        state: { 
          tradeConversationId: conversation.id, 
          newTrade: true 
        } 
      });
    } catch (error) {
      console.error('Error requesting trade:', error);
      toast({
        title: "Error",
        description: "Failed to start trade chat",
        variant: "destructive"
      });
    }
  };

  return (
    <MainLayout>
      <div className="bg-background min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8"></div>

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading liked items...</p>
            </div>
          ) : likedItems.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16">
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No liked items yet</h3>
              <p className="text-muted-foreground">
                Items you like will appear here. Start exploring to find items you love!
              </p>
            </div>
          ) : (
            /* Items Grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {likedItems.map((likedItem, index) => (
                <div
                  key={likedItem.id}
                  className="relative bg-card rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer group flex flex-col h-72 sm:h-80"
                  onClick={() => handleItemClick(likedItem, index)}
                >
                  {/* Matched item thumbnail */}
                  {likedItem.matchedItem && (
                    <div className="absolute top-3 left-3 z-10">
                      <div className="w-12 h-12 rounded-full border-2 border-background shadow-lg overflow-hidden bg-background">
                        <img
                          src={likedItem.matchedItem.image_url}
                          alt="Your matched item"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Image */}
                  <div className="flex-1 relative overflow-hidden">
                    <img
                      src={likedItem.item.image_url || likedItem.item.image_urls?.[0] || '/placeholder.svg'}
                      alt={likedItem.item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-3 h-20 flex flex-col justify-center">
                    <h3 className="font-semibold text-sm truncate">{likedItem.item.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {likedItem.item.price_range_min && likedItem.item.price_range_max
                          ? `$${likedItem.item.price_range_min} - $${likedItem.item.price_range_max}`
                          : likedItem.item.price_range_min
                            ? `$${likedItem.item.price_range_min}+`
                            : ''}
                      </span>
                      {likedItem.item.condition && (
                        <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
                          {likedItem.item.condition}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {/* Trade button - hover only */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => likedItem.matchedItem 
                          ? handleMatchedTradeClick(e, likedItem) 
                          : handleTradeClick(e, likedItem)
                        }
                        className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50"
                        aria-label={likedItem.matchedItem ? "Complete trade" : "Suggest trade"}
                      >
                        {likedItem.matchedItem ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Repeat className="w-4 h-4 text-green-500" />
                        )}
                      </button>
                    </div>
                    {/* Heart button - always visible since all items are liked */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnlike(likedItem.item_id);
                      }}
                      className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50"
                      aria-label="Unlike"
                    >
                      <Heart className="w-4 h-4 text-red-500" fill="red" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Item Details Modal */}
      <ExploreItemModal
        open={isModalOpen}
        item={selectedItem}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
        }}
        currentIndex={currentIndex}
        totalItems={likedItems.length}
        onNavigatePrev={handleNavigatePrev}
        onNavigateNext={handleNavigateNext}
        liked={true}
        onLike={() => {
          if (selectedItem) {
            handleUnlike(selectedItem.id);
            setIsModalOpen(false);
          }
        }}
      />

      {/* Trade Item Selection Modal */}
      <TradeItemSelectionModal
        isOpen={isTradeModalOpen}
        onClose={() => {
          setIsTradeModalOpen(false);
          setTradeTargetItem(null);
          setPreSelectedItemId(undefined);
        }}
        targetItem={tradeTargetItem}
        targetItemOwnerId={tradeTargetItem?.user_id}
        preSelectedItemId={preSelectedItemId}
      />
    </MainLayout>
  );
};

export default Likes;
