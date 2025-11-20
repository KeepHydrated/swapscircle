import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Search, ChevronDown, ChevronUp, X } from 'lucide-react';
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
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
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
      <div className="bg-background min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm font-medium text-foreground mb-4 hover:text-primary transition-colors"
          >
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>

          {/* Filters Section */}
          {showFilters && (
            <div className="bg-card border border-border rounded-lg p-6 mb-8">
              {/* Categories Dropdown */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Categories you're interested in</h3>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {selectedCategories.length > 0
                        ? `${selectedCategories.length} selected`
                        : 'Select categories'}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-4 bg-background border border-border z-50" align="start">
                    <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category}`}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedCategories([...selectedCategories, category]);
                              } else {
                                setSelectedCategories(selectedCategories.filter(c => c !== category));
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
              </div>

              {/* Conditions */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Acceptable conditions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
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
              </div>

              {/* Price Ranges */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Price ranges you're interested in</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
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
              </div>
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
