
import React, { useState, useEffect } from 'react';
import { Check, RefreshCw, Heart } from 'lucide-react';
import ReviewsTab from '@/components/profile/ReviewsTab';
import { MatchItem, Item } from '@/types/item';
import TradeItemSelectionModal from '@/components/trade/TradeItemSelectionModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface OtherProfileTabContentProps {
  activeTab: string;
  items: MatchItem[];
  reviews: any[];
  setPopupItem: (item: MatchItem | null) => void;
  onLikeItem: (id: string) => void;
  onRejectItem: (id: string) => void;
  isFriend: boolean;
  profileUserId?: string;
}

const OtherProfileTabContent: React.FC<OtherProfileTabContentProps> = ({ 
  activeTab, 
  items,
  reviews,
  setPopupItem,
  onLikeItem,
  onRejectItem,
  isFriend,
  profileUserId
}) => {
  const { user } = useAuth();
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedTradeItem, setSelectedTradeItem] = useState<Item | null>(null);
  const [likedItemIds, setLikedItemIds] = useState<Set<string>>(new Set());
  const [matchedItems, setMatchedItems] = useState<Map<string, any>>(new Map()); // Maps item id to matched user item

  // Fetch liked items and check for matches
  useEffect(() => {
    const fetchLikesAndMatches = async () => {
      if (!user || !profileUserId) return;

      // Fetch user's liked items
      const { data: likedData } = await supabase
        .from('liked_items')
        .select('item_id')
        .eq('user_id', user.id);

      if (likedData) {
        setLikedItemIds(new Set(likedData.map(l => l.item_id)));
      }

      // Fetch user's items
      const { data: userItems } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'published')
        .eq('is_available', true);

      if (!userItems || userItems.length === 0) return;

      // Check for mutual matches (profile owner liked one of user's items)
      const { data: profileOwnerLikes } = await supabase
        .from('liked_items')
        .select('item_id, my_item_id')
        .eq('user_id', profileUserId);

      if (profileOwnerLikes) {
        const userItemIds = new Set(userItems.map(i => i.id));
        const matched = new Map<string, any>();

        // For each profile item, check if user liked it AND profile owner liked one of user's items
        for (const item of items) {
          const userLikedThis = likedData?.some(l => l.item_id === item.id);
          if (userLikedThis) {
            // Check if profile owner liked any of user's items
            const ownerLike = profileOwnerLikes.find(l => userItemIds.has(l.item_id));
            if (ownerLike) {
              // Find the user's item that was liked
              const matchedUserItem = userItems.find(i => i.id === ownerLike.item_id);
              if (matchedUserItem) {
                matched.set(item.id, matchedUserItem);
              }
            }
          }
        }
        setMatchedItems(matched);
      }
    };

    fetchLikesAndMatches();
  }, [user, profileUserId, items]);

  // Handle item click to show popup
  const handleItemClick = (id: string) => {
    const item = items.find(item => item.id === id);
    if (item) {
      setPopupItem(item);
    }
  };

  // Handle trade button click
  const handleTradeClick = (e: React.MouseEvent, item: MatchItem) => {
    e.stopPropagation();
    setSelectedTradeItem({
      id: item.id,
      name: item.name,
      image: item.image,
      user_id: profileUserId || ''
    } as Item);
    setTradeModalOpen(true);
  };

  // Handle like button click
  const handleLikeClick = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    onLikeItem(itemId);
    // Toggle local state for immediate feedback
    setLikedItemIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Only render the content for the active tab
  return (
    <>
      {/* Available Items Tab Content */}
      {activeTab === 'available' && (
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => {
              const matchedUserItem = matchedItems.get(item.id);
              const isMatch = !!matchedUserItem;
              const isLiked = likedItemIds.has(item.id) || item.liked;

              return (
                <div
                  key={item.id}
                  className="relative bg-card rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => handleItemClick(item.id)}
                >
                  {/* Matched item thumbnail - only for matches */}
                  {isMatch && matchedUserItem && (
                    <div className="absolute top-3 left-3 z-10">
                      <div className="w-12 h-12 rounded-full border-2 border-background shadow-lg overflow-hidden bg-background">
                        <img
                          src={matchedUserItem.image_url || matchedUserItem.image_urls?.[0]}
                          alt={matchedUserItem.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Image */}
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={item.image || item.image_url || (item.image_urls as string[])?.[0] || '/placeholder.svg'}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {item.priceRangeMin && item.priceRangeMax 
                          ? `$${item.priceRangeMin} - $${item.priceRangeMax}`
                          : item.priceRangeMin 
                            ? `$${item.priceRangeMin}+`
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
                      {isMatch ? (
                        <button
                          onClick={(e) => handleTradeClick(e, item)}
                          className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50"
                          aria-label="Accept trade"
                        >
                          <Check className="w-4 h-4 text-green-500" />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleTradeClick(e, item)}
                          className="w-8 h-8 bg-green-500 hover:bg-green-600 rounded-full shadow-md flex items-center justify-center"
                          aria-label="Suggest trade"
                        >
                          <RefreshCw className="w-4 h-4 text-white" />
                        </button>
                      )}
                    </div>
                    {/* Heart button - always visible when liked, hover otherwise */}
                    <button
                      onClick={(e) => handleLikeClick(e, item.id)}
                      className={`w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-opacity ${
                        isLiked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                      aria-label={isLiked ? "Unlike" : "Like"}
                    >
                      <Heart 
                        className="w-4 h-4 text-red-500" 
                        fill={isLiked ? "red" : "none"}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      
      {/* Reviews Tab Content */}
      {activeTab === 'reviews' && (
        <div className="p-6">
          <ReviewsTab reviews={reviews} />
        </div>
      )}

      {/* Trade Item Selection Modal */}
      <TradeItemSelectionModal
        isOpen={tradeModalOpen}
        onClose={() => {
          setTradeModalOpen(false);
          setSelectedTradeItem(null);
        }}
        targetItem={selectedTradeItem}
        targetItemOwnerId={profileUserId}
      />
    </>
  );
};

export default OtherProfileTabContent;
