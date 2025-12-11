import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface HiddenItem {
  id: string;
  item_id: string;
  item: {
    id: string;
    name: string;
    image_url: string | null;
    category: string | null;
    condition: string | null;
  } | null;
}

const HiddenItemsSettings: React.FC = () => {
  const { user } = useAuth();
  const [hiddenItems, setHiddenItems] = useState<HiddenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unhidingId, setUnhidingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchHiddenItems();
    }
  }, [user]);

  const fetchHiddenItems = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rejections')
        .select(`
          id,
          item_id,
          item:items (
            id,
            name,
            image_url,
            category,
            condition
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching hidden items:', error);
        return;
      }

      // Filter out items that no longer exist
      const validItems = (data || []).filter(item => item.item !== null);
      setHiddenItems(validItems as HiddenItem[]);
    } catch (error) {
      console.error('Error fetching hidden items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnhide = async (rejectionId: string, itemName: string) => {
    setUnhidingId(rejectionId);
    try {
      const { error } = await supabase
        .from('rejections')
        .delete()
        .eq('id', rejectionId);

      if (error) {
        console.error('Error unhiding item:', error);
        toast({
          title: "Error",
          description: "Failed to unhide item. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setHiddenItems(prev => prev.filter(item => item.id !== rejectionId));
      toast({
        title: "Item unhidden",
        description: `"${itemName}" will now appear in your matches again.`,
      });
    } catch (error) {
      console.error('Error unhiding item:', error);
    } finally {
      setUnhidingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Hidden Items</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Items you've chosen not to see again. You can unhide them to see them in your matches.
        </p>
      </div>

      {hiddenItems.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>You haven't hidden any items yet.</p>
          <p className="text-sm mt-1">Items you hide will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {hiddenItems.map((hidden) => (
            <div
              key={hidden.id}
              className="flex items-center gap-4 p-4 border rounded-lg bg-background"
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                {hidden.item?.image_url ? (
                  <img
                    src={hidden.item.image_url}
                    alt={hidden.item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    No image
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">
                  {hidden.item?.name || 'Unknown Item'}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  {hidden.item?.category && <span>{hidden.item.category}</span>}
                  {hidden.item?.category && hidden.item?.condition && <span>•</span>}
                  {hidden.item?.condition && <span>{hidden.item.condition}</span>}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUnhide(hidden.id, hidden.item?.name || 'Item')}
                disabled={unhidingId === hidden.id}
              >
                {unhidingId === hidden.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Unhide
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HiddenItemsSettings;
