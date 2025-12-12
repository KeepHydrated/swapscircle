import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, Filter } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import ItemCard from '@/components/items/ItemCard';
import { useDbItems } from '@/hooks/useDbItems';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// Sample match items for demo purposes
const sampleMatchItems = [
  {
    id: 'match-1',
    name: 'Vintage Camera',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400',
    priceRangeMin: 150,
    priceRangeMax: 250,
    condition: 'Good',
    category: 'Electronics',
    myItemImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100',
  },
  {
    id: 'match-2',
    name: 'Leather Messenger Bag',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
    priceRangeMin: 80,
    priceRangeMax: 120,
    condition: 'Like New',
    category: 'Fashion',
    myItemImage: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=100',
  },
  {
    id: 'match-3',
    name: 'Mechanical Keyboard',
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400',
    priceRangeMin: 100,
    priceRangeMax: 180,
    condition: 'Excellent',
    category: 'Electronics',
    myItemImage: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=100',
  },
];

const Search: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('items');
  const { items, loading: itemsLoading } = useDbItems();
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLike = (id: string, global?: boolean) => {
    toast({ title: global ? `Liked item for all your items!` : "Item liked!", duration: 2000 });
  };

  const handleReject = (id: string, global?: boolean) => {
    toast({ title: global ? `Rejected item for all your items` : "Item rejected", duration: 2000 });
  };

  const handleReport = (id: string) => {
    toast({ title: "Report submitted", duration: 2000 });
  };

  // Filter items based on search query
  const filteredItems = items.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query) ||
      item.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  });

  // Fetch users when tab changes to users
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url, location, bio')
        .limit(20);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.username?.toLowerCase().includes(query) ||
      user.location?.toLowerCase().includes(query)
    );
  });

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="text-muted-foreground mt-1">Find items and users to trade with</p>
      </div>
      
      <div className="relative mb-6">
        <SearchIcon className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="Search items, users, or categories..." 
          className="pl-10 h-12 text-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="items">
          {itemsLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading items...</p>
            </div>
          ) : filteredItems.length === 0 && sampleMatchItems.length === 0 ? (
            <div className="bg-card rounded-lg shadow-sm p-12 text-center">
              <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-medium text-foreground mb-2">No items found</h2>
              <p className="text-muted-foreground">Try adjusting your search terms</p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-muted-foreground">
                Found {filteredItems.length + sampleMatchItems.length} item{filteredItems.length + sampleMatchItems.length !== 1 ? 's' : ''}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Mix sample matches with regular items */}
                {sampleMatchItems.map(item => (
                  <ItemCard
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    image={item.image}
                    isMatch={true}
                    myItemImage={item.myItemImage}
                    onSelect={(id) => navigate(`/item/${id}`)}
                    onLike={handleLike}
                    onReject={handleReject}
                    onReport={handleReport}
                    showLikeButton={true}
                    category={item.category}
                    priceRangeMin={item.priceRangeMin}
                    priceRangeMax={item.priceRangeMax}
                    condition={item.condition}
                  />
                ))}
                {filteredItems.map(item => (
                  <ItemCard
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    image={item.image}
                    image_urls={item.image_urls}
                    isMatch={false}
                    onSelect={(id) => navigate(`/item/${id}`)}
                    onLike={handleLike}
                    onReject={handleReject}
                    onReport={handleReport}
                    showLikeButton={true}
                    category={item.category}
                    tags={item.tags}
                    priceRangeMin={item.priceRangeMin}
                    priceRangeMax={item.priceRangeMax}
                    condition={item.condition}
                  />
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="users">
          {usersLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="bg-card rounded-lg shadow-sm p-12 text-center">
              <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-medium text-foreground mb-2">No users found</h2>
              <p className="text-muted-foreground">Try adjusting your search terms</p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-muted-foreground">
                Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map(user => (
                  <div
                    key={user.id}
                    className="bg-card rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/profile/${user.id}`)}
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={user.avatar_url} alt={user.name} />
                        <AvatarFallback>{user.name?.[0] || '?'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-foreground truncate">
                          {user.name || 'Anonymous'}
                        </h3>
                        {user.username && (
                          <p className="text-sm text-muted-foreground">@{user.username}</p>
                        )}
                        {user.location && (
                          <p className="text-sm text-muted-foreground mt-1">{user.location}</p>
                        )}
                        {user.bio && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {user.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default Search;
