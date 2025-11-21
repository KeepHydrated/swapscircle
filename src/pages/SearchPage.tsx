import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Search, ChevronDown, ChevronUp, X, Menu } from 'lucide-react';
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

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<Record<string, string[]>>({});
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);

  // Update search query when URL param changes
  useEffect(() => {
    setSearchQuery(queryParam);
  }, [queryParam]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      setSearchParams({ q: value.trim() });
    } else {
      setSearchParams({});
    }
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

  const mockResults = [
    { id: 1, name: "Mountain Bike - Trek", image: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91", user: "Alex M.", category: "Sports" },
    { id: 2, name: "Digital Camera - Canon", image: "https://images.unsplash.com/photo-1526413232644-8a40f03cc03b", user: "Sarah K.", category: "Electronics" },
    { id: 3, name: "Electric Guitar - Fender", image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d", user: "Mike T.", category: "Music" },
    { id: 4, name: "Standing Desk - Adjustable", image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2", user: "Emma L.", category: "Furniture" },
    { id: 5, name: "Coffee Machine - Breville", image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6", user: "James P.", category: "Kitchen" },
    { id: 6, name: "Running Shoes - Nike", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff", user: "Lisa W.", category: "Fashion" },
  ];

  const filteredResults = searchQuery
    ? mockResults.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockResults;

  return (
    <MainLayout>
      <div className="bg-background min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Filters Section */}
          <div className="mb-8 border-b border-border -mx-6">
            <div className="flex gap-3 overflow-x-auto pb-4 px-6">
              {/* Conditions Dropdown */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={`rounded-full px-6 py-5 text-base font-normal whitespace-nowrap ${
                      selectedConditions.length > 0 
                        ? 'border-2 border-primary text-primary hover:bg-primary/10' 
                        : 'border-border hover:bg-accent'
                    }`}
                  >
                    Condition {selectedConditions.length > 0 && `(${selectedConditions.length})`}
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
                        ? 'border-2 border-primary text-primary hover:bg-primary/10' 
                        : 'border-border hover:bg-accent'
                    }`}
                  >
                    Price {selectedPriceRanges.length > 0 && `(${selectedPriceRanges.length})`}
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
                        ? 'border-2 border-primary text-primary hover:bg-primary/10' 
                        : 'border-border hover:bg-accent'
                    }`}
                  >
                    Category {selectedCategories.length > 0 && `(${selectedCategories.length})`}
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
              {selectedCategories.map((category) => {
                const subCount = selectedSubcategories[category]?.length || 0;
                return (
                  <Popover key={category}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className={`rounded-full px-6 py-5 text-base font-normal whitespace-nowrap ${
                          subCount > 0 
                            ? 'border-2 border-primary text-primary hover:bg-primary/10' 
                            : 'border-border hover:bg-accent'
                        }`}
                      >
                        {category} {subCount > 0 && `(${subCount})`}
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
              );
            })}

            </div>
          </div>

          {/* Active Filter Badges */}
          {(selectedConditions.length > 0 || selectedPriceRanges.length > 0 || selectedCategories.length > 0 || Object.values(selectedSubcategories).some(arr => arr.length > 0)) && (
            <div className="mb-6 flex items-center gap-2 flex-wrap">
              {selectedConditions.map((condition) => (
                <Badge 
                  key={condition} 
                  variant="secondary" 
                  className="gap-2 py-2 px-4 bg-muted text-foreground hover:bg-muted/80 rounded-full border border-border/60"
                >
                  {condition}
                  <button
                    onClick={() => setSelectedConditions(selectedConditions.filter(c => c !== condition))}
                    className="hover:bg-accent rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {selectedPriceRanges.map((range) => (
                <Badge 
                  key={range} 
                  variant="secondary" 
                  className="gap-2 py-2 px-4 bg-muted text-foreground hover:bg-muted/80 rounded-full border border-border/60"
                >
                  {range}
                  <button
                    onClick={() => setSelectedPriceRanges(selectedPriceRanges.filter(p => p !== range))}
                    className="hover:bg-accent rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {selectedCategories.map((category) => (
                <Badge 
                  key={category} 
                  variant="secondary" 
                  className="gap-2 py-2 px-4 bg-muted text-foreground hover:bg-muted/80 rounded-full border border-border/60"
                >
                  {category}
                  <button
                    onClick={() => {
                      setSelectedCategories(selectedCategories.filter(c => c !== category));
                      const newSubcategories = { ...selectedSubcategories };
                      delete newSubcategories[category];
                      setSelectedSubcategories(newSubcategories);
                    }}
                    className="hover:bg-accent rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {Object.entries(selectedSubcategories).map(([category, subs]) =>
                subs.map((sub) => (
                  <Badge 
                    key={`${category}-${sub}`} 
                    variant="secondary" 
                    className="gap-2 py-2 px-4 bg-muted text-foreground hover:bg-muted/80 rounded-full border border-border/60"
                  >
                    {sub}
                    <button
                      onClick={() => {
                        setSelectedSubcategories({
                          ...selectedSubcategories,
                          [category]: subs.filter(s => s !== sub)
                        });
                      }}
                      className="hover:bg-accent rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))
              )}
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedConditions([]);
                  setSelectedPriceRanges([]);
                  setSelectedCategories([]);
                  setSelectedSubcategories({});
                }}
                className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-full px-4"
              >
                Clear All
              </Button>
            </div>
          )}

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
                  onClick={() => handleSearchChange('')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear all
                </button>
              </>
            )}
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResults.map((item) => (
              <div
                key={item.id}
                className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="relative aspect-[4/3]">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-foreground">
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-base font-semibold text-foreground mb-1">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">by {item.user}</p>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredResults.length === 0 && (
            <div className="text-center py-16">
              <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No results found</h3>
              <p className="text-muted-foreground">Try searching for something else</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SearchPage;
