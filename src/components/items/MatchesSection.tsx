import React, { useState, useEffect } from 'react';
import { Heart, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ExploreItemModal from '@/components/items/ExploreItemModal';
import { Item } from '@/types/item';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface MutualMatch {
  id: string;
  theirItemId: string;
  theirItemName: string;
  theirItemImage: string;
  theirItemCategory: string;
  theirItemCondition: string;
  theirItemDescription: string;
  theirItemPriceMin: number;
  theirItemPriceMax: number;
  theirUserId: string;
  myItemId: string;
  myItemName: string;
  myItemImage: string;
}

const MatchesSection = () => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [likedItemIds, setLikedItemIds] = useState<Set<string>>(new Set());
  const [isCreatingTrade, setIsCreatingTrade] = useState<string | null>(null);
  const [matches, setMatches] = useState<MutualMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch mutual matches from database
  useEffect(() => {
    const fetchMutualMatches = async () => {
      if (!user) {
        setMatches([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch mutual matches where the user is involved
        const { data: mutualMatchesData, error } = await supabase
          .from('mutual_matches')
          .select('*')
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

        if (error) {
          console.error('Error fetching mutual matches:', error);
          setMatches([]);
          setLoading(false);
          return;
        }

        if (!mutualMatchesData || mutualMatchesData.length === 0) {
          setMatches([]);
          setLoading(false);
          return;
        }

        // Collect all item IDs we need to fetch
        const itemIds = new Set<string>();
        mutualMatchesData.forEach(match => {
          itemIds.add(match.user1_item_id);
          itemIds.add(match.user2_item_id);
        });

        // Fetch all items in one query
        const { data: items, error: itemsError } = await supabase
          .from('items')
          .select('id, name, image_url, category, condition, description, price_range_min, price_range_max, user_id')
          .in('id', Array.from(itemIds));

        if (itemsError) {
          console.error('Error fetching items:', itemsError);
          setMatches([]);
          setLoading(false);
          return;
        }

        const itemsMap = new Map(items?.map(item => [item.id, item]) || []);

        // Build matches array
        const processedMatches: MutualMatch[] = mutualMatchesData.map(match => {
          const isUser1 = match.user1_id === user.id;
          const myItemId = isUser1 ? match.user1_item_id : match.user2_item_id;
          const theirItemId = isUser1 ? match.user2_item_id : match.user1_item_id;
          const theirUserId = isUser1 ? match.user2_id : match.user1_id;

          const myItem = itemsMap.get(myItemId);
          const theirItem = itemsMap.get(theirItemId);

          return {
            id: match.id,
            theirItemId: theirItemId,
            theirItemName: theirItem?.name || 'Unknown Item',
            theirItemImage: theirItem?.image_url || '',
            theirItemCategory: theirItem?.category || '',
            theirItemCondition: theirItem?.condition || '',
            theirItemDescription: theirItem?.description || '',
            theirItemPriceMin: theirItem?.price_range_min || 0,
            theirItemPriceMax: theirItem?.price_range_max || 0,
            theirUserId: theirUserId,
            myItemId: myItemId,
            myItemName: myItem?.name || 'Your Item',
            myItemImage: myItem?.image_url || '',
          };
        }).filter(match => match.theirItemImage); // Filter out matches with missing items

        setMatches(processedMatches);
      } catch (error) {
        console.error('Error processing matches:', error);
        setMatches([]);
      }
      setLoading(false);
    };

    fetchMutualMatches();
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

  const handleRequestTrade = async (match: MutualMatch, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      navigate('/auth');
      return;
    }

    setIsCreatingTrade(match.id);

    try {
      // Create trade conversation directly with the matched items
      const { data: conversation, error } = await supabase
        .from('trade_conversations')
        .insert({
          requester_id: user.id,
          owner_id: match.theirUserId,
          requester_item_id: match.myItemId,
          requester_item_ids: [match.myItemId],
          owner_item_id: match.theirItemId,
          status: 'pending'
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error creating trade:', error);
        toast.error('Failed to request trade');
        return;
      }

      // Send initial trade message
      const message = `Hi! I'm interested in trading my item (${match.myItemName}) for your ${match.theirItemName}. Let me know if you're interested!`;

      await supabase
        .from('trade_messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: user.id,
          message: message
        });

      toast.success('Trade request sent!');
      navigate('/trade-requests');
    } catch (error) {
      console.error('Error requesting trade:', error);
      toast.error('Failed to request trade');
    } finally {
      setIsCreatingTrade(null);
    }
  };

  const handleCardClick = (match: MutualMatch) => {
    setSelectedItem({
      id: match.theirItemId,
      name: match.theirItemName,
      image: match.theirItemImage,
      category: match.theirItemCategory,
      condition: match.theirItemCondition,
      description: match.theirItemDescription,
      priceRangeMin: match.theirItemPriceMin,
      priceRangeMax: match.theirItemPriceMax,
      user_id: match.theirUserId,
    });
    setIsModalOpen(true);
  };

  // Don't show section if no matches and not loading
  if (!loading && matches.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Your Matches</h2>
        <Link to="/" className="text-sm text-primary hover:underline">View all</Link>
      </div>
      
      {loading ? (
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-64 sm:w-72 md:w-80">
              <Skeleton className="aspect-[4/3] rounded-lg" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto overflow-y-hidden pb-2">
          <div className="flex gap-3 min-w-max">
            {matches.map((match) => (
              <div key={match.id} className="flex-shrink-0 w-64 sm:w-72 md:w-80">
                <div 
                  className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => handleCardClick(match)}
                >
                  <div className="relative aspect-[4/3]">
                    <img src={match.theirItemImage} alt={match.theirItemName} className="w-full h-full object-cover" />
                    
                    {/* Action buttons - matches search page style */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      {/* Request Trade button - directly initiates trade with matched items */}
                      <button 
                        className={`w-10 h-10 bg-green-500 hover:bg-green-600 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 ${isCreatingTrade === match.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={(e) => handleRequestTrade(match, e)}
                        disabled={isCreatingTrade === match.id}
                        title="Request Trade"
                      >
                        <RefreshCw className={`w-5 h-5 text-white ${isCreatingTrade === match.id ? 'animate-spin' : ''}`} />
                      </button>
                      {/* Like button */}
                      <button 
                        className="w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
                        onClick={(e) => handleLikeItem(match.theirItemId, e)}
                        title={likedItemIds.has(match.theirItemId) ? "Unlike item" : "Like item"}
                      >
                        <Heart 
                          className={`w-5 h-5 transition-colors ${
                            likedItemIds.has(match.theirItemId) 
                              ? 'text-red-500 fill-red-500' 
                              : 'text-muted-foreground hover:text-red-500'
                          }`} 
                        />
                      </button>
                    </div>

                    {/* My Item Thumbnail in Bottom Right */}
                    <div className="absolute bottom-2 right-2">
                      <div className="w-12 h-12 rounded-full border-2 border-background shadow-lg overflow-hidden bg-background">
                        <img src={match.myItemImage} alt="Your item" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-semibold text-foreground mb-1 truncate">{match.theirItemName}</h3>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        ${match.theirItemPriceMin} - ${match.theirItemPriceMax}
                      </p>
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                        {match.theirItemCondition}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ExploreItemModal
        open={isModalOpen}
        item={selectedItem}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
        }}
      />

    </div>
  );
};

export default MatchesSection;
