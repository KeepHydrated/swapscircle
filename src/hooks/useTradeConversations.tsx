
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchUserTradeConversations, TradeConversation } from '@/services/tradeService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

export interface ConversationDisplay {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  rating?: number;
  distance?: string;
  isNew?: boolean;
  isCompleted?: boolean;
  otherUserProfile?: {
    id: string;
    name: string;
    email: string;
    avatar_url: string;
    bio: string;
    location: string;
    username: string;
    created_at: string;
    updated_at: string;
  };
}

export interface ExchangePairDisplay {
  id: number;
  item1: { name: string; image: string };
  item2: { name: string; image: string };
  partnerId: string;
}

export const useTradeConversations = () => {
  const [conversations, setConversations] = useState<ConversationDisplay[]>([]);
  const [exchangePairs, setExchangePairs] = useState<ExchangePairDisplay[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [selectedPairId, setSelectedPairId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Fetch trade conversations from database
  useEffect(() => {
    const loadTradeConversations = async () => {
      setLoading(true);
      try {
        const tradeConversations = await fetchUserTradeConversations();
        console.log('Processing trade conversations:', tradeConversations);
        
        // Get current user
        const { data: session } = await supabase.auth.getSession();
        const currentUserId = session?.session?.user?.id;

        if (!currentUserId) {
          setLoading(false);
          return;
        }

        // Convert trade conversations to display format
        const displayConversations: ConversationDisplay[] = [];
        const displayExchangePairs: ExchangePairDisplay[] = [];

        tradeConversations.forEach((tc: any, index: number) => {
          // Determine who is the other person
          const isRequester = tc.requester_id === currentUserId;
          const myItem = isRequester ? tc.requester_item : tc.owner_item;
          const theirItem = isRequester ? tc.owner_item : tc.requester_item;
          const otherUserId = isRequester ? tc.owner_id : tc.requester_id;
          const otherUserProfile = isRequester ? tc.owner_profile : tc.requester_profile;

          // Create exchange pair
          const exchangePair: ExchangePairDisplay = {
            id: index + 1,
            partnerId: tc.id,
            item1: {
              name: myItem?.name || 'Your Item',
              image: myItem?.image_url || '/placeholder.svg'
            },
            item2: {
              name: theirItem?.name || 'Their Item', 
              image: theirItem?.image_url || '/placeholder.svg'
            }
          };

          displayExchangePairs.push(exchangePair);

          // Create conversation display with profile data
          const conversation: ConversationDisplay = {
            id: tc.id,
            name: otherUserProfile?.name || `Trading Partner`,
            lastMessage: `Trading ${myItem?.name} for ${theirItem?.name}`,
            time: new Date(tc.updated_at).toLocaleDateString(),
            rating: 5,
            distance: '2.3 mi away',
            isNew: tc.status === 'pending',
            isCompleted: tc.status === 'completed',
            otherUserProfile: otherUserProfile
          };

          displayConversations.push(conversation);
        });

        console.log('Display conversations:', displayConversations);
        console.log('Display exchange pairs:', displayExchangePairs);

        setConversations(displayConversations);
        setExchangePairs(displayExchangePairs);

        // Handle navigation from trade creation
        if (location.state?.tradeConversationId && location.state?.newTrade) {
          const newTradeId = location.state.tradeConversationId;
          setActiveConversation(newTradeId);
          
          // Find the corresponding pair
          const pairIndex = displayExchangePairs.findIndex(pair => pair.partnerId === newTradeId);
          if (pairIndex !== -1) {
            setSelectedPairId(displayExchangePairs[pairIndex].id);
          }
          
          toast({
            title: "Trade conversation started!",
            description: "You can now chat with the item owner.",
          });
        } else if (displayConversations.length > 0) {
          // Set first conversation as active if none is selected
          setActiveConversation(displayConversations[0].id);
          setSelectedPairId(displayExchangePairs[0]?.id || null);
        }

      } catch (error) {
        console.error('Error loading trade conversations:', error);
        toast({
          title: "Error",
          description: "Failed to load conversations.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadTradeConversations();
  }, [location.state]);

  const activeChat = conversations.find(conv => conv.id === activeConversation) || 
    { 
      id: activeConversation || '', 
      name: 'No conversations', 
      isNew: true,
      lastMessage: "No conversations yet.", 
      time: "Start trading",
      rating: 5,
      distance: "Unknown distance"
    };

  const selectedPair = exchangePairs.find(pair => pair.id === selectedPairId);

  const handlePairSelect = (partnerId: string, pairId: number) => {
    setActiveConversation(partnerId);
    setSelectedPairId(pairId);
  };

  const handleSendFirstMessage = (conversationId: string) => {
    // Update conversation to mark as no longer new
    setConversations(prevConversations => 
      prevConversations.map(conv => 
        conv.id === conversationId 
          ? { 
              ...conv, 
              isNew: false, 
              lastMessage: "Hi there! I'm interested in this trade.",
              time: "Just now" 
            } 
          : conv
      )
    );
  };

  const handleTradeCompleted = (conversationId: string) => {
    setConversations(prevConversations => 
      prevConversations.map(conv => 
        conv.id === conversationId 
          ? { 
              ...conv, 
              lastMessage: "Trade completed! You can now leave a review.",
              time: "Just now",
              isCompleted: true
            } 
          : conv
      )
    );
    
    toast({
      title: "Trade completed!",
      description: "Trade has been marked as completed.",
    });
  };

  return {
    conversations,
    exchangePairs,
    activeConversation,
    setActiveConversation,
    activeChat,
    selectedPair,
    selectedPairId,
    handlePairSelect,
    handleSendFirstMessage,
    handleTradeCompleted,
    loading
  };
};
