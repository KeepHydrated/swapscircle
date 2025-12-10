import React, { useState, useEffect } from 'react';
import { Heart, Check } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import ExploreItemModal from '@/components/items/ExploreItemModal';
import { Item } from '@/types/item';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface MatchItem {
  id: string;
  name: string;
  image: string;
  image_urls: string[];
  priceRangeMin: number;
  priceRangeMax: number;
  condition: string;
  myItemImage: string;
  myItemId: string;
  category: string;
  description: string;
  user_id: string;
}

const Test: React.FC = () => {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch real items from database
  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const { data: session } = await supabase.auth.getSession();
        const currentUserId = session?.session?.user?.id;

        // Fetch items that are NOT owned by the current user (to simulate matches)
        let query = supabase
          .from('items')
          .select('*')
          .eq('is_available', true)
          .eq('is_hidden', false)
          .not('image_url', 'is', null)
          .limit(10);

        if (currentUserId) {
          query = query.neq('user_id', currentUserId);
        }

        const { data: otherItems, error: otherError } = await query;

        if (otherError) {
          console.error('Error fetching items:', otherError);
          return;
        }

        // Fetch current user's items (to use as "my item" in matches)
        let myItems: any[] = [];
        if (currentUserId) {
          const { data: userItems, error: userError } = await supabase
            .from('items')
            .select('*')
            .eq('user_id', currentUserId)
            .eq('is_available', true)
            .limit(5);

          if (!userError && userItems) {
            myItems = userItems;
          }
        }

        // Create match pairs
        const matchData: MatchItem[] = (otherItems || []).map((item, index) => {
          const myItem = myItems[index % Math.max(myItems.length, 1)] || null;
          return {
            id: item.id,
            name: item.name,
            image: item.image_url || '/placeholder.svg',
            image_urls: item.image_urls || [item.image_url].filter(Boolean),
            priceRangeMin: item.price_range_min || 0,
            priceRangeMax: item.price_range_max || 0,
            condition: item.condition || 'Unknown',
            myItemImage: myItem?.image_url || '/placeholder.svg',
            myItemId: myItem?.id || '',
            category: item.category || 'Other',
            description: item.description || '',
            user_id: item.user_id,
          };
        });

        setMatches(matchData);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const handleLike = (id: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    setLikedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleRequestTrade = async (match: MatchItem) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Need a valid myItemId to create a trade
    if (!match.myItemId) {
      console.error('No user item available for trade');
      return;
    }

    try {
      // Create trade conversation
      const { data: conversation, error } = await supabase
        .from('trade_conversations')
        .insert({
          requester_id: user.id,
          owner_id: match.user_id,
          requester_item_id: match.myItemId,
          requester_item_ids: [match.myItemId],
          owner_item_id: match.id,
          status: 'pending'
        })
        .select('id')
        .single();

      if (error) {
        // If duplicate, try to find existing conversation
        const { data: existing } = await supabase
          .from('trade_conversations')
          .select('id')
          .eq('requester_id', user.id)
          .eq('owner_id', match.user_id)
          .eq('owner_item_id', match.id)
          .single();
        
        if (existing) {
          navigate(`/messages?conversation=${existing.id}`);
          return;
        }
        console.error('Error creating trade:', error);
        return;
      }

      // Navigate to messages with the specific conversation
      navigate(`/messages?conversation=${conversation.id}`);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const convertToItem = (match: MatchItem): Item => ({
    id: match.id,
    name: match.name,
    image: match.image,
    image_urls: match.image_urls,
    priceRangeMin: match.priceRangeMin,
    priceRangeMax: match.priceRangeMax,
    condition: match.condition,
    category: match.category,
    description: match.description,
    user_id: match.user_id,
  });

  const handleCardClick = (match: MatchItem, index: number) => {
    setSelectedItem(convertToItem(match));
    setSelectedIndex(index);
    setIsModalOpen(true);
  };

  const handleNavigatePrev = () => {
    if (selectedIndex > 0) {
      const newIndex = selectedIndex - 1;
      setSelectedIndex(newIndex);
      setSelectedItem(convertToItem(matches[newIndex]));
    }
  };

  const handleNavigateNext = () => {
    if (selectedIndex < matches.length - 1) {
      const newIndex = selectedIndex + 1;
      setSelectedIndex(newIndex);
      setSelectedItem(convertToItem(matches[newIndex]));
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-6">Your Matches</h1>
      
      {matches.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No matches found. Try posting some items first!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {matches.map((match, index) => (
            <div
              key={match.id}
              className="relative bg-card rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => handleCardClick(match, index)}
            >
              {/* Matched item thumbnail */}
              {match.myItemImage && match.myItemImage !== '/placeholder.svg' && (
                <div className="absolute top-3 left-3 z-10">
                  <div className="w-14 h-14 rounded-full border-2 border-background shadow-lg overflow-hidden bg-background">
                    <img 
                      src={match.myItemImage} 
                      alt="Your matched item" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Image */}
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={match.image}
                  alt={match.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Content */}
              <div className="p-3">
                <h3 className="font-semibold text-sm truncate">{match.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    ${match.priceRangeMin} - ${match.priceRangeMax}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
                    {match.condition}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRequestTrade(match);
                  }}
                  className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50"
                  aria-label="Suggest trade"
                >
                  <Check className="w-4 h-4 text-green-500" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(match.id);
                  }}
                  className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50"
                  aria-label={likedItems.has(match.id) ? "Unlike" : "Like"}
                >
                  <Heart 
                    className="w-4 h-4 text-red-500" 
                    fill={likedItems.has(match.id) ? "red" : "none"}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ExploreItemModal
        open={isModalOpen}
        item={selectedItem}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
        }}
        onNavigatePrev={handleNavigatePrev}
        onNavigateNext={handleNavigateNext}
        currentIndex={selectedIndex}
        totalItems={matches.length}
        matchedItemImage={matches[selectedIndex]?.myItemImage}
        matchedItemId={matches[selectedIndex]?.myItemId}
      />
    </MainLayout>
  );
};

export default Test;
