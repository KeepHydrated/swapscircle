import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Eye, ExternalLink, AlertTriangle, User, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface ReportedItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string | null;
}

interface ItemData {
  id: string;
  name: string;
  description: string;
  image_url: string;
  image_urls: string[];
  category: string;
  condition: string;
  price_range_min: number;
  price_range_max: number;
  tags: string[];
  is_available: boolean;
  created_at: string;
  user_id: string;
  status: string;
}

interface UserProfile {
  username: string;
  name: string;
  avatar_url: string;
}

export const ReportedItemModal: React.FC<ReportedItemModalProps> = ({
  isOpen,
  onClose,
  itemId
}) => {
  const [item, setItem] = useState<ItemData | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (itemId && isOpen) {
      fetchItemData();
    }
  }, [itemId, isOpen]);

  const fetchItemData = async () => {
    if (!itemId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch item data
      const { data: itemData, error: itemError } = await supabase
        .from('items')
        .select('*')
        .eq('id', itemId)
        .maybeSingle();

      if (itemError) throw itemError;

      if (!itemData) {
        setError('Item not found or has been deleted');
        return;
      }

      setItem(itemData);

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username, name, avatar_url')
        .eq('id', itemData.user_id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        // Don't fail completely if profile fetch fails
      } else {
        setUserProfile(profileData);
      }

    } catch (error) {
      console.error('Error fetching item data:', error);
      setError('Failed to load item data');
      toast.error('Failed to load item data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (min: number, max: number) => {
    if (!min && !max) return 'Price not specified';
    if (min === max) return `$${min}`;
    return `$${min} - $${max}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'default';
      case 'draft': return 'secondary';
      case 'hidden': return 'destructive';
      default: return 'outline';
    }
  };

  if (!itemId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Reported Item Details
          </DialogTitle>
          <DialogDescription>
            Review the details of the reported item
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <div className="animate-pulse space-y-3">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Item</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : item ? (
          <div className="space-y-6">
            {/* Item Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {item.image_url && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Main Image</h4>
                  <img 
                    src={item.image_url} 
                    alt={item.name}
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
              )}
              
              {item.image_urls && item.image_urls.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Additional Images</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {item.image_urls.slice(0, 4).map((url, index) => (
                      <img 
                        key={index}
                        src={url} 
                        alt={`${item.name} ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Item Details */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{item.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={getStatusColor(item.status) as any}>
                        {item.status?.toUpperCase()}
                      </Badge>
                      <Badge variant={item.is_available ? 'default' : 'destructive'}>
                        {item.is_available ? 'Available' : 'Not Available'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">{formatPrice(item.price_range_min, item.price_range_max)}</p>
                    <p className="text-sm text-muted-foreground">Price Range</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Category & Condition</h4>
                    <div className="space-y-1">
                      <p><span className="font-medium">Category:</span> {item.category || 'Not specified'}</p>
                      <p><span className="font-medium">Condition:</span> {item.condition || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Dates</h4>
                    <div className="space-y-1">
                      <p className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">Posted:</span> 
                        {format(new Date(item.created_at), 'MMM d, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                </div>

                {item.description && (
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-muted-foreground bg-muted p-3 rounded">{item.description}</p>
                  </div>
                )}

                {item.tags && item.tags.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* User Information */}
            {userProfile && (
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Item Owner
                  </h4>
                  <div className="flex items-center gap-3">
                    {userProfile.avatar_url && (
                      <img 
                        src={userProfile.avatar_url} 
                        alt={userProfile.username}
                        className="w-10 h-10 rounded-full border"
                      />
                    )}
                    <div>
                      <p className="font-medium">{userProfile.name || userProfile.username}</p>
                      <p className="text-sm text-muted-foreground">@{userProfile.username}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};