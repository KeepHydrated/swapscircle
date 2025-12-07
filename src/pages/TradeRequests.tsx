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
import { MessageCircle, ArrowLeftRight, Check, X, Star } from 'lucide-react';
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

  // Mock data for preview
  const mockSuggestions: TradeSuggestion[] = [
    {
      id: 'mock-1',
      requester_id: 'other-user',
      owner_id: currentUser?.id || '',
      requester_item_id: 'mock-item-1',
      owner_item_id: 'mock-item-2',
      status: 'pending',
      created_at: new Date().toISOString(),
      requester_item: {
        id: 'mock-item-1',
        name: 'Vintage Camera',
        image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400',
      },
      owner_item: {
        id: 'mock-item-2',
        name: 'Leather Jacket',
        image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
      },
      requester_profile: {
        id: 'other-user',
        username: 'CameraCollector',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      },
      owner_profile: {
        id: currentUser?.id,
        username: 'You',
      },
    },
    {
      id: 'mock-2',
      requester_id: 'other-user-2',
      owner_id: currentUser?.id || '',
      requester_item_id: 'mock-item-3',
      owner_item_id: 'mock-item-4',
      status: 'pending',
      created_at: new Date().toISOString(),
      requester_item: {
        id: 'mock-item-3',
        name: 'Mechanical Keyboard',
        image_url: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400',
      },
      owner_item: {
        id: 'mock-item-4',
        name: 'Wireless Headphones',
        image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      },
      requester_profile: {
        id: 'other-user-2',
        username: 'AudioPhile',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      },
      owner_profile: {
        id: currentUser?.id,
        username: 'You',
      },
    },
  ];

  const allSuggestions = suggestions.length > 0 ? suggestions : mockSuggestions;
  const sentSuggestions = allSuggestions.filter(s => s.requester_id === currentUser?.id);
  const receivedSuggestions = allSuggestions.filter(s => s.owner_id === currentUser?.id);

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
    const myItem = type === 'sent' ? suggestion.requester_item : suggestion.owner_item;

    if (type === 'received') {
      // Received: show both cards side by side with buttons on far right
      return (
        <div key={suggestion.id} className="col-span-2 md:col-span-3 lg:col-span-4 flex items-start gap-4">
          {/* Their item (what they're offering) */}
          <div className="flex flex-col w-56 md:w-72">
            <Card className="overflow-hidden">
              <div className="relative">
                <img 
                  src={getItemImage(theirItem)} 
                  alt={theirItem?.name || 'Item'}
                  loading="lazy"
                  className="w-full aspect-[4/3] object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleItemClick(theirItem)}
                />
              </div>
              <CardContent className="p-3">
                <h3 
                  className="font-medium text-foreground truncate cursor-pointer hover:text-primary text-sm"
                  onClick={() => handleItemClick(theirItem)}
                >
                  {theirItem?.name || 'Unknown Item'}
                </h3>
              </CardContent>
            </Card>
            {/* Profile info below their item */}
            <div 
              className="flex items-center gap-2 mt-2 px-1 cursor-pointer"
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
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-muted-foreground">4.8</span>
              </div>
            </div>
          </div>

          {/* My item (what they want from me) */}
          <div className="flex flex-col w-56 md:w-72">
            <Card className="overflow-hidden">
              <div className="relative">
                <img 
                  src={getItemImage(myItem)} 
                  alt={myItem?.name || 'Item'}
                  loading="lazy"
                  className="w-full aspect-[4/3] object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleItemClick(myItem)}
                />
              </div>
              <CardContent className="p-3">
                <h3 
                  className="font-medium text-foreground truncate cursor-pointer hover:text-primary text-sm"
                  onClick={() => handleItemClick(myItem)}
                >
                  {myItem?.name || 'Unknown Item'}
                </h3>
              </CardContent>
            </Card>
          </div>

          {/* Accept/Reject buttons to the far right */}
          <div className="flex flex-col gap-2 pt-8">
            <Button 
              size="sm"
              className="h-8 px-4 text-xs bg-green-500 hover:bg-green-600"
              onClick={() => handleAcceptTrade(suggestion.id)}
              disabled={processingId === suggestion.id}
            >
              Accept
            </Button>
            <Button 
              size="sm"
              variant="outline"
              className="h-8 px-4 text-xs"
              onClick={() => handleDeclineTrade(suggestion.id)}
              disabled={processingId === suggestion.id}
            >
              Reject
            </Button>
          </div>
        </div>
      );
    }

    // Sent: show both cards side by side with cancel button
    return (
      <div key={suggestion.id} className="col-span-2 md:col-span-3 lg:col-span-4 flex items-start gap-4">
        {/* My item (what I'm offering) */}
        <div className="flex flex-col w-56 md:w-72">
          <Card className="overflow-hidden">
            <div className="relative">
              <img 
                src={getItemImage(myItem)} 
                alt={myItem?.name || 'Item'}
                loading="lazy"
                className="w-full aspect-[4/3] object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleItemClick(myItem)}
              />
            </div>
            <CardContent className="p-3">
              <h3 
                className="font-medium text-foreground truncate cursor-pointer hover:text-primary text-sm"
                onClick={() => handleItemClick(myItem)}
              >
                {myItem?.name || 'Unknown Item'}
              </h3>
            </CardContent>
          </Card>
        </div>

        {/* Their item (what I want) */}
        <div className="flex flex-col w-56 md:w-72">
          <Card className="overflow-hidden">
            <div className="relative">
              <img 
                src={getItemImage(theirItem)} 
                alt={theirItem?.name || 'Item'}
                loading="lazy"
                className="w-full aspect-[4/3] object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleItemClick(theirItem)}
              />
            </div>
            <CardContent className="p-3">
              <h3 
                className="font-medium text-foreground truncate cursor-pointer hover:text-primary text-sm"
                onClick={() => handleItemClick(theirItem)}
              >
                {theirItem?.name || 'Unknown Item'}
              </h3>
            </CardContent>
          </Card>
          {/* Owner profile info below their item */}
          <div 
            className="flex items-center gap-2 mt-2 px-1 cursor-pointer"
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
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-muted-foreground">4.8</span>
            </div>
          </div>
        </div>

        {/* Cancel button to the far right */}
        <div className="flex flex-col gap-2 pt-8">
          <Button 
            size="sm"
            variant="outline"
            className="h-8 px-4 text-xs"
            onClick={() => handleCancelTrade(suggestion.id)}
            disabled={processingId === suggestion.id}
          >
            Cancel
          </Button>
        </div>
      </div>
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
              <SelectItem value="all">All ({allSuggestions.length})</SelectItem>
              <SelectItem value="received">Received ({receivedSuggestions.length})</SelectItem>
              <SelectItem value="sent">Sent ({sentSuggestions.length})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(() => {
          const displaySuggestions = filter === 'all' 
            ? allSuggestions 
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
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
