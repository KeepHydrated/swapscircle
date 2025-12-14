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
  partnerId: string;
  currentMyItemIds: string[];
  currentTheirItemIds?: string[];
}

const ChangeTradeItemsModal: React.FC<ChangeTradeItemsModalProps> = ({
  isOpen,
  onClose,
  conversationId,
  partnerId,
  currentMyItemIds,
  currentTheirItemIds
}) => {
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [theirItems, setTheirItems] = useState<Item[]>([]);
  const [selectedMyItemIds, setSelectedMyItemIds] = useState<string[]>([]);
  const [selectedTheirItemIds, setSelectedTheirItemIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'yours' | 'theirs'>('yours');
  const queryClient = useQueryClient();

  // Pre-select current items when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedMyItemIds(currentMyItemIds || []);
      setSelectedTheirItemIds(currentTheirItemIds || []);
      setActiveTab('yours');
    }
  }, [isOpen, currentMyItemIds, currentTheirItemIds]);

  // Fetch both users' items
  useEffect(() => {
    const fetchItems = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) {
          onClose();
          return;
        }

        // Fetch my items
        const { data: myItemsData, error: myError } = await supabase
          .from('items')
          .select('*')
          .eq('user_id', session.session.user.id)
          .eq('is_available', true)
          .eq('is_hidden', false)
          .order('created_at', { ascending: false });

        if (myError) {
          console.error('Error fetching my items:', myError);
          toast.error("Failed to load your items.");
          return;
        }

        // Fetch their items
        const { data: theirItemsData, error: theirError } = await supabase
          .from('items')
          .select('*')
          .eq('user_id', partnerId)
          .eq('is_available', true)
          .eq('is_hidden', false)
          .order('created_at', { ascending: false });

        if (theirError) {
          console.error('Error fetching their items:', theirError);
          toast.error("Failed to load their items.");
          return;
        }

        const mapItems = (items: any[]): Item[] => (items || []).map(item => ({
          id: item.id,
          name: item.name,
          image: item.image_url || '/placeholder.svg',
          category: item.category,
          condition: item.condition,
          description: item.description,
          tags: item.tags
        }));

        setMyItems(mapItems(myItemsData));
        setTheirItems(mapItems(theirItemsData));
      } catch (error) {
        console.error('Error fetching items:', error);
        toast.error("Failed to load items.");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [isOpen, partnerId, onClose]);

  const toggleMyItemSelection = (itemId: string) => {
    setSelectedMyItemIds(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const toggleTheirItemSelection = (itemId: string) => {
    setSelectedTheirItemIds(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleConfirmChange = async () => {
    if (selectedMyItemIds.length === 0) {
      toast.error("Please select at least one of your items to offer.");
      return;
    }

    if (selectedTheirItemIds.length === 0) {
      toast.error("Please select at least one item you want from them.");
      return;
    }

    // Check if selection has actually changed
    const sortedCurrentMy = [...(currentMyItemIds || [])].sort();
    const sortedNewMy = [...selectedMyItemIds].sort();
    const sortedCurrentTheir = [...(currentTheirItemIds || [])].sort();
    const sortedNewTheir = [...selectedTheirItemIds].sort();
    const myItemsChanged = JSON.stringify(sortedCurrentMy) !== JSON.stringify(sortedNewMy);
    const theirItemsChanged = JSON.stringify(sortedCurrentTheir) !== JSON.stringify(sortedNewTheir);

    if (!myItemsChanged && !theirItemsChanged) {
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

      // Get current trade to understand roles
      const { data: trade } = await supabase
        .from('trade_conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (!trade) {
        toast.error("Trade not found.");
        return;
      }

      const isRequester = trade.requester_id === session.session.user.id;

      // Update trade based on role
      let updateData: any = {
        updated_at: new Date().toISOString(),
        requester_accepted: false,
        owner_accepted: false,
      };

      if (isRequester) {
        // Requester is changing their offered items and what they want
        updateData.requester_item_id = selectedMyItemIds[0];
        updateData.requester_item_ids = selectedMyItemIds;
        updateData.owner_item_id = selectedTheirItemIds[0];
        updateData.owner_item_ids = selectedTheirItemIds;
      } else {
        // Owner is counter-proposing: offering their items, wanting requester's items
        updateData.owner_item_id = selectedMyItemIds[0];
        updateData.owner_item_ids = selectedMyItemIds;
        updateData.requester_item_id = selectedTheirItemIds[0];
        updateData.requester_item_ids = selectedTheirItemIds;
      }

      const { error: updateError } = await supabase
        .from('trade_conversations')
        .update(updateData)
        .eq('id', conversationId);

      if (updateError) {
        console.error('Error updating trade:', updateError);
        toast.error("Failed to update trade items.");
        return;
      }

      // Add a message about the change
      const mySelectedNames = myItems
        .filter(item => selectedMyItemIds.includes(item.id))
        .map(item => item.name)
        .join(', ');
      
      const theirSelectedNames = theirItems
        .filter(item => selectedTheirItemIds.includes(item.id))
        .map(item => item.name)
        .join(', ');
      
      const messageContent = `I've updated the trade: offering ${mySelectedNames} for ${theirSelectedNames}`;

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

      toast.success("Trade updated successfully!");
      onClose();

    } catch (error) {
      console.error('Error updating trade:', error);
      toast.error("Failed to update trade items.");
    } finally {
      setUpdating(false);
    }
  };

  const selectedMyItems = myItems.filter(item => selectedMyItemIds.includes(item.id));
  const selectedTheirItems = theirItems.filter(item => selectedTheirItemIds.includes(item.id));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[85vh] flex flex-col p-0 overflow-hidden my-4">
        <DialogTitle className="sr-only">Change Trade Items</DialogTitle>
        <DialogDescription className="sr-only">
          Select which items you want to offer and which items you want in return
        </DialogDescription>

        {/* Header with Tabs */}
        <div className="p-4 sm:p-6 border-b border-border bg-background flex-shrink-0">
          <h2 className="text-xl font-semibold mb-4">Change Trade</h2>
          
          {/* Tab Menu */}
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setActiveTab('yours')}
              className={`flex-1 h-9 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === 'yours' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Your Items
              {selectedMyItemIds.length > 0 && (
                <span className={`text-xs min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center ${
                  activeTab === 'yours' 
                    ? 'bg-foreground text-background' 
                    : 'bg-muted-foreground/30 text-muted-foreground'
                }`}>
                  {selectedMyItemIds.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('theirs')}
              className={`flex-1 h-9 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === 'theirs' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Their Items
              {selectedTheirItemIds.length > 0 && (
                <span className={`text-xs min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center ${
                  activeTab === 'theirs' 
                    ? 'bg-foreground text-background' 
                    : 'bg-muted-foreground/30 text-muted-foreground'
                }`}>
                  {selectedTheirItemIds.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : activeTab === 'yours' ? (
            <div>
              <p className="text-sm text-muted-foreground mb-4">Select items you want to offer</p>
              {myItems.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-12">You don't have any items to trade.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                  {myItems.map((item) => {
                    const isSelected = selectedMyItemIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`relative cursor-pointer rounded-lg border-2 transition-all hover:shadow-md ${
                          isSelected
                            ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                            : 'border-border hover:border-border/80'
                        }`}
                        onClick={() => toggleMyItemSelection(item.id)}
                      >
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center z-10">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        
                        <div className="aspect-square overflow-hidden rounded-t-md bg-muted">
                          <img
                            src={item.image || '/placeholder.svg'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="p-2">
                          <h4 className="font-medium text-xs truncate">{item.name}</h4>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground mb-4">Select items you want from them</p>
              {theirItems.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-12">They don't have any available items.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                  {theirItems.map((item) => {
                    const isSelected = selectedTheirItemIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`relative cursor-pointer rounded-lg border-2 transition-all hover:shadow-md ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                            : 'border-border hover:border-border/80'
                        }`}
                        onClick={() => toggleTheirItemSelection(item.id)}
                      >
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center z-10">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        
                        <div className="aspect-square overflow-hidden rounded-t-md bg-muted">
                          <img
                            src={item.image || '/placeholder.svg'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="p-2">
                          <h4 className="font-medium text-xs truncate">{item.name}</h4>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-border bg-muted/50 flex-shrink-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="text-sm text-muted-foreground">
              {selectedMyItems.length > 0 && (
                <span>
                  Offering: <span className="font-medium text-foreground">
                    {selectedMyItems.length === 1 
                      ? selectedMyItems[0].name 
                      : `${selectedMyItems.length} items`}
                  </span>
                </span>
              )}
              {selectedMyItems.length > 0 && selectedTheirItems.length > 0 && <span className="mx-2">→</span>}
              {selectedTheirItems.length > 0 && (
                <span>
                  For: <span className="font-medium text-foreground">
                    {selectedTheirItems.length === 1 
                      ? selectedTheirItems[0].name 
                      : `${selectedTheirItems.length} items`}
                  </span>
                </span>
              )}
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmChange}
                disabled={selectedMyItemIds.length === 0 || selectedTheirItemIds.length === 0 || updating}
                className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-white font-medium px-6 py-2 rounded-lg transition-colors"
              >
                {updating ? 'Updating...' : 'Confirm Change'}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeTradeItemsModal;
