import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ArrowLeftRight, Check, X, Send, Inbox } from 'lucide-react';
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
    const yourItem = type === 'sent' ? suggestion.requester_item : suggestion.owner_item;

    return (
      <Card key={suggestion.id} className="overflow-hidden">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar 
                className="h-10 w-10 cursor-pointer hover:opacity-80"
                onClick={() => otherUser?.id && handleProfileClick(otherUser.id)}
              >
                <AvatarImage src={otherUser?.avatar_url} />
                <AvatarFallback className="bg-gray-200 text-gray-600">
                  {otherUser?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <span 
                  className="font-medium text-foreground cursor-pointer hover:text-primary"
                  onClick={() => otherUser?.id && handleProfileClick(otherUser.id)}
                >
                  {otherUser?.username || 'Unknown User'}
                </span>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(suggestion.created_at), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              Pending
            </Badge>
          </div>

          {/* Trade Items */}
          <div className="flex items-center justify-center gap-4 md:gap-6 mb-4">
            {/* Their Item */}
            <div className="flex flex-col items-center">
              <div className="text-xs text-muted-foreground mb-1">
                {type === 'sent' ? 'They have' : 'They offer'}
              </div>
              <img 
                src={getItemImage(theirItem)} 
                alt={theirItem?.name || 'Item'}
                loading="lazy"
                className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleItemClick(theirItem)}
              />
              <span className="text-sm font-medium text-foreground text-center max-w-20 md:max-w-24 truncate mt-2">
                {theirItem?.name || 'Unknown Item'}
              </span>
            </div>
            
            {/* Exchange Arrow */}
            <div className="flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground" />
            </div>
            
            {/* Your Item */}
            <div className="flex flex-col items-center">
              <div className="text-xs text-muted-foreground mb-1">
                {type === 'sent' ? 'You offer' : 'They want'}
              </div>
              <img 
                src={getItemImage(yourItem)} 
                alt={yourItem?.name || 'Item'}
                loading="lazy"
                className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleItemClick(yourItem)}
              />
              <span className="text-sm font-medium text-foreground text-center max-w-20 md:max-w-24 truncate mt-2">
                {yourItem?.name || 'Unknown Item'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            {type === 'received' ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  onClick={() => handleDeclineTrade(suggestion.id)}
                  disabled={processingId === suggestion.id}
                >
                  <X className="w-4 h-4 mr-1" />
                  Decline
                </Button>
                <Button 
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handleAcceptTrade(suggestion.id)}
                  disabled={processingId === suggestion.id}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Accept
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1"
                onClick={() => handleCancelTrade(suggestion.id)}
                disabled={processingId === suggestion.id}
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleOpenChat(suggestion.id)}
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
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

        <Tabs defaultValue="received" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="received" className="flex items-center gap-2">
              <Inbox className="w-4 h-4" />
              Received ({receivedSuggestions.length})
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Sent ({sentSuggestions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received">
            {receivedSuggestions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Inbox className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No received suggestions</h3>
                  <p className="text-muted-foreground">When someone suggests a trade with you, it will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {receivedSuggestions.map(suggestion => renderSuggestionCard(suggestion, 'received'))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent">
            {sentSuggestions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Send className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No sent suggestions</h3>
                  <p className="text-muted-foreground">Trade suggestions you send will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {sentSuggestions.map(suggestion => renderSuggestionCard(suggestion, 'sent'))}
              </div>
            )}
          </TabsContent>
        </Tabs>

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
