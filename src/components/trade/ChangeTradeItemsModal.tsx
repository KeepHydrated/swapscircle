import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Check } from 'lucide-react';
import { Item } from '@/types/item';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { useQueryClient } from '@tanstack/react-query';

interface ChangeTradeItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  targetItemName: string;
  currentItemIds: string[];
}

const ChangeTradeItemsModal: React.FC<ChangeTradeItemsModalProps> = ({
  isOpen,
  onClose,
  conversationId,
  targetItemName,
  currentItemIds
}) => {
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const queryClient = useQueryClient();

  // Pre-select current items when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedItemIds(currentItemIds || []);
    }
  }, [isOpen, currentItemIds]);

  // Fetch user's items
  useEffect(() => {
    const fetchMyItems = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) {
          onClose();
          return;
        }

        const { data: items, error } = await supabase
          .from('items')
          .select('*')
          .eq('user_id', session.session.user.id)
          .eq('is_available', true)
          .eq('is_hidden', false)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching user items:', error);
          toast.error("Failed to load your items.");
          return;
        }

        const mappedItems: Item[] = (items || []).map(item => ({
          id: item.id,
          name: item.name,
          image: item.image_url || '/placeholder.svg',
          category: item.category,
          condition: item.condition,
          description: item.description,
          tags: item.tags
        }));

        setMyItems(mappedItems);
      } catch (error) {
        console.error('Error fetching items:', error);
        toast.error("Failed to load your items.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyItems();
  }, [isOpen, onClose]);

  const toggleItemSelection = (itemId: string) => {
    setSelectedItemIds(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleConfirmChange = async () => {
    if (selectedItemIds.length === 0) {
      toast.error("Please select at least one item to trade.");
      return;
    }

    // Check if selection has actually changed
    const sortedCurrent = [...currentItemIds].sort();
    const sortedNew = [...selectedItemIds].sort();
    if (JSON.stringify(sortedCurrent) === JSON.stringify(sortedNew)) {
      toast.info("No changes made to selected items.");
      onClose();
      return;
    }

    setUpdating(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        onClose();
        return;
      }

      // Update trade conversation with new items
      const { error: updateError } = await supabase
        .from('trade_conversations')
        .update({
          owner_item_id: selectedItemIds[0], // First item for backwards compatibility
          owner_item_ids: selectedItemIds, // All selected items (owner is changing their items)
          owner_accepted: false, // Reset acceptance since items changed
          requester_accepted: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      if (updateError) {
        console.error('Error updating trade:', updateError);
        toast.error("Failed to update trade items.");
        return;
      }

      // Add a message about the change
      const selectedItemNames = myItems
        .filter(item => selectedItemIds.includes(item.id))
        .map(item => item.name)
        .join(', ');
      
      const itemWord = selectedItemIds.length === 1 ? 'item' : 'items';
      const messageContent = `I've changed my offered ${itemWord} to: ${selectedItemNames}`;

      await supabase
        .from('trade_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: session.session.user.id,
          message: messageContent
        });

      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['trade-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['trade-messages'] });

      toast.success("Trade items updated successfully!");
      onClose();

    } catch (error) {
      console.error('Error updating trade:', error);
      toast.error("Failed to update trade items.");
    } finally {
      setUpdating(false);
    }
  };

  const selectedItems = myItems.filter(item => selectedItemIds.includes(item.id));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[80vh] flex flex-col p-0 overflow-hidden my-8">
        <DialogTitle className="sr-only">Change Trade Items</DialogTitle>
        <DialogDescription className="sr-only">
          Choose which of your items you want to offer instead for {targetItemName}
        </DialogDescription>

        {/* Header */}
        <div className="p-6 border-b border-border bg-background flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold mb-1">Change Your Offered Items</h2>
            <p className="text-muted-foreground">
              Select different items to offer for <span className="font-medium text-foreground">{targetItemName}</span>
            </p>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 pt-8 min-h-0">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : myItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">You don't have any items to trade.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
              {myItems.map((item) => {
                const isSelected = selectedItemIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={`relative cursor-pointer rounded-lg border-2 transition-all hover:shadow-md ${
                      isSelected
                        ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                        : 'border-border hover:border-border/80'
                    }`}
                    onClick={() => toggleItemSelection(item.id)}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center z-10">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <div className="aspect-square overflow-hidden rounded-t-lg bg-muted">
                      <img
                        src={item.image || '/placeholder.svg'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="p-3">
                      <h3 className="font-medium text-sm truncate">{item.name}</h3>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {myItems.length > 0 && (
          <div className="p-6 border-t border-border bg-muted/50 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div>
                {selectedItems.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Selected: <span className="font-medium text-foreground">
                      {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'}
                      {selectedItems.length <= 3 && ` (${selectedItems.map(i => i.name).join(', ')})`}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmChange}
                  disabled={selectedItemIds.length === 0 || updating}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-white font-medium px-6 py-2 rounded-lg transition-colors"
                >
                  {updating ? 'Updating...' : `Confirm Change${selectedItemIds.length > 0 ? ` (${selectedItemIds.length})` : ''}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChangeTradeItemsModal;
