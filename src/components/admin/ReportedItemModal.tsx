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
            {/* Item layout: Image left, details right */}
            <div className="flex gap-6">
              {/* Item Image */}
              <div className="w-24 h-24 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex-shrink-0">
                {item.image_url ? (
                  <img 
                    src={item.image_url} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-xs">No image</span>
                  </div>
                )}
              </div>

              {/* Title and Description on the right */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
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

                {item.description && (
                  <div>
                    <p className="text-gray-700 leading-relaxed">{item.description}</p>
                  </div>
                )}
              </div>
            </div>

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