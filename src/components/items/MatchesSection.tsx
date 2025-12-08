import React, { useState, useEffect } from 'react';
import { Heart, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ExploreItemModal from '@/components/items/ExploreItemModal';
import TradeItemSelectionModal from '@/components/trade/TradeItemSelectionModal';
import { Item } from '@/types/item';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const MatchesSection = () => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeTargetItem, setTradeTargetItem] = useState<Item | null>(null);
  const [likedItemIds, setLikedItemIds] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const navigate = useNavigate();

  const matches = [
    { id: "1", name: "Mountain Bike - Trek", image: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91", user: "Alex M.", myItemImage: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7", priceRangeMin: 300, priceRangeMax: 400, condition: "Good", category: "Sports & Outdoors", description: "Reliable mountain bike perfect for trails. Recently serviced with new brakes and tires.", user_id: "demo-user-1" },
    { id: "2", name: "Digital Camera - Canon", image: "https://images.unsplash.com/photo-1526413232644-8a40f03cc03b", user: "Sarah K.", myItemImage: "https://images.unsplash.com/photo-1580894894513-541e068a3e2b", priceRangeMin: 450, priceRangeMax: 600, condition: "Excellent", category: "Electronics", description: "Professional DSLR camera with multiple lenses included. Perfect for photography enthusiasts.", user_id: "demo-user-2" },
    { id: "3", name: "Electric Guitar - Fender", image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d", user: "Mike T.", myItemImage: "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c", priceRangeMin: 500, priceRangeMax: 700, condition: "Good", category: "Entertainment", description: "Classic Fender electric guitar with rich tone. Includes hard case and amp.", user_id: "demo-user-3" },
    { id: "4", name: "Standing Desk - Adjustable", image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2", user: "Emma L.", myItemImage: "https://images.unsplash.com/photo-1487147264018-f937fba0c817", priceRangeMin: 200, priceRangeMax: 350, condition: "Like New", category: "Home & Garden", description: "Electric height-adjustable standing desk. Barely used, in excellent condition.", user_id: "demo-user-4" },
    { id: "5", name: "Coffee Machine - Breville", image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6", user: "James P.", myItemImage: "https://images.unsplash.com/photo-1585399000684-d2f72660f092", priceRangeMin: 150, priceRangeMax: 250, condition: "Good", category: "Home & Garden", description: "Premium espresso machine with milk frother. Makes cafe-quality coffee at home.", user_id: "demo-user-5" },
  ];

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

  const handleSwapClick = (item: typeof matches[0], e: React.MouseEvent) => {
    e.stopPropagation();
    setTradeTargetItem({
      id: item.id,
      name: item.name,
      image: item.image,
      priceRangeMin: item.priceRangeMin,
      priceRangeMax: item.priceRangeMax,
      condition: item.condition,
      user_id: item.user_id,
    });
    setTradeModalOpen(true);
  };

  const handleCardClick = (item: typeof matches[0]) => {
    setSelectedItem({
      id: item.id,
      name: item.name,
      image: item.image,
      category: item.category,
      condition: item.condition,
      description: item.description,
      priceRangeMin: item.priceRangeMin,
      priceRangeMax: item.priceRangeMax,
      user_id: item.user_id,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Your Matches</h2>
        <Link to="/" className="text-sm text-primary hover:underline">View all</Link>
      </div>
      
      <div className="overflow-x-auto overflow-y-hidden pb-2">
        <div className="flex gap-3 min-w-max">
          {matches.map((item) => (
            <div key={item.id} className="flex-shrink-0 w-64 sm:w-72 md:w-80">
              <div 
                className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                onClick={() => handleCardClick(item)}
              >
                <div className="relative aspect-[4/3]">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  
                  {/* Action buttons - matches search page style */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {/* Suggest Trade button */}
                    <button 
                      className="w-10 h-10 bg-green-500 hover:bg-green-600 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
                      onClick={(e) => handleSwapClick(item, e)}
                      title="Suggest a Trade"
                    >
                      <RefreshCw className="w-5 h-5 text-white" />
                    </button>
                    {/* Like button */}
                    <button 
                      className="w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
                      onClick={(e) => handleLikeItem(item.id, e)}
                      title={likedItemIds.has(item.id) ? "Unlike item" : "Like item"}
                    >
                      <Heart 
                        className={`w-5 h-5 transition-colors ${
                          likedItemIds.has(item.id) 
                            ? 'text-red-500 fill-red-500' 
                            : 'text-muted-foreground hover:text-red-500'
                        }`} 
                      />
                    </button>
                  </div>

                  {/* My Item Thumbnail in Bottom Right */}
                  <div className="absolute bottom-2 right-2">
                    <div className="w-12 h-12 rounded-full border-2 border-background shadow-lg overflow-hidden bg-background">
                      <img src={item.myItemImage} alt="Your item" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-base font-semibold text-foreground mb-1 truncate">{item.name}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      ${item.priceRangeMin} - ${item.priceRangeMax}
                    </p>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                      {item.condition}
                    </span>
                  </div>
                </div>
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
      />

      <TradeItemSelectionModal
        isOpen={tradeModalOpen}
        onClose={() => {
          setTradeModalOpen(false);
          setTradeTargetItem(null);
        }}
        targetItem={tradeTargetItem}
        targetItemOwnerId={tradeTargetItem?.user_id}
      />
    </div>
  );
};

export default MatchesSection;
