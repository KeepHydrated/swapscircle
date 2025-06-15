
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
          toast({
            title: "Authentication required",
            description: "Please log in to view your items.",
          });
          return;
        }

        const { data: items, error } = await supabase
          .from('items')
          .select('*')
          .eq('user_id', session.session.user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching user items:', error);
          toast({
            title: "Error",
            description: "Failed to load your items.",
          });
          return;
        }

        setMyItems(items || []);
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
        toast({
          title: "Authentication required",
          description: "Please log in to create a trade request.",
        });
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
        .from('trade_messages')
        .insert({
          trade_conversation_id: tradeConversation.id,
          sender_id: session.session.user.id,
          message: `Hi! I'm interested in trading my item for your ${targetItem.name}. Let me know if you're interested!`
        });

      if (messageError) {
        console.error('Error creating initial message:', messageError);
      }

      toast({
        title: "Trade request sent!",
        description: "Your trade request has been sent successfully.",
      });

      onClose();
      
      // Navigate to messages page with the trade conversation
      navigate('/messages', { 
        state: { 
          tradeConversationId: tradeConversation.id,
          newTrade: true 
        } 
      });

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
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] p-0 overflow-hidden">
        <DialogTitle className="sr-only">Select Item to Trade</DialogTitle>
        <DialogDescription className="sr-only">
          Choose which of your items you want to trade for {targetItem?.name}
        </DialogDescription>

        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
          
          <h2 className="text-xl font-semibold mb-2">Select Item to Trade</h2>
          <p className="text-gray-600">
            Choose which of your items you want to trade for <span className="font-medium">{targetItem?.name}</span>
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                      src={item.image || item.image_url || '/placeholder.svg'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="p-3">
                    <h3 className="font-medium text-sm truncate">{item.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {item.description || 'No description'}
                    </p>
                    {item.condition && (
                      <div className="mt-2">
                        <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                          {item.condition}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {myItems.length > 0 && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
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
                  {creating ? 'Creating Trade...' : 'Confirm Trade'}
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
