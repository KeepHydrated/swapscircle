import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TrendingItemCard } from './TrendingItemCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import ExploreItemModal from '@/components/items/ExploreItemModal';
import TradeItemSelectionModal from '@/components/trade/TradeItemSelectionModal';
import { toast } from 'sonner';

interface TrendingItem {
  id: string;
  name: string;
  description: string;
  image_url: string;
  category: string;
  condition: string;
  price_range_min: number | null;
  price_range_max: number | null;
  user_id: string;
}

export const TrendingItems: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedItemIds, setLikedItemIds] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<TrendingItem | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);
  const [tradeModalItem, setTradeModalItem] = useState<TrendingItem | null>(null);

  useEffect(() => {
    fetchTrendingItems();
    if (user) {
      fetchLikedItems();
    }
  }, [user]);

  const fetchTrendingItems = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('items')
        .select('id, name, description, image_url, category, condition, price_range_min, price_range_max, user_id')
        .eq('status', 'published')
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching trending items:', error);
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

  const handleLike = async (item: TrendingItem) => {
    if (!user) {
      toast.error('Please log in to like items');
      return;
    }

    const isLiked = likedItemIds.has(item.id);
    
    // Optimistic update
    setLikedItemIds(prev => {
      const next = new Set(prev);
      if (isLiked) {
        next.delete(item.id);
      } else {
        next.add(item.id);
      }
      return next;
    });

    try {
      if (isLiked) {
        await supabase
          .from('liked_items')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', item.id);
      } else {
        await supabase
          .from('liked_items')
          .insert({ user_id: user.id, item_id: item.id });
      }
    } catch (error) {
      // Revert on error
      setLikedItemIds(prev => {
        const next = new Set(prev);
        if (isLiked) {
          next.add(item.id);
        } else {
          next.delete(item.id);
        }
        return next;
      });
      toast.error('Failed to update like');
    }
  };

  const handleTrade = (item: TrendingItem) => {
    if (!user) {
      toast.error('Please log in to suggest trades');
      return;
    }
    setTradeModalItem(item);
  };

  const handleItemClick = (item: TrendingItem, index: number) => {
    setSelectedItem(item);
    setSelectedItemIndex(index);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? Math.max(0, selectedItemIndex - 1)
      : Math.min(items.length - 1, selectedItemIndex + 1);
    setSelectedItemIndex(newIndex);
    setSelectedItem(items[newIndex]);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="rounded-xl overflow-hidden">
            <Skeleton className="aspect-square w-full" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center text-center text-muted-foreground py-12">
        <div className="text-4xl mb-3">🔥</div>
        <p className="text-base font-medium mb-1">No trending items yet</p>
        <p className="text-sm">Check back soon for popular items</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item, index) => (
          <TrendingItemCard
            key={item.id}
            item={item}
            isLiked={likedItemIds.has(item.id)}
            onClick={() => handleItemClick(item, index)}
            onLike={() => handleLike(item)}
            onTrade={() => handleTrade(item)}
          />
        ))}
      </div>

      {selectedItem && (
        <ExploreItemModal
          open={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          item={{
            id: selectedItem.id,
            name: selectedItem.name,
            description: selectedItem.description,
            image: selectedItem.image_url,
            category: selectedItem.category,
            condition: selectedItem.condition,
            user_id: selectedItem.user_id,
          }}
          onLike={() => handleLike(selectedItem)}
          liked={likedItemIds.has(selectedItem.id)}
          currentIndex={selectedItemIndex}
          totalItems={items.length}
          onNavigatePrev={() => handleNavigate('prev')}
          onNavigateNext={() => handleNavigate('next')}
        />
      )}

      {tradeModalItem && (
        <TradeItemSelectionModal
          isOpen={!!tradeModalItem}
          onClose={() => setTradeModalItem(null)}
          targetItem={{
            id: tradeModalItem.id,
            name: tradeModalItem.name,
            image: tradeModalItem.image_url,
            user_id: tradeModalItem.user_id,
          }}
          targetItemOwnerId={tradeModalItem.user_id}
        />
      )}
    </>
  );
};
