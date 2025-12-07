import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ArrowLeftRight, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import ExploreItemModal from '@/components/items/ExploreItemModal';
import { toast } from '@/hooks/use-toast';

interface TradeSuggestion {
  id: string;
  requester_id: string;
  owner_id: string;
  requester_item_id: string;
  owner_item_id: string;
  status: string;
  created_at: string;
  requester_item: any;
  owner_item: any;
  requester_profile: any;
  owner_profile: any;
}

const TradeSuggestions = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'received' | 'sent'>('all');

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Fetch pending trade suggestions
  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['trade-suggestions', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];

      const { data, error } = await supabase
        .from('trade_conversations')
        .select(`
          *,
          requester_item:items!trade_conversations_requester_item_id_fkey(*),
          owner_item:items!trade_conversations_owner_item_id_fkey(*),
          requester_profile:profiles!trade_conversations_requester_id_fkey(*),
          owner_profile:profiles!trade_conversations_owner_id_fkey(*)
        `)
        .or(`requester_id.eq.${currentUser.id},owner_id.eq.${currentUser.id}`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching trade suggestions:', error);
        return [];
      }

      return data as TradeSuggestion[];
    },
    enabled: !!currentUser?.id,
  });

  const sentSuggestions = suggestions.filter(s => s.requester_id === currentUser?.id);
  const receivedSuggestions = suggestions.filter(s => s.owner_id === currentUser?.id);

  const getItemImage = (item: any) => {
    const urls = item?.image_urls as string[] | undefined;
    return item?.image_url || (Array.isArray(urls) && urls.length > 0 ? urls[0] : '/placeholder.svg');
  };

  const handleOpenChat = (tradeId: string) => {
    navigate(`/messages?conversation=${tradeId}`);
  };

  const handleProfileClick = (userId: string) => {
    navigate(`/other-person-profile?userId=${userId}`);
  };

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setShowItemModal(true);
  };

  const handleAcceptTrade = async (tradeId: string) => {
    setProcessingId(tradeId);
    try {
      const { error } = await supabase
        .from('trade_conversations')
        .update({ 
          owner_accepted: true,
          status: 'accepted'
        })
        .eq('id', tradeId);

      if (error) throw error;

      toast({
        title: "Trade accepted!",
        description: "You've accepted this trade suggestion.",
      });

      queryClient.invalidateQueries({ queryKey: ['trade-suggestions'] });
    } catch (error) {
      console.error('Error accepting trade:', error);
      toast({
        title: "Error",
        description: "Failed to accept trade.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeclineTrade = async (tradeId: string) => {
    setProcessingId(tradeId);
    try {
      const { error } = await supabase
        .from('trade_conversations')
        .update({ status: 'rejected' })
        .eq('id', tradeId);

      if (error) throw error;

      toast({
        title: "Trade declined",
        description: "You've declined this trade suggestion.",
      });

      queryClient.invalidateQueries({ queryKey: ['trade-suggestions'] });
    } catch (error) {
      console.error('Error declining trade:', error);
      toast({
        title: "Error",
        description: "Failed to decline trade.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelTrade = async (tradeId: string) => {
    setProcessingId(tradeId);
    try {
      const { error } = await supabase
        .from('trade_conversations')
        .update({ status: 'cancelled' })
        .eq('id', tradeId);

      if (error) throw error;

      toast({
        title: "Trade cancelled",
        description: "Your trade suggestion has been cancelled.",
      });

      queryClient.invalidateQueries({ queryKey: ['trade-suggestions'] });
    } catch (error) {
      console.error('Error cancelling trade:', error);
      toast({
        title: "Error",
        description: "Failed to cancel trade.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const renderSuggestionCard = (suggestion: TradeSuggestion, type: 'sent' | 'received') => {
    const otherUser = type === 'sent' ? suggestion.owner_profile : suggestion.requester_profile;
    const theirItem = type === 'sent' ? suggestion.owner_item : suggestion.requester_item;

    return (
      <Card key={suggestion.id} className="overflow-hidden">
        <div className="relative">
          <img 
            src={getItemImage(theirItem)} 
            alt={theirItem?.name || 'Item'}
            loading="lazy"
            className="w-full aspect-square object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => handleItemClick(theirItem)}
          />
          {/* Action buttons overlay */}
          <div className="absolute top-3 right-3 flex gap-2">
            {type === 'received' ? (
              <>
                <Button 
                  size="icon"
                  variant="outline"
                  className="h-9 w-9 rounded-full bg-white/90 hover:bg-white border-0"
                  onClick={() => handleDeclineTrade(suggestion.id)}
                  disabled={processingId === suggestion.id}
                >
                  <X className="w-4 h-4 text-red-500" />
                </Button>
                <Button 
                  size="icon"
                  className="h-9 w-9 rounded-full bg-green-500 hover:bg-green-600 border-0"
                  onClick={() => handleAcceptTrade(suggestion.id)}
                  disabled={processingId === suggestion.id}
                >
                  <Check className="w-4 h-4 text-white" />
                </Button>
              </>
            ) : (
              <Button 
                size="icon"
                variant="outline"
                className="h-9 w-9 rounded-full bg-white/90 hover:bg-white border-0"
                onClick={() => handleCancelTrade(suggestion.id)}
                disabled={processingId === suggestion.id}
              >
                <X className="w-4 h-4 text-red-500" />
              </Button>
            )}
          </div>
        </div>
        <CardContent className="p-3">
          <h3 
            className="font-medium text-foreground truncate cursor-pointer hover:text-primary"
            onClick={() => handleItemClick(theirItem)}
          >
            {theirItem?.name || 'Unknown Item'}
          </h3>
          <div 
            className="flex items-center gap-2 mt-1 cursor-pointer"
            onClick={() => otherUser?.id && handleProfileClick(otherUser.id)}
          >
            <Avatar className="h-5 w-5">
              <AvatarImage src={otherUser?.avatar_url} />
              <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                {otherUser?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground hover:text-foreground">
              {otherUser?.username || 'Unknown'}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading trade suggestions...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto">

        <div className="mb-6 flex justify-end">
          <Select value={filter} onValueChange={(value: 'all' | 'received' | 'sent') => setFilter(value)}>
            <SelectTrigger className="w-40 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background">
              <SelectItem value="all">All ({suggestions.length})</SelectItem>
              <SelectItem value="received">Received ({receivedSuggestions.length})</SelectItem>
              <SelectItem value="sent">Sent ({sentSuggestions.length})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(() => {
          const displaySuggestions = filter === 'all' 
            ? suggestions 
            : filter === 'received' 
              ? receivedSuggestions 
              : sentSuggestions;
          
          if (displaySuggestions.length === 0) {
            return (
              <Card>
                <CardContent className="p-8 text-center">
                  <h3 className="text-lg font-medium text-foreground mb-2">No trade requests</h3>
                  <p className="text-muted-foreground">
                    {filter === 'received' 
                      ? "When someone suggests a trade with you, it will appear here."
                      : filter === 'sent'
                        ? "Trade suggestions you send will appear here."
                        : "No pending trade requests."}
                  </p>
                </CardContent>
              </Card>
            );
          }
          
          return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {displaySuggestions.map(suggestion => 
                renderSuggestionCard(
                  suggestion, 
                  suggestion.requester_id === currentUser?.id ? 'sent' : 'received'
                )
              )}
            </div>
          );
        })()}

        {/* Item Modal */}
        {showItemModal && selectedItem && (
          <ExploreItemModal
            open={showItemModal}
            item={selectedItem}
            onClose={() => {
              setShowItemModal(false);
              setSelectedItem(null);
            }}
            disableActions={true}
            hideActions={false}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default TradeSuggestions;
