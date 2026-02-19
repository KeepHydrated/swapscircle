
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X, Check } from 'lucide-react';
import { Item } from '@/types/item';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';

interface TradeItemSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetItem: Item | null;
  targetItemOwnerId?: string;
  preSelectedItemId?: string; // Pre-select a specific item (e.g., matched item)
}

const TradeItemSelectionModal: React.FC<TradeItemSelectionModalProps> = ({
  isOpen,
  onClose,
  targetItem,
  targetItemOwnerId,
  preSelectedItemId
}) => {
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [resolvedOwnerId, setResolvedOwnerId] = useState<string | undefined>(targetItemOwnerId);
  const navigate = useNavigate();

  // Reset selection when modal opens/closes, pre-select if provided
  useEffect(() => {
    if (!isOpen) {
      setSelectedItemIds([]);
      setResolvedOwnerId(undefined);
    } else {
      if (preSelectedItemId) {
        setSelectedItemIds([preSelectedItemId]);
      }
      // Validate UUID format helper
      const isValidUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      // Set or resolve owner ID - always validate UUID format
      const providedOwnerId = targetItemOwnerId || targetItem?.user_id;
      if (providedOwnerId && isValidUuid(providedOwnerId)) {
        setResolvedOwnerId(providedOwnerId);
      } else if (targetItem?.id && isValidUuid(targetItem.id)) {
        // Fetch owner from database if not provided
        const fetchOwner = async () => {
          const { data } = await supabase
            .from('items')
            .select('user_id')
            .eq('id', targetItem.id)
            .maybeSingle();
          if (data?.user_id) {
            setResolvedOwnerId(data.user_id);
          } else {
            // Use a mock owner ID for demo/mock items
            console.warn('Using mock owner for item:', targetItem.id);
            setResolvedOwnerId('00000000-0000-0000-0000-000000000001');
          }
        };
        fetchOwner();
      } else {
        // Fallback mock owner for non-UUID demo items
        console.warn('Using mock owner fallback for item:', targetItem?.id);
        setResolvedOwnerId('00000000-0000-0000-0000-000000000001');
      }
    }
  }, [isOpen, preSelectedItemId, targetItemOwnerId, targetItem?.id]);

  // Fetch user's items
  useEffect(() => {
    const fetchMyItems = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) {
          navigate('/auth');
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
          toast({
            title: "Error",
            description: "Failed to load your items.",
          });
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
        toast({
          title: "Error",
          description: "Failed to load your items.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMyItems();
  }, [isOpen]);

  const toggleItemSelection = (itemId: string) => {
    setSelectedItemIds(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleConfirmTrade = async () => {
    if (selectedItemIds.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one item to trade.",
      });
      return;
    }

    const isValidUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (!targetItem || !resolvedOwnerId) {
      toast({
        title: "Error",
        description: "Could not determine the item owner. Please try again.",
      });
      return;
    }

    // Validate all IDs are proper UUIDs before inserting
    if (!isValidUuid(resolvedOwnerId) || !isValidUuid(targetItem.id) || selectedItemIds.some(id => !isValidUuid(id))) {
      toast({
        title: "Error",
        description: "This item is from demo data and cannot be traded. Try trading with real items from other users.",
      });
      return;
    }

    setCreating(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        navigate('/auth');
        onClose();
        return;
      }

      // Create trade conversation with multiple items
      const { data: tradeConversation, error: tradeError } = await supabase
        .from('trade_conversations')
        .insert({
          requester_id: session.session.user.id,
          owner_id: resolvedOwnerId,
          requester_item_id: selectedItemIds[0], // First item for backwards compatibility
          requester_item_ids: selectedItemIds, // All selected items
          owner_item_id: targetItem.id,
          status: 'pending'
        })
        .select('*')
        .single();

      if (tradeError) {
        console.error('Error creating trade conversation:', tradeError);
        toast({
          title: "Error",
          description: "Failed to create trade request.",
        });
        return;
      }

      // Create initial message in trade_messages table
      const selectedItemNames = myItems
        .filter(item => selectedItemIds.includes(item.id))
        .map(item => item.name)
        .join(', ');
      
      const itemWord = selectedItemIds.length === 1 ? 'item' : 'items';
      const messageContent = `Hi! I'm interested in trading my ${itemWord} (${selectedItemNames}) for your ${targetItem.name}. Let me know if you're interested!`;

      const { error: messageError } = await supabase
        .from('trade_messages')
        .insert({
          conversation_id: tradeConversation.id,
          sender_id: session.session.user.id,
          message: messageContent
        });

      if (messageError) {
        console.error('Error creating initial message:', messageError);
      }

      toast({
        title: "Trade suggestion sent!",
        description: "Your trade suggestion has been sent successfully.",
      });

      onClose();
      // Navigate to messages page with the new conversation selected
      navigate(`/messages?conversation=${tradeConversation.id}`);

    } catch (error) {
      console.error('Error creating trade:', error);
      toast({
        title: "Error",
        description: "Failed to create trade request.",
      });
    } finally {
      setCreating(false);
    }
  };

  const selectedItems = myItems.filter(item => selectedItemIds.includes(item.id));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[80vh] flex flex-col p-0 overflow-hidden my-8">
        <DialogTitle className="sr-only">Select Items to Trade</DialogTitle>
        <DialogDescription className="sr-only">
          Choose which of your items you want to trade for {targetItem?.name}
        </DialogDescription>

        {/* Header */}
        <div className="p-6 border-b border-border bg-background flex-shrink-0">
          
          <div className="flex items-start gap-4">
            {targetItem?.image && (
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-border">
                <img 
                  src={targetItem.image} 
                  alt={targetItem.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold mb-1">Select Items to Trade</h2>
              <p className="text-muted-foreground">
                Choose one or more items to trade for <span className="font-medium text-foreground">{targetItem?.name}</span>
              </p>
            </div>
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
              <p className="text-muted-foreground">You don't have any items to trade yet.</p>
              <p className="text-sm text-muted-foreground/70 mt-2">Post some items first to start trading!</p>
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
                  onClick={handleConfirmTrade}
                  disabled={selectedItemIds.length === 0 || creating}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-white font-medium px-6 py-2 rounded-lg transition-colors"
                >
                  {creating ? 'Sending...' : `Suggest${selectedItemIds.length > 0 ? ` (${selectedItemIds.length})` : ''}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TradeItemSelectionModal;
