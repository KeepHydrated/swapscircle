import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, Repeat, Heart, Check } from 'lucide-react';
import ExploreItemModal from '@/components/items/ExploreItemModal';
import TradeItemSelectionModal from '@/components/trade/TradeItemSelectionModal';
import { Item } from '@/types/item';
import { useItemsInActiveTrades } from '@/hooks/useItemsInActiveTrades';

interface FriendItem {
  id: string;
  name: string;
  image_url: string | null;
  image_urls: string[] | null;
  category: string | null;
  condition: string | null;
  description: string | null;
  price_range_min: number | null;
  price_range_max: number | null;
  created_at: string;
  user_id: string;
  profile: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  };
}

const FriendsFeedSection: React.FC = () => {
  const [friendItems, setFriendItems] = useState<FriendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);
  const [selectedMatchedItemImage, setSelectedMatchedItemImage] = useState<string>('');
  const [selectedMatchedItemId, setSelectedMatchedItemId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeTargetItem, setTradeTargetItem] = useState<Item | null>(null);
  const { itemsInActiveTrades } = useItemsInActiveTrades();

  useEffect(() => {
    const fetchFriendItems = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) {
          setLoading(false);
          return;
        }

        const currentUserId = session.session.user.id;

        // Get accepted friend requests where user is either requester or recipient
        const { data: friendRequests, error: friendError } = await supabase
          .from('friend_requests')
          .select('requester_id, recipient_id')
          .eq('status', 'accepted')
          .or(`requester_id.eq.${currentUserId},recipient_id.eq.${currentUserId}`);

        if (friendError) {
          console.error('Error fetching friends:', friendError);
          setLoading(false);
          return;
        }

        // Extract friend IDs
        const friendIds = friendRequests?.map(fr => 
          fr.requester_id === currentUserId ? fr.recipient_id : fr.requester_id
        ).filter(Boolean) as string[];

        if (friendIds.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch recent items from friends
        const { data: items, error: itemsError } = await supabase
          .from('items')
          .select('id, name, image_url, image_urls, category, condition, description, price_range_min, price_range_max, created_at, user_id')
          .in('user_id', friendIds)
          .eq('is_available', true)
          .eq('is_hidden', false)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(10);

        if (itemsError) {
          console.error('Error fetching friend items:', itemsError);
          setLoading(false);
          return;
        }

        // Fetch profiles for item owners
        const userIds = [...new Set(items?.map(i => i.user_id) || [])];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', userIds);

        // Combine items with profiles and filter out items in active trades
        const itemsWithProfiles = items
          ?.filter(item => !itemsInActiveTrades.has(item.id))
          .map(item => ({
            ...item,
            profile: profiles?.find(p => p.id === item.user_id) || {
              id: item.user_id,
              username: 'Friend',
              avatar_url: null
            }
          })) || [];

        setFriendItems(itemsWithProfiles);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriendItems();
  }, [itemsInActiveTrades]);

  const handleItemClick = (item: FriendItem, index: number) => {
    const mappedItem: Item = {
      id: item.id,
      name: item.name,
      image: item.image_url || (item.image_urls?.[0]) || '/placeholder.svg',
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
    const matchedItem = (item as any).matchedItem;
    if (matchedItem) {
      setSelectedMatchedItemImage(matchedItem.image_url);
      setSelectedMatchedItemId(matchedItem.id);
    } else {
      setSelectedMatchedItemImage('');
      setSelectedMatchedItemId('');
    }
    
    setIsModalOpen(true);
  };

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleTradeClick = (item: FriendItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const mappedItem: Item = {
      id: item.id,
      name: item.name,
      image: item.image_url || (item.image_urls?.[0]) || '/placeholder.svg',
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
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">
          Recent From Friends
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse bg-muted rounded-xl aspect-square" />
          ))}
        </div>
      </section>
    );
  }

  // If no friend items, don't show the section
  if (friendItems.length === 0) {
    return null;
  }

  const displayItems = friendItems;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">
        Recent From Friends
      </h2>
      
      <div className="overflow-x-auto overflow-y-hidden pb-2 -mx-4 px-4">
        <div className="flex gap-3 min-w-max">
          {displayItems.map((item, index) => (
            <div
              key={item.id}
              className="flex-shrink-0 w-48 sm:w-56 md:w-64 h-72 sm:h-80 relative bg-card rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer group flex flex-col"
              onClick={() => handleItemClick(item, index)}
          >
            {/* Matched item thumbnail */}
            {(item as any).matchedItem && (
              <div className="absolute top-3 left-3 z-10">
                <div className="w-12 h-12 rounded-full border-2 border-background shadow-lg overflow-hidden bg-background">
                  <img
                    src={(item as any).matchedItem.image_url}
                    alt={(item as any).matchedItem.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Image */}
            <div className="flex-1 relative overflow-hidden">
              <img
                src={item.image_url || (item.image_urls?.[0]) || '/placeholder.svg'}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Content */}
            <div className="p-3 h-20">
              <h3 className="font-semibold text-sm truncate">{item.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {item.price_range_min && item.price_range_max 
                    ? `$${item.price_range_min} - $${item.price_range_max}`
                    : item.price_range_min 
                      ? `$${item.price_range_min}+`
                      : 'Price not set'}
                </span>
                {item.condition && (
                  <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
                    {item.condition}
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons - different for matched vs non-matched items */}
            <div className="absolute top-3 right-3 flex gap-2">
              {/* Trade buttons - hover only */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                {(item as any).matchedItem ? (
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
                  likedItems.has(item.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
                aria-label={likedItems.has(item.id) ? "Unlike" : "Like"}
              >
                <Heart 
                  className="w-4 h-4 text-red-500" 
                  fill={likedItems.has(item.id) ? "red" : "none"}
                />
              </button>
            </div>
          </div>
        ))}
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
              handleItemClick(displayItems[selectedItemIndex - 1], selectedItemIndex - 1);
            }
          }}
          onNavigateNext={() => {
            if (selectedItemIndex < displayItems.length - 1) {
              handleItemClick(displayItems[selectedItemIndex + 1], selectedItemIndex + 1);
            }
          }}
          currentIndex={selectedItemIndex}
          totalItems={displayItems.length}
          liked={likedItems.has(selectedItem.id)}
          onLike={() => {
            setLikedItems(prev => {
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

      {/* Trade Item Selection Modal */}
      <TradeItemSelectionModal
        isOpen={tradeModalOpen}
        onClose={() => {
          setTradeModalOpen(false);
          setTradeTargetItem(null);
        }}
        targetItem={tradeTargetItem}
        targetItemOwnerId={tradeTargetItem?.user_id}
      />
    </section>
  );
};

export default FriendsFeedSection;
