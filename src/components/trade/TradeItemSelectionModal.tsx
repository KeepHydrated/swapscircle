
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
}

const TradeItemSelectionModal: React.FC<TradeItemSelectionModalProps> = ({
  isOpen,
  onClose,
  targetItem,
  targetItemOwnerId
}) => {
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

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
          .eq('is_available', true) // Only show available items
          .eq('is_hidden', false) // Only show non-hidden items
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching user items:', error);
          toast({
            title: "Error",
            description: "Failed to load your items.",
          });
          return;
        }

        // Map database items to Item type
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

  const handleConfirmTrade = async () => {
    if (!selectedItemId || !targetItem || !targetItemOwnerId) {
      toast({
        title: "Error",
        description: "Please select an item to trade.",
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
          requester_item_id: selectedItemId,
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

      // Create initial message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: tradeConversation.id,
          sender_id: session.session.user.id,
          content: `Hi! I'm interested in trading my item for your ${targetItem.name}. Let me know if you're interested!`,
          message_type: 'text'
        });

      if (messageError) {
        console.error('Error creating initial message:', messageError);
      }

      toast({
        title: "Trade suggestion sent!",
        description: "Your trade suggestion has been sent successfully.",
      });

      onClose();
      
      // Navigate to trade requests page
      navigate('/trade-requests');

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

  const selectedItem = myItems.find(item => item.id === selectedItemId);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[80vh] flex flex-col p-0 overflow-hidden my-8">
        <DialogTitle className="sr-only">Select Item to Trade</DialogTitle>
        <DialogDescription className="sr-only">
          Choose which of your items you want to trade for {targetItem?.name}
        </DialogDescription>

        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
          
          <div className="flex items-start gap-4">
            {/* Target item thumbnail */}
            {targetItem?.image && (
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                <img 
                  src={targetItem.image} 
                  alt={targetItem.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold mb-1">Select Item to Trade</h2>
              <p className="text-gray-600">
                Choose which of your items you want to trade for <span className="font-medium">{targetItem?.name}</span>
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
              <p className="text-gray-500">You don't have any items to trade yet.</p>
              <p className="text-sm text-gray-400 mt-2">Post some items first to start trading!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
              {myItems.map((item) => (
                <div
                  key={item.id}
                  className={`relative cursor-pointer rounded-lg border-2 transition-all hover:shadow-md ${
                    selectedItemId === item.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedItemId(item.id)}
                >
                  {selectedItemId === item.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center z-10">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className="aspect-square overflow-hidden rounded-t-lg bg-gray-100">
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
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {myItems.length > 0 && (
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div>
                {selectedItem && (
                  <div className="text-sm text-gray-600">
                    Selected: <span className="font-medium">{selectedItem.name}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmTrade}
                  disabled={!selectedItemId || creating}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-6 py-2 rounded-lg transition-colors"
                >
                  {creating ? 'Sending...' : 'Suggest'}
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
