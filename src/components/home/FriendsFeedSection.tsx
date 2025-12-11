import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, RefreshCw, Heart, Check } from 'lucide-react';
import ExploreItemModal from '@/components/items/ExploreItemModal';
import TradeItemSelectionModal from '@/components/trade/TradeItemSelectionModal';
import { Item } from '@/types/item';

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

        // Combine items with profiles
        const itemsWithProfiles = items?.map(item => ({
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
  }, []);

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
        <h2 className="text-xl font-bold text-foreground uppercase">
          Recent from Friends
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse bg-muted rounded-xl aspect-square" />
          ))}
        </div>
      </section>
    );
  }

  // Demo items when no real friend items exist
  const demoFriendItems: (FriendItem & { matchedItem?: { id: string; name: string; image_url: string } })[] = [
    {
      id: 'demo-friend-1',
      name: 'Vintage Polaroid Camera',
      image_url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400',
      image_urls: null,
      category: 'Electronics',
      condition: 'Good',
      description: 'Classic instant camera in working condition',
      price_range_min: 50,
      price_range_max: 100,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      user_id: 'demo-user-1',
      profile: { id: 'demo-user-1', username: 'Sarah_M', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
      // This is a match!
      matchedItem: {
        id: 'my-item-1',
        name: 'Canon DSLR Camera',
        image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100'
      }
    },
    {
      id: 'demo-friend-2',
      name: 'Leather Messenger Bag',
      image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
      image_urls: null,
      category: 'Accessories',
      condition: 'Like New',
      description: 'Premium leather bag, barely used',
      price_range_min: 80,
      price_range_max: 150,
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      user_id: 'demo-user-2',
      profile: { id: 'demo-user-2', username: 'Mike_T', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' }
    },
    {
      id: 'demo-friend-3',
      name: 'Mechanical Keyboard',
      image_url: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=400',
      image_urls: null,
      category: 'Electronics',
      condition: 'Good',
      description: 'Cherry MX Blue switches, RGB lighting',
      price_range_min: 60,
      price_range_max: 120,
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      user_id: 'demo-user-3',
      profile: { id: 'demo-user-3', username: 'Alex_K', avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' }
    },
    {
      id: 'demo-friend-4',
      name: 'Vintage Record Player',
      image_url: 'https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?w=400',
      image_urls: null,
      category: 'Electronics',
      condition: 'Fair',
      description: 'Retro turntable with built-in speakers',
      price_range_min: 75,
      price_range_max: 125,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      user_id: 'demo-user-1',
      profile: { id: 'demo-user-1', username: 'Sarah_M', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' }
    }
  ];

  const displayItems = friendItems.length > 0 ? friendItems : demoFriendItems;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-foreground uppercase">
        Recent from Friends
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
            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {(item as any).matchedItem ? (
                // Match card buttons - checkmark for direct trade
                <>
                  <button
                    onClick={(e) => handleTradeClick(item, e)}
                    className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50"
                    aria-label="Accept trade"
                  >
                    <Check className="w-4 h-4 text-green-500" />
                  </button>
                  <button
                    onClick={(e) => handleLike(item.id, e)}
                    className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50"
                    aria-label={likedItems.has(item.id) ? "Unlike" : "Like"}
                  >
                    <Heart 
                      className="w-4 h-4 text-red-500" 
                      fill={likedItems.has(item.id) ? "red" : "none"}
                    />
                  </button>
                </>
              ) : (
                // Regular card buttons - swap for trade suggestion
                <>
                  <button
                    onClick={(e) => handleTradeClick(item, e)}
                    className="w-8 h-8 bg-green-500 hover:bg-green-600 rounded-full shadow-md flex items-center justify-center"
                    aria-label="Suggest trade"
                  >
                    <RefreshCw className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={(e) => handleLike(item.id, e)}
                    className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50"
                    aria-label={likedItems.has(item.id) ? "Unlike" : "Like"}
                  >
                    <Heart 
                      className="w-4 h-4 text-red-500" 
                      fill={likedItems.has(item.id) ? "red" : "none"}
                    />
                  </button>
                </>
              )}
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
