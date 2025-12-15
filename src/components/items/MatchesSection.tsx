import React, { useState, useEffect } from 'react';
import { Heart, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ExploreItemModal from '@/components/items/ExploreItemModal';
import { Item } from '@/types/item';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useItemsInActiveTrades } from '@/hooks/useItemsInActiveTrades';

interface MatchItem {
  id: string;
  name: string;
  image: string;
  image_url?: string;
  image_urls?: string[];
  user_id: string;
  priceRangeMin?: number;
  priceRangeMax?: number;
  price_range_min?: number;
  price_range_max?: number;
  condition?: string;
  category?: string;
  description?: string;
  myItemId?: string;
  myItemName?: string;
  myItemImage?: string;
}

const MatchesSection = () => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);
  const [selectedMatchedItemImage, setSelectedMatchedItemImage] = useState<string>('');
  const [selectedMatchedItemId, setSelectedMatchedItemId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [likedItemIds, setLikedItemIds] = useState<Set<string>>(new Set());
  const [isCreatingTrade, setIsCreatingTrade] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userItems, setUserItems] = useState<any[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { itemsInActiveTrades } = useItemsInActiveTrades();

  // Fetch real items from the database
  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      
      try {
        // First, get the current user's items
        let myItems: any[] = [];
        if (user) {
          const { data: userItemsData } = await supabase
            .from('items')
            .select('id, name, image_url, image_urls')
            .eq('user_id', user.id)
            .eq('status', 'published')
            .eq('is_available', true)
            .limit(5);
          
          myItems = userItemsData || [];
          setUserItems(myItems);
        }

        // Fetch other users' items (potential matches)
        const query = supabase
          .from('items')
          .select('*')
          .eq('status', 'published')
          .eq('is_available', true)
          .order('created_at', { ascending: false })
          .limit(10);
        
        // Exclude current user's items if logged in
        if (user) {
          query.neq('user_id', user.id);
        }

        const { data: itemsData, error } = await query;

        if (error) {
          console.error('Error fetching matches:', error);
          setLoading(false);
          return;
        }

        // Transform items to match format and pair with user's items
        // Filter out items that are in active trades
        const transformedMatches: MatchItem[] = (itemsData || [])
          .filter(item => !itemsInActiveTrades.has(item.id))
          .map((item, index) => {
          const myItem = myItems[index % Math.max(myItems.length, 1)] || null;
          const imageUrl = item.image_url || (item.image_urls && item.image_urls[0]) || '';
          const myItemImageUrl = myItem ? (myItem.image_url || (myItem.image_urls && myItem.image_urls[0]) || '') : '';
          
          return {
            id: item.id,
            name: item.name,
            image: imageUrl,
            image_url: imageUrl,
            image_urls: item.image_urls || [],
            user_id: item.user_id,
            priceRangeMin: item.price_range_min,
            priceRangeMax: item.price_range_max,
            price_range_min: item.price_range_min,
            price_range_max: item.price_range_max,
            condition: item.condition,
            category: item.category,
            description: item.description,
            myItemId: myItem?.id,
            myItemName: myItem?.name,
            myItemImage: myItemImageUrl,
          };
        });

        setMatches(transformedMatches);
      } catch (err) {
        console.error('Error in fetchMatches:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [user]);

  // Fetch liked items on mount
  useEffect(() => {
    const fetchLikedItems = async () => {
      if (!user) {
        setLikedItemIds(new Set());
        return;
      }

      const { data, error } = await supabase
        .from('liked_items')
        .select('item_id')
        .eq('user_id', user.id);

      if (!error && data) {
        setLikedItemIds(new Set(data.map(l => l.item_id)));
      }
    };

    fetchLikedItems();
  }, [user]);

  // Restore modal state from sessionStorage (for back navigation from item page)
  useEffect(() => {
    if (matches.length === 0) return;
    
    const savedModalState = sessionStorage.getItem('returnToModal');
    if (savedModalState) {
      try {
        const { itemId, returnUrl } = JSON.parse(savedModalState);
        
        // Only restore if we're on the same page we left from
        if (returnUrl === '/' || returnUrl.startsWith('/test2')) {
          const matchIndex = matches.findIndex(m => m.id === itemId);
          if (matchIndex >= 0) {
            const match = matches[matchIndex];
            setSelectedItem({
              id: match.id,
              name: match.name,
              image: match.image,
              category: match.category,
              condition: match.condition,
              description: match.description,
              priceRangeMin: match.priceRangeMin,
              priceRangeMax: match.priceRangeMax,
              user_id: match.user_id
            });
            setSelectedItemIndex(matchIndex);
            setSelectedMatchedItemImage(match.myItemImage || '');
            setSelectedMatchedItemId(match.myItemId || '');
            setIsModalOpen(true);
            // Only clear after successfully restoring
            sessionStorage.removeItem('returnToModal');
          }
        }
      } catch (e) {
        console.error('Error restoring modal state:', e);
        sessionStorage.removeItem('returnToModal');
      }
    }
  }, [matches]);

  const handleLikeItem = async (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/auth');
      return;
    }

    const isLiked = likedItemIds.has(itemId);

    if (isLiked) {
      const { error } = await supabase
        .from('liked_items')
        .delete()
        .eq('user_id', user.id)
        .eq('item_id', itemId);

      if (!error) {
        setLikedItemIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }
    } else {
      const { error } = await supabase
        .from('liked_items')
        .insert({ user_id: user.id, item_id: itemId });

      if (!error) {
        setLikedItemIds(prev => new Set(prev).add(itemId));
      }
    }
  };

  const handleRequestTrade = async (item: MatchItem, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!item.myItemId) {
      toast.error('You need to post an item first to trade');
      navigate('/post-item');
      return;
    }

    setIsCreatingTrade(item.id);

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
        // Navigate to existing conversation
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

      // Navigate to messages with the new conversation using state for proper handling
      navigate('/messages', { 
        state: { 
          tradeConversationId: conversation.id, 
          newTrade: true 
        } 
      });
    } catch (error) {
      console.error('Error requesting trade:', error);
      toast.error('Failed to start trade chat');
    } finally {
      setIsCreatingTrade(null);
    }
  };

  const handleCardClick = (item: MatchItem, index: number) => {
    setSelectedItem({
      id: item.id,
      name: item.name,
      image: item.image,
      image_url: item.image_url,
      image_urls: item.image_urls,
      category: item.category,
      condition: item.condition,
      description: item.description,
      priceRangeMin: item.priceRangeMin,
      priceRangeMax: item.priceRangeMax,
      user_id: item.user_id,
    });
    setSelectedItemIndex(index);
    setSelectedMatchedItemImage(item.myItemImage || '');
    setSelectedMatchedItemId(item.myItemId || '');
    setIsModalOpen(true);
  };

  const handleNavigatePrev = () => {
    if (selectedItemIndex > 0) {
      const prevItem = matches[selectedItemIndex - 1];
      handleCardClick(prevItem, selectedItemIndex - 1);
    }
  };

  const handleNavigateNext = () => {
    if (selectedItemIndex < matches.length - 1) {
      const nextItem = matches[selectedItemIndex + 1];
      handleCardClick(nextItem, selectedItemIndex + 1);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="w-full">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Your Matches</h2>
          <Link to="/matches" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto overflow-y-hidden pb-2">
          <div className="flex gap-3 min-w-max">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex-shrink-0 w-48 sm:w-56 md:w-64 h-72 sm:h-80">
                <Skeleton className="w-full h-full rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // No matches
  if (matches.length === 0) {
    return (
      <div className="w-full">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Your Matches</h2>
          <Link to="/matches" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <p>No matches found yet. Post an item to start matching!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Your Matches</h2>
        <Link to="/matches" className="text-sm text-primary hover:underline">View all</Link>
      </div>
      
      <div className="overflow-x-auto overflow-y-hidden pb-2">
        <div className="flex gap-3 min-w-max">
          {matches.map((item, index) => (
            <div
              key={item.id}
              className="flex-shrink-0 w-48 sm:w-56 md:w-64 h-72 sm:h-80 relative bg-card rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer group flex flex-col"
              onClick={() => handleCardClick(item, index)}
            >
              {/* Matched item thumbnail */}
              {item.myItemImage && (
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
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Content */}
              <div className="p-3 h-20 flex flex-col justify-center">
                <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    ${item.priceRangeMin || item.price_range_min || 0} - ${item.priceRangeMax || item.price_range_max || 0}
                  </span>
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
                  <button
                    onClick={(e) => handleRequestTrade(item, e)}
                    disabled={isCreatingTrade === item.id}
                    className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50"
                    aria-label="Suggest trade"
                  >
                    <Check className={`w-4 h-4 text-green-500 ${isCreatingTrade === item.id ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                {/* Heart button - always visible when liked, hover otherwise */}
                <button
                  onClick={(e) => handleLikeItem(item.id, e)}
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

      <ExploreItemModal
        open={isModalOpen}
        item={selectedItem}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
        }}
        matchedItemImage={selectedMatchedItemImage}
        matchedItemId={selectedMatchedItemId}
        onNavigatePrev={handleNavigatePrev}
        onNavigateNext={handleNavigateNext}
        currentIndex={selectedItemIndex}
        totalItems={matches.length}
      />
    </div>
  );
};

export default MatchesSection;
