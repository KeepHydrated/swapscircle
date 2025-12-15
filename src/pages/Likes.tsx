import React, { useState, useEffect } from 'react';
import { Heart, Repeat } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { supabase } from '@/integrations/supabase/client';
import { Item } from '@/types/item';
import ExploreItemModal from '@/components/items/ExploreItemModal';
import TradeItemSelectionModal from '@/components/trade/TradeItemSelectionModal';
import { toast } from '@/hooks/use-toast';
interface LikedItem {
  id: string;
  item_id: string;
  created_at: string;
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
const Likes = () => {
  const [likedItems, setLikedItems] = useState<LikedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeTargetItem, setTradeTargetItem] = useState<Item | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    fetchLikedItems();
  }, []);
  const fetchLikedItems = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;

      // First, get all liked item IDs
      const {
        data: likedData,
        error: likedError
      } = await supabase.from('liked_items').select('id, item_id, created_at').eq('user_id', user.id).order('created_at', {
        ascending: false
      });
      if (likedError) throw likedError;
      if (!likedData || likedData.length === 0) {
        setLikedItems([]);
        setLoading(false);
        return;
      }

      // Then fetch the actual items
      const itemIds = likedData.map(l => l.item_id);
      const {
        data: itemsData,
        error: itemsError
      } = await supabase.from('items').select('id, name, image_url, image_urls, description, category, condition, price_range_min, price_range_max, user_id, status').in('id', itemIds);
      if (itemsError) throw itemsError;

      // Merge the data
      const itemsMap = new Map(itemsData?.map(item => [item.id, item]) || []);
      const mergedItems: LikedItem[] = likedData.map(liked => ({
        id: liked.id,
        item_id: liked.item_id,
        created_at: liked.created_at,
        item: itemsMap.get(liked.item_id)
      })).filter(item => item.item && item.item.status !== 'removed') as LikedItem[];
      setLikedItems(mergedItems);
    } catch (error) {
      console.error('Error fetching liked items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load liked items',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleUnlike = async (itemId: string) => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;
      const {
        error
      } = await supabase.from('liked_items').delete().eq('user_id', user.id).eq('item_id', itemId);
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
  const handleItemClick = (item: LikedItem, index: number) => {
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
  const handleTradeClick = (e: React.MouseEvent, item: LikedItem) => {
    e.stopPropagation();
    setTradeTargetItem({
      id: item.item.id,
      name: item.item.name,
      image: item.item.image_url || item.item.image_urls?.[0] || '',
      user_id: item.item.user_id
    } as Item);
    setIsTradeModalOpen(true);
  };
  return <MainLayout>
      <div className="bg-background min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            
          </div>

          {/* Loading State */}
          {loading ? <div className="text-center py-16">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading liked items...</p>
            </div> : likedItems.length === 0 ? (/* Empty State */
        <div className="text-center py-16">
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No liked items yet</h3>
              <p className="text-muted-foreground">
                Items you like will appear here. Start exploring to find items you love!
              </p>
            </div>) : (/* Items Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {likedItems.map((likedItem, index) => (
                <div
                  key={likedItem.id}
                  className="relative bg-card rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer group flex flex-col h-72 sm:h-80"
                  onClick={() => handleItemClick(likedItem, index)}
                >
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
                        onClick={e => handleTradeClick(e, likedItem)}
                        className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50"
                        aria-label="Suggest trade"
                      >
                        <Repeat className="w-4 h-4 text-green-500" />
                      </button>
                    </div>
                    {/* Heart button - always visible since all items are liked */}
                    <button
                      onClick={e => {
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
            </div>)}
        </div>
      </div>

      {/* Item Details Modal */}
      <ExploreItemModal open={isModalOpen} item={selectedItem} onClose={() => {
      setIsModalOpen(false);
      setSelectedItem(null);
    }} currentIndex={currentIndex} totalItems={likedItems.length} onNavigatePrev={handleNavigatePrev} onNavigateNext={handleNavigateNext} liked={true} onLike={() => {
      if (selectedItem) {
        handleUnlike(selectedItem.id);
        setIsModalOpen(false);
      }
    }} />

      {/* Trade Item Selection Modal */}
      <TradeItemSelectionModal isOpen={isTradeModalOpen} onClose={() => {
      setIsTradeModalOpen(false);
      setTradeTargetItem(null);
    }} targetItem={tradeTargetItem} targetItemOwnerId={tradeTargetItem?.user_id} />
    </MainLayout>;
};
export default Likes;