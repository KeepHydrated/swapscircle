import React, { useState, useEffect } from 'react';
import { Heart, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ExploreItemModal from '@/components/items/ExploreItemModal';
import { Item } from '@/types/item';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const MatchesSection = () => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [likedItemIds, setLikedItemIds] = useState<Set<string>>(new Set());
  const [isCreatingTrade, setIsCreatingTrade] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mock match data for testing
  const matches = [
    { id: "1", name: "Mountain Bike - Trek", image: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91", user: "Alex M.", myItemId: "my-item-1", myItemName: "Vintage Camera", myItemImage: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7", priceRangeMin: 300, priceRangeMax: 400, condition: "Good", category: "Sports & Outdoors", description: "Reliable mountain bike perfect for trails. Recently serviced with new brakes and tires.", user_id: "demo-user-1", isDemo: true },
    { id: "2", name: "Digital Camera - Canon", image: "https://images.unsplash.com/photo-1526413232644-8a40f03cc03b", user: "Sarah K.", myItemId: "my-item-2", myItemName: "Leather Jacket", myItemImage: "https://images.unsplash.com/photo-1580894894513-541e068a3e2b", priceRangeMin: 450, priceRangeMax: 600, condition: "Excellent", category: "Electronics", description: "Professional DSLR camera with multiple lenses included. Perfect for photography enthusiasts.", user_id: "demo-user-2", isDemo: true },
    { id: "3", name: "Electric Guitar - Fender", image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d", user: "Mike T.", myItemId: "my-item-3", myItemName: "Headphones", myItemImage: "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c", priceRangeMin: 500, priceRangeMax: 700, condition: "Good", category: "Entertainment", description: "Classic Fender electric guitar with rich tone. Includes hard case and amp.", user_id: "demo-user-3", isDemo: true },
    { id: "4", name: "Standing Desk - Adjustable", image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2", user: "Emma L.", myItemId: "my-item-4", myItemName: "Office Chair", myItemImage: "https://images.unsplash.com/photo-1487147264018-f937fba0c817", priceRangeMin: 200, priceRangeMax: 350, condition: "Like New", category: "Home & Garden", description: "Electric height-adjustable standing desk. Barely used, in excellent condition.", user_id: "demo-user-4", isDemo: true },
    { id: "5", name: "Coffee Machine - Breville", image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6", user: "James P.", myItemId: "my-item-5", myItemName: "Blender", myItemImage: "https://images.unsplash.com/photo-1585399000684-d2f72660f092", priceRangeMin: 150, priceRangeMax: 250, condition: "Good", category: "Home & Garden", description: "Premium espresso machine with milk frother. Makes cafe-quality coffee at home.", user_id: "demo-user-5", isDemo: true },
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

  const handleLikeItem = async (itemId: string, isDemo: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/auth');
      return;
    }

    // For demo items, just toggle visual state
    if (isDemo) {
      setLikedItemIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(itemId)) {
          newSet.delete(itemId);
        } else {
          newSet.add(itemId);
        }
        return newSet;
      });
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

  const handleRequestTrade = async (item: typeof matches[0], e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      navigate('/auth');
      return;
    }

    // For demo items, navigate to messages with demo conversation
    if (item.isDemo) {
      // Navigate to messages with demo trade info
      navigate(`/messages?demo=true&matchId=${item.id}&theirItem=${encodeURIComponent(item.name)}&myItem=${encodeURIComponent(item.myItemName)}`);
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
        navigate(`/messages?conversationId=${existing.id}`);
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

      // Navigate to messages with the new conversation
      navigate(`/messages?conversationId=${conversation.id}`);
    } catch (error) {
      console.error('Error requesting trade:', error);
      toast.error('Failed to start trade chat');
    } finally {
      setIsCreatingTrade(null);
    }
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
                  
                  {/* Action buttons */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button 
                      className={`w-10 h-10 bg-green-500 hover:bg-green-600 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 ${isCreatingTrade === item.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={(e) => handleRequestTrade(item, e)}
                      disabled={isCreatingTrade === item.id}
                      title="Request Trade"
                    >
                      <RefreshCw className={`w-5 h-5 text-white ${isCreatingTrade === item.id ? 'animate-spin' : ''}`} />
                    </button>
                    <button 
                      className="w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
                      onClick={(e) => handleLikeItem(item.id, item.isDemo, e)}
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

                  {/* My Item Thumbnail */}
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
    </div>
  );
};

export default MatchesSection;
