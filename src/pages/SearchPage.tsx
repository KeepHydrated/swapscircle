import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Search, ChevronDown, X, Repeat, Heart, Users, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import ExploreItemModal from '@/components/items/ExploreItemModal';
import TradeItemSelectionModal from '@/components/trade/TradeItemSelectionModal';
import { Item } from '@/types/item';
import { useDbItems } from '@/hooks/useDbItems';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';


const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<Record<string, string[]>>({});
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeTargetItem, setTradeTargetItem] = useState<Item | null>(null);
  const [friendsOnly, setFriendsOnly] = useState(false);
  const [friendUserIds, setFriendUserIds] = useState<string[]>([]);
  const [likedItemIds, setLikedItemIds] = useState<Set<string>>(new Set());
  const [userItems, setUserItems] = useState<Item[]>([]);
  const [matchedItemsMap, setMatchedItemsMap] = useState<Map<string, { myItemId: string; myItemImage: string }>>(new Map());

  // Sample match data for demo - maps item IDs to user's matched items
  const sampleMatchImages = [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100',
    'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=100',
    'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=100',
  ];

  // Fetch real items from database
  const { items: dbItems, loading: itemsLoading } = useDbItems();

  // Fetch friend user IDs, liked items, user items, and matches
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setFriendUserIds([]);
        setLikedItemIds(new Set());
        setUserItems([]);
        setMatchedItemsMap(new Map());
        return;
      }

      // Fetch friends
      const { data: friendData, error: friendError } = await supabase
        .from('friend_requests')
        .select('requester_id, recipient_id')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

      if (friendError) {
        console.error('Error fetching friends:', friendError);
      } else {
        const ids = friendData.map(fr => 
          fr.requester_id === user.id ? fr.recipient_id : fr.requester_id
        ).filter((id): id is string => id !== null);
        setFriendUserIds(ids);
      }

      // Fetch liked items
      const { data: likedData, error: likedError } = await supabase
        .from('liked_items')
        .select('item_id')
        .eq('user_id', user.id);

      if (likedError) {
        console.error('Error fetching liked items:', likedError);
      } else {
        setLikedItemIds(new Set(likedData.map(l => l.item_id)));
      }

      // Fetch user's own items
      const { data: myItemsData, error: myItemsError } = await supabase
        .from('items')
        .select('id, name, image_url, image_urls')
        .eq('user_id', user.id)
        .eq('is_available', true)
        .eq('status', 'published');

      if (myItemsError) {
        console.error('Error fetching user items:', myItemsError);
      } else {
        const mappedItems = (myItemsData || []).map(item => ({
          id: item.id,
          name: item.name,
          image: item.image_url || (item.image_urls?.[0]) || '/placeholder.svg'
        }));
        setUserItems(mappedItems as Item[]);
      }

      // Fetch mutual matches
      const { data: matchesData, error: matchesError } = await supabase
        .from('mutual_matches')
        .select('user1_id, user1_item_id, user2_id, user2_item_id')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (matchesError) {
        console.error('Error fetching matches:', matchesError);
      } else if (matchesData && myItemsData) {
        // Build a map of other person's item ID -> my matched item
        const matchMap = new Map<string, { myItemId: string; myItemImage: string }>();
        
        matchesData.forEach(match => {
          const isUser1 = match.user1_id === user.id;
          const myItemId = isUser1 ? match.user1_item_id : match.user2_item_id;
          const theirItemId = isUser1 ? match.user2_item_id : match.user1_item_id;
          
          const myItem = myItemsData.find(item => item.id === myItemId);
          if (myItem) {
            matchMap.set(theirItemId, {
              myItemId: myItem.id,
              myItemImage: myItem.image_url || (myItem.image_urls?.[0]) || '/placeholder.svg'
            });
          }
        });
        
        setMatchedItemsMap(matchMap);
      }
    };

    fetchUserData();
  }, [user]);

  const handleLikeItem = async (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/auth');
      return;
    }

    const isLiked = likedItemIds.has(itemId);

    if (isLiked) {
      // Unlike
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
      // Like
      const { error } = await supabase
        .from('liked_items')
        .insert({ user_id: user.id, item_id: itemId });

      if (!error) {
        setLikedItemIds(prev => new Set(prev).add(itemId));
      }
    }
  };

  // Update search query when URL param changes
  useEffect(() => {
    setSearchQuery(queryParam);
  }, [queryParam]);

  // Pre-select category from URL param
  useEffect(() => {
    if (categoryParam && !selectedCategories.includes(categoryParam)) {
      setSelectedCategories([categoryParam]);
      setSelectedSubcategories({ [categoryParam]: [] });
    }
  }, [categoryParam]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      setSearchParams({ q: value.trim() });
    } else {
      setSearchParams({});
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedSubcategories({});
    setSelectedConditions([]);
    setSelectedPriceRanges([]);
    setFriendsOnly(false);
    setSearchParams({});
  };

  const categories = [
    'Electronics', 'Home & Garden', 'Sports & Outdoors', 'Clothing',
    'Business', 'Entertainment', 'Collectibles', 'Books & Media',
    'Tools & Equipment', 'Food'
  ];

  const subcategories: Record<string, string[]> = {
    'Electronics': ['Phones', 'Laptops', 'Tablets', 'Cameras', 'Audio', 'Gaming', 'Wearables'],
    'Home & Garden': ['Furniture', 'Decor', 'Kitchen', 'Bedding', 'Garden Tools', 'Outdoor'],
    'Sports & Outdoors': ['Exercise', 'Camping', 'Cycling', 'Water Sports', 'Winter Sports'],
    'Clothing': ['Men', 'Women', 'Kids', 'Shoes', 'Accessories', 'Jewelry'],
    'Business': ['Office Supplies', 'Equipment', 'Software', 'Services'],
    'Entertainment': ['Movies', 'Music', 'Games', 'Books', 'Toys'],
    'Collectibles': ['Art', 'Antiques', 'Cards', 'Coins', 'Memorabilia'],
    'Books & Media': ['Books', 'Magazines', 'CDs', 'DVDs', 'Vinyl'],
    'Tools & Equipment': ['Power Tools', 'Hand Tools', 'Machinery', 'Safety Equipment'],
    'Food': ['Fresh Produce', 'Packaged Goods', 'Beverages', 'Snacks', 'Specialty']
  };

  const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
  const priceRanges = ['$0-50', '$50-100', '$100-250', '$250-500', '$500+'];

  // Filter items based on search query and filters
  const filteredResults = dbItems.filter(item => {
    // Filter by friends only
    if (friendsOnly) {
      if (!item.user_id || !friendUserIds.includes(item.user_id)) return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        item.name?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query));
      if (!matchesSearch) return false;
    }
    
    // Filter by selected categories
    if (selectedCategories.length > 0) {
      if (!item.category || !selectedCategories.includes(item.category)) return false;
    }
    
    // Filter by selected conditions
    if (selectedConditions.length > 0) {
      if (!item.condition || !selectedConditions.includes(item.condition)) return false;
    }
    
    return true;
  });

  return (
    <MainLayout>
      <div className="bg-background min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Filters Section */}
          <div className="mb-8 border-b border-border -mx-6">
            <div className="flex gap-3 overflow-x-auto pb-4 px-6">
              {/* Friends Only Toggle */}
              <Button 
                variant="outline"
                onClick={() => setFriendsOnly(!friendsOnly)}
                className={`rounded-full px-6 py-5 text-base font-normal whitespace-nowrap ${
                  friendsOnly 
                    ? 'border-primary text-primary border-2 bg-primary/10' 
                    : 'border-border hover:bg-accent'
                }`}
              >
                <Users className="mr-2 h-4 w-4" />
                Friends Only
              </Button>

              {/* Conditions Dropdown */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline"
                    className={`rounded-full px-6 py-5 text-base font-normal whitespace-nowrap ${
                      selectedConditions.length > 0 
                        ? 'border-primary text-primary border-2' 
                        : 'border-border hover:bg-accent'
                    }`}
                  >
                    Condition{selectedConditions.length > 0 ? ` (${selectedConditions.length})` : ''}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-4 bg-background border border-border z-50" align="start">
                  <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto">
                    {conditions.map((condition) => (
                      <div key={condition} className="flex items-center space-x-2">
                        <Checkbox
                          id={`condition-${condition}`}
                          checked={selectedConditions.includes(condition)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedConditions([...selectedConditions, condition]);
                            } else {
                              setSelectedConditions(selectedConditions.filter(c => c !== condition));
                            }
                          }}
                        />
                        <Label
                          htmlFor={`condition-${condition}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {condition}
                        </Label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Price Ranges Dropdown */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline"
                    className={`rounded-full px-6 py-5 text-base font-normal whitespace-nowrap ${
                      selectedPriceRanges.length > 0 
                        ? 'border-primary text-primary border-2' 
                        : 'border-border hover:bg-accent'
                    }`}
                  >
                    Price{selectedPriceRanges.length > 0 ? ` (${selectedPriceRanges.length})` : ''}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-4 bg-background border border-border z-50" align="start">
                  <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto">
                    {priceRanges.map((range) => (
                      <div key={range} className="flex items-center space-x-2">
                        <Checkbox
                          id={`price-${range}`}
                          checked={selectedPriceRanges.includes(range)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPriceRanges([...selectedPriceRanges, range]);
                            } else {
                              setSelectedPriceRanges(selectedPriceRanges.filter(p => p !== range));
                            }
                          }}
                        />
                        <Label
                          htmlFor={`price-${range}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {range}
                        </Label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Categories Dropdown */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline"
                    className={`rounded-full px-6 py-5 text-base font-normal whitespace-nowrap ${
                      selectedCategories.length > 0 
                        ? 'border-primary text-primary border-2' 
                        : 'border-border hover:bg-accent'
                    }`}
                  >
                    Category{selectedCategories.length > 0 ? ` (${selectedCategories.length})` : ''}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-4 bg-background border border-border z-50" align="start">
                  <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCategories([...selectedCategories, category]);
                              setSelectedSubcategories({ ...selectedSubcategories, [category]: [] });
                            } else {
                              setSelectedCategories(selectedCategories.filter(c => c !== category));
                              const newSubcategories = { ...selectedSubcategories };
                              delete newSubcategories[category];
                              setSelectedSubcategories(newSubcategories);
                            }
                          }}
                        />
                        <Label
                          htmlFor={`category-${category}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Subcategory Dropdowns for Selected Categories */}
              {selectedCategories.map((category) => (
                <Popover key={category}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline"
                      className={`rounded-full px-6 py-5 text-base font-normal whitespace-nowrap ${
                        selectedSubcategories[category]?.length > 0 
                          ? 'border-primary text-primary border-2' 
                          : 'border-border hover:bg-accent'
                      }`}
                    >
                      {category}{selectedSubcategories[category]?.length > 0 ? ` (${selectedSubcategories[category].length})` : ''}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-4 bg-background border border-border z-50" align="start">
                    <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto">
                      {subcategories[category]?.map((subcategory) => (
                        <div key={subcategory} className="flex items-center space-x-2">
                          <Checkbox
                            id={`subcategory-${category}-${subcategory}`}
                            checked={selectedSubcategories[category]?.includes(subcategory) || false}
                            onCheckedChange={(checked) => {
                              const currentSubs = selectedSubcategories[category] || [];
                              if (checked) {
                                setSelectedSubcategories({
                                  ...selectedSubcategories,
                                  [category]: [...currentSubs, subcategory]
                                });
                              } else {
                                setSelectedSubcategories({
                                  ...selectedSubcategories,
                                  [category]: currentSubs.filter(s => s !== subcategory)
                                });
                              }
                            }}
                          />
                          <Label
                            htmlFor={`subcategory-${category}-${subcategory}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {subcategory}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              ))}

            </div>
          </div>

          {/* Results Count and Active Filters */}
          <div className="mb-6 flex items-center gap-3 flex-wrap">
            <p className="text-sm text-muted-foreground">
              Showing {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'}
            </p>
            {searchQuery && (
              <>
                <Badge variant="secondary" className="gap-2 py-1.5 px-3 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                  Search: "{searchQuery}"
                  <button
                    onClick={() => handleSearchChange('')}
                    className="hover:bg-emerald-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear all
                </button>
              </>
            )}
          </div>

          {/* Results Grid */}
          {itemsLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading items...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredResults.map((item, index) => {
                // Use real match data if available, otherwise use sample matches for first 3 items
                const realMatchData = matchedItemsMap.get(item.id);
                const sampleMatchData = index < 3 && !realMatchData ? {
                  myItemId: `sample-${index}`,
                  myItemImage: sampleMatchImages[index]
                } : null;
                const matchData = realMatchData || sampleMatchData;
                const isMatch = !!matchData;
                
                return (
                <div
                  key={item.id}
                  className="relative bg-card rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => {
                    setSelectedItem(item);
                    setIsModalOpen(true);
                  }}
                >
                  {/* Matched item thumbnail */}
                  {isMatch && matchData && (
                    <div className="absolute top-3 left-3 z-10">
                      <div className="w-12 h-12 rounded-full border-2 border-background shadow-lg overflow-hidden bg-background">
                        <img 
                          src={matchData.myItemImage} 
                          alt="Your matched item" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Image */}
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={item.image}
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

                  {/* Action buttons */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {/* Trade button - hover only */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      {isMatch ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTradeTargetItem(item);
                            setIsTradeModalOpen(true);
                          }}
                          className="w-8 h-8 bg-white hover:bg-gray-50 rounded-full shadow-md flex items-center justify-center"
                          aria-label="Accept trade"
                        >
                          <Check className="w-4 h-4 text-green-500" />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTradeTargetItem(item);
                            setIsTradeModalOpen(true);
                          }}
                          className="w-8 h-8 bg-white hover:bg-gray-50 rounded-full shadow-md flex items-center justify-center"
                          aria-label="Suggest trade"
                        >
                          <Repeat className="w-4 h-4 text-green-500" />
                        </button>
                      )}
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
              );
              })}
            </div>
          )}

          {/* No Results */}
          {!itemsLoading && filteredResults.length === 0 && (
            <div className="text-center py-16">
              <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No results found</h3>
              <p className="text-muted-foreground">Try searching for something else</p>
            </div>
          )}
        </div>
      </div>

      {/* Item Details Modal */}
      <ExploreItemModal
        open={isModalOpen}
        item={selectedItem}
        matchedItemImage={selectedItem ? matchedItemsMap.get(selectedItem.id)?.myItemImage : undefined}
        matchedItemId={selectedItem ? matchedItemsMap.get(selectedItem.id)?.myItemId : undefined}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
        }}
        currentIndex={selectedItem ? filteredResults.findIndex(i => i.id === selectedItem.id) : 0}
        totalItems={filteredResults.length}
        onNavigatePrev={() => {
          const currentIdx = filteredResults.findIndex(i => i.id === selectedItem?.id);
          if (currentIdx > 0) {
            setSelectedItem(filteredResults[currentIdx - 1]);
          }
        }}
        onNavigateNext={() => {
          const currentIdx = filteredResults.findIndex(i => i.id === selectedItem?.id);
          if (currentIdx < filteredResults.length - 1) {
            setSelectedItem(filteredResults[currentIdx + 1]);
          }
        }}
        liked={selectedItem ? likedItemIds.has(selectedItem.id) : false}
        onLike={() => {
          if (selectedItem) {
            const isLiked = likedItemIds.has(selectedItem.id);
            setLikedItemIds(prev => {
              const newSet = new Set(prev);
              if (isLiked) {
                newSet.delete(selectedItem.id);
              } else {
                newSet.add(selectedItem.id);
              }
              return newSet;
            });
          }
        }}
      />

      {/* Trade Item Selection Modal */}
      <TradeItemSelectionModal
        isOpen={isTradeModalOpen}
        onClose={() => {
          setIsTradeModalOpen(false);
          setTradeTargetItem(null);
        }}
        targetItem={tradeTargetItem}
        targetItemOwnerId={tradeTargetItem?.user_id}
      />
    </MainLayout>
  );
};

export default SearchPage;
