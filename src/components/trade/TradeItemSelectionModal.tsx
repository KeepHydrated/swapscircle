
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Check } from 'lucide-react';
import { Item } from '@/types/item';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';

interface TradeItemSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetItem: Item | null;
  targetItemOwnerId?: string;
  preSelectedItemId?: string;
}

const TradeItemSelectionModal: React.FC<TradeItemSelectionModalProps> = ({
  isOpen,
  onClose,
  targetItem,
  targetItemOwnerId,
  preSelectedItemId
}) => {
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [theirItems, setTheirItems] = useState<Item[]>([]);
  const [selectedMyItemIds, setSelectedMyItemIds] = useState<string[]>([]);
  const [selectedTheirItemIds, setSelectedTheirItemIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'yours' | 'theirs'>('yours');
  const navigate = useNavigate();

  // Reset selection when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedMyItemIds([]);
      setSelectedTheirItemIds([]);
      setActiveTab('yours');
    } else {
      if (preSelectedItemId) {
        setSelectedMyItemIds([preSelectedItemId]);
      }
      if (targetItem?.id) {
        setSelectedTheirItemIds([targetItem.id]);
      }
    }
  }, [isOpen, preSelectedItemId, targetItem?.id]);

  // Fetch items
  useEffect(() => {
    const fetchItems = async () => {
      if (!isOpen || !targetItemOwnerId) return;
      
      setLoading(true);
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) {
          navigate('/auth');
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
          toast({ title: "Error", description: "Failed to load your items." });
          return;
        }

        // Fetch their items
        const { data: theirItemsData, error: theirError } = await supabase
          .from('items')
          .select('*')
          .eq('user_id', targetItemOwnerId)
          .eq('is_available', true)
          .eq('is_hidden', false)
          .order('created_at', { ascending: false });

        if (theirError) {
          console.error('Error fetching their items:', theirError);
          toast({ title: "Error", description: "Failed to load their items." });
          return;
        }

        const mapItems = (items: any[]): Item[] => items.map(item => ({
          id: item.id,
          name: item.name,
          image: item.image_url || '/placeholder.svg',
          category: item.category,
          condition: item.condition,
          description: item.description,
          tags: item.tags
        }));

        setMyItems(mapItems(myItemsData || []));
        setTheirItems(mapItems(theirItemsData || []));
      } catch (error) {
        console.error('Error fetching items:', error);
        toast({ title: "Error", description: "Failed to load items." });
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [isOpen, targetItemOwnerId]);

  const toggleMyItemSelection = (itemId: string) => {
    setSelectedMyItemIds(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const toggleTheirItemSelection = (itemId: string) => {
    setSelectedTheirItemIds(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const handleConfirmTrade = async () => {
    if (selectedMyItemIds.length === 0 || selectedTheirItemIds.length === 0 || !targetItemOwnerId) {
      toast({
        title: "Error",
        description: "Please select at least one item from each side.",
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

      // Create trade conversation
      const { data: tradeConversation, error: tradeError } = await supabase
        .from('trade_conversations')
        .insert({
          requester_id: session.session.user.id,
          owner_id: targetItemOwnerId,
          requester_item_id: selectedMyItemIds[0],
          requester_item_ids: selectedMyItemIds,
          owner_item_id: selectedTheirItemIds[0],
          owner_item_ids: selectedTheirItemIds,
          status: 'pending'
        })
        .select('*')
        .single();

      if (tradeError) {
        console.error('Error creating trade conversation:', tradeError);
        toast({ title: "Error", description: "Failed to create trade request." });
        return;
      }

      // Create initial message
      const myItemNames = myItems
        .filter(item => selectedMyItemIds.includes(item.id))
        .map(item => item.name)
        .join(', ');
      
      const theirItemNames = theirItems
        .filter(item => selectedTheirItemIds.includes(item.id))
        .map(item => item.name)
        .join(', ');
      
      const messageContent = `Hi! I'm interested in trading my ${myItemNames} for your ${theirItemNames}. Let me know if you're interested!`;

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
      navigate(`/messages?conversation=${tradeConversation.id}`);

    } catch (error) {
      console.error('Error creating trade:', error);
      toast({ title: "Error", description: "Failed to create trade request." });
    } finally {
      setCreating(false);
    }
  };

  const selectedMyItems = myItems.filter(item => selectedMyItemIds.includes(item.id));
  const selectedTheirItems = theirItems.filter(item => selectedTheirItemIds.includes(item.id));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[85vh] flex flex-col p-0 overflow-hidden my-4">
        <DialogTitle className="sr-only">Select Items to Trade</DialogTitle>
        <DialogDescription className="sr-only">
          Choose which items you want to trade
        </DialogDescription>

        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-border bg-background flex-shrink-0 space-y-4">
          <h2 className="text-xl font-semibold">Suggest Trade</h2>
          
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

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : activeTab === 'yours' ? (
            <>
              <p className="text-muted-foreground text-sm mb-4">Select items you want to offer</p>
              {myItems.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-12">You don't have any items to trade.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                  {[...myItems].sort((a, b) => {
                    const aSelected = selectedMyItemIds.includes(a.id);
                    const bSelected = selectedMyItemIds.includes(b.id);
                    if (aSelected && !bSelected) return -1;
                    if (!aSelected && bSelected) return 1;
                    return 0;
                  }).map((item) => {
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
                          <img src={item.image || '/placeholder.svg'} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-2">
                          <h4 className="font-medium text-xs truncate">{item.name}</h4>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-muted-foreground text-sm mb-4">Select items you want in return</p>
              {theirItems.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-12">They don't have any items available.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                  {[...theirItems].sort((a, b) => {
                    const aSelected = selectedTheirItemIds.includes(a.id);
                    const bSelected = selectedTheirItemIds.includes(b.id);
                    if (aSelected && !bSelected) return -1;
                    if (!aSelected && bSelected) return 1;
                    return 0;
                  }).map((item) => {
                    const isSelected = selectedTheirItemIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`relative cursor-pointer rounded-lg border-2 transition-all hover:shadow-md ${
                          isSelected
                            ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                            : 'border-border hover:border-border/80'
                        }`}
                        onClick={() => toggleTheirItemSelection(item.id)}
                      >
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center z-10">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <div className="aspect-square overflow-hidden rounded-t-md bg-muted">
                          <img src={item.image || '/placeholder.svg'} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-2">
                          <h4 className="font-medium text-xs truncate">{item.name}</h4>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
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
                onClick={handleConfirmTrade}
                disabled={selectedMyItemIds.length === 0 || selectedTheirItemIds.length === 0 || creating}
                className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-white font-medium px-6 py-2 rounded-lg transition-colors"
              >
                {creating ? 'Sending...' : 'Suggest Trade'}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TradeItemSelectionModal;
