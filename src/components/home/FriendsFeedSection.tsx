import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import ExploreItemModal from '@/components/items/ExploreItemModal';
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
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleItemClick = (item: FriendItem) => {
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
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Users className="h-5 w-5" />
          Recent from Friends
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse bg-muted rounded-xl h-24" />
          ))}
        </div>
      </section>
    );
  }

  if (friendItems.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Users className="h-5 w-5" />
          Recent from Friends
        </h2>
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">No recent items from friends yet.</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Add friends to see their latest items here!</p>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Users className="h-5 w-5" />
        Recent from Friends
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {friendItems.map(item => (
          <Card 
            key={item.id}
            className="flex gap-3 p-3 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleItemClick(item)}
          >
            {/* Item Image */}
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <img
                src={item.image_url || (item.image_urls?.[0]) || '/placeholder.svg'}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* User info */}
              <Link 
                to={`/other-person-profile?userId=${item.profile.id}`}
                className="flex items-center gap-2 mb-1"
                onClick={(e) => e.stopPropagation()}
              >
                <Avatar className="h-5 w-5">
                  <AvatarImage src={item.profile.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {item.profile.username?.charAt(0).toUpperCase() || 'F'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground hover:text-foreground">
                  {item.profile.username || 'Friend'}
                </span>
                <span className="text-xs text-muted-foreground/60">
                  · {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                </span>
              </Link>

              {/* Item name */}
              <h3 className="font-medium text-sm text-foreground truncate">{item.name}</h3>

              {/* Price & Condition */}
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                {(item.price_range_min || item.price_range_max) && (
                  <span>${item.price_range_min || 0} - ${item.price_range_max || '∞'}</span>
                )}
                {item.condition && (
                  <span className="bg-muted px-1.5 py-0.5 rounded text-xs">{item.condition}</span>
                )}
              </div>
            </div>
          </Card>
        ))}
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
          onNavigatePrev={() => {
            const currentIdx = friendItems.findIndex(i => i.id === selectedItem?.id);
            if (currentIdx > 0) handleItemClick(friendItems[currentIdx - 1]);
          }}
          onNavigateNext={() => {
            const currentIdx = friendItems.findIndex(i => i.id === selectedItem?.id);
            if (currentIdx < friendItems.length - 1) handleItemClick(friendItems[currentIdx + 1]);
          }}
          currentIndex={friendItems.findIndex(i => i.id === selectedItem?.id)}
          totalItems={friendItems.length}
        />
      )}
    </section>
  );
};

export default FriendsFeedSection;
