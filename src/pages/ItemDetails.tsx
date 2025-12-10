
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { blockingService } from '@/services/blockingService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface ItemData {
  id: string;
  name: string;
  description: string;
  image_url: string;
  image_urls: string[];
  category: string;
  condition: string;
  tags: string[];
  price_range_min: number;
  price_range_max: number;
  looking_for_description: string;
  looking_for_categories: string[];
  looking_for_conditions: string[];
  looking_for_price_ranges: string[];
  created_at: string;
  user_id: string;
}

const ItemDetails: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { supabaseConfigured, user } = useAuth();
  const [item, setItem] = useState<ItemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      if (!itemId) {
        setError('No item ID provided');
        setLoading(false);
        return;
      }

      if (!supabaseConfigured) {
        setError('Database not configured');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .eq('id', itemId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching item:', error);
          setError('Error loading item');
          toast.error('Error loading item');
        } else if (!data) {
          setError('Item not found');
          toast.error('Item not found');
        } else {
          // Check if the item owner has blocked the current user or vice versa
          if (user && data.user_id !== user.id) {
            const isBlockedByOwner = await blockingService.isCurrentUserBlockedBy(data.user_id);
            const hasBlockedOwner = await blockingService.isUserBlocked(data.user_id);
            
            if (isBlockedByOwner || hasBlockedOwner) {
              setError('Item not accessible');
              toast.error('This item is not accessible');
              return;
            }
          }
          setItem(data);
        }
      } catch (error) {
        console.error('Error fetching item:', error);
        setError('Error loading item');
        toast.error('Error loading item');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId, supabaseConfigured, user]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </MainLayout>
    );
  }

  if (error || !item) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {error || 'Item not found'}
            </h1>
            <p className="text-gray-600 mb-6">
              The item you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/')}>
              Go to Home
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Categories for subcategory lookup
  const categories = {
    "Electronics": ["Cameras", "Computers", "Audio Equipment", "TVs", "Gaming Consoles", "Mobile Devices", "Other Electronics"],
    "Home & Garden": ["Power Tools", "Furniture", "Party Supplies", "Kitchen Appliances", "Gardening Equipment", "Home Decor", "Other Home Items"],
    "Sports & Outdoors": ["Camping Gear", "Bikes", "Winter Sports", "Water Sports", "Fitness Equipment", "Team Sports", "Other Sports Gear"],
    "Clothing": ["Formal Wear", "Costumes", "Accessories", "Designer Items", "Special Occasion", "Casual Wear", "Other Clothing"],
    "Business": ["Office Equipment", "Event Spaces", "Projectors", "Conference Equipment", "Office Furniture", "Business Services", "Other Business Items"],
    "Entertainment": ["Musical Instruments", "Party Equipment", "Board Games", "Video Games", "Movies & Music", "Books", "Other Entertainment Items"],
    "Collectibles": ["Trading Cards", "Toys", "Vintage Items", "Memorabilia", "Comics", "Stamps", "Coins", "Vinyl Records", "Antiques", "Other Collectibles"],
    "Books & Media": ["Books", "Movies", "Music", "Magazines", "E-books", "Audiobooks", "Other Media"],
    "Tools & Equipment": ["Power Tools", "Hand Tools", "Construction Equipment", "Workshop Tools", "Measuring Tools", "Safety Equipment", "Other Tools"],
    "Food": ["Beverages", "Snacks", "Specialty Foods", "Baking Supplies", "Condiments", "Health Foods", "International Foods", "Other Food Items"]
  };

  const conditions = ["New", "Like New", "Good", "Fair", "Poor"];
  const priceRanges = ["0-50", "50-100", "100-250", "250-500", "500+"];

  // Get subcategories for looking_for categories
  const getSubcategoriesForCategory = (category: string): string[] => {
    const allSubcats = categories[category as keyof typeof categories] || [];
    return item.tags?.filter(tag => allSubcats.includes(tag)) || [];
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid md:grid-cols-2 gap-6">
          {/* LEFT COLUMN - What You're Offering */}
          <Card>
            <CardHeader>
              <CardTitle>What You're Offering</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <div className="p-3 bg-muted rounded-md">
                  {item.name}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <div className="p-3 bg-muted rounded-md min-h-[100px]">
                  {item.description}
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="text-sm font-medium mb-2 block">Images</label>
                <div className="grid grid-cols-2 gap-3">
                  {(item.image_urls || [item.image_url]).filter(Boolean).map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-md overflow-hidden bg-muted">
                      <img 
                        src={url} 
                        alt={`${item.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <div className="p-3 bg-muted rounded-md">
                  {item.category}
                </div>
              </div>

              {/* Subcategory */}
              {item.tags?.[0] && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Subcategory</label>
                  <div className="p-3 bg-muted rounded-md">
                    {item.tags[0]}
                  </div>
                </div>
              )}

              {/* Condition */}
              <div>
                <label className="text-sm font-medium mb-2 block">Condition</label>
                <div className="p-3 bg-muted rounded-md">
                  {item.condition}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">Estimated Value</label>
                <div className="p-3 bg-muted rounded-md">
                  ${item.price_range_min}-${item.price_range_max}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RIGHT COLUMN - What You're Looking For */}
          <Card>
            <CardHeader>
              <CardTitle>What You're Looking For</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Description */}
              <div>
                <label className="text-sm font-medium mb-2 block">Description (optional)</label>
                <div className="p-3 bg-muted rounded-md min-h-[100px]">
                  {item.looking_for_description || 'No specific description provided'}
                </div>
              </div>

              {/* Categories & Subcategories */}
              <div>
                <label className="text-sm font-medium mb-2 block">Categories</label>
                <div className="space-y-4">
                  {(item.looking_for_categories || []).map((category) => {
                    const subcats = getSubcategoriesForCategory(category);
                    return (
                      <div key={category} className="border rounded-md p-3 bg-muted/50">
                        <div className="font-medium mb-2">{category}</div>
                        {subcats.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {subcats.map((sub) => (
                              <Badge key={sub} variant="secondary">
                                {sub}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {(!item.looking_for_categories || item.looking_for_categories.length === 0) && (
                    <div className="p-3 bg-muted rounded-md text-muted-foreground">
                      No categories specified
                    </div>
                  )}
                </div>
              </div>

              {/* Conditions */}
              <div>
                <label className="text-sm font-medium mb-2 block">Condition</label>
                <div className="flex flex-wrap gap-2">
                  {(item.looking_for_conditions || []).map((condition) => (
                    <Badge key={condition} variant="outline">
                      {condition}
                    </Badge>
                  ))}
                  {(!item.looking_for_conditions || item.looking_for_conditions.length === 0) && (
                    <div className="p-3 bg-muted rounded-md text-muted-foreground w-full">
                      No conditions specified
                    </div>
                  )}
                </div>
              </div>

              {/* Price Ranges */}
              <div>
                <label className="text-sm font-medium mb-2 block">Price Range</label>
                <div className="flex flex-wrap gap-2">
                  {(item.looking_for_price_ranges || []).map((range) => (
                    <Badge key={range} variant="outline">
                      ${range}
                    </Badge>
                  ))}
                  {(!item.looking_for_price_ranges || item.looking_for_price_ranges.length === 0) && (
                    <div className="p-3 bg-muted rounded-md text-muted-foreground w-full">
                      No price ranges specified
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex justify-center">
          <Button 
            size="lg"
            onClick={() => toast.info('Trading functionality coming soon!')}
          >
            Interested in Trading
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default ItemDetails;
