
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchUserTradeConversations, TradeConversation, checkAndCompleteAcceptedTrades } from '@/services/tradeService';
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
    username: string;
    email: string;
    avatar_url: string;
    bio: string;
    location: string;
    created_at: string;
    updated_at: string;
  };
}

export interface ExchangePairDisplay {
  id: number;
  item1: { 
    name: string; 
    image: string;
    description?: string;
    category?: string;
    condition?: string;
    price_range_min?: number;
    price_range_max?: number;
    tags?: string[];
  };
  item2: { 
    name: string; 
    image: string;
    description?: string;
    category?: string;
    condition?: string;
    price_range_min?: number;
    price_range_max?: number;
    tags?: string[];
  };
  partnerId: string;
  partnerProfile?: {
    id: string;
    username: string;
    avatar_url?: string;
    created_at: string;
    location?: string;
  };
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
        // First check and complete any accepted trades
        await checkAndCompleteAcceptedTrades();
        // Then fetch all conversations
        const tradeConversations = await fetchUserTradeConversations();
        console.log('Processing trade conversations:', tradeConversations);
        
        // Get current user
        const { data: session } = await supabase.auth.getSession();
        const currentUserId = session?.session?.user?.id;
        console.log('DEBUG - Current authenticated user ID:', currentUserId);

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
              image: myItem?.image_url || (myItem?.image_urls && myItem?.image_urls.length > 0 ? myItem?.image_urls[0] : '/placeholder.svg'),
              description: myItem?.description,
              category: myItem?.category,
              condition: myItem?.condition,
              price_range_min: myItem?.price_range_min,
              price_range_max: myItem?.price_range_max,
              tags: myItem?.tags
            },
            item2: {
              name: theirItem?.name || 'Their Item', 
              image: theirItem?.image_url || (theirItem?.image_urls && theirItem?.image_urls.length > 0 ? theirItem?.image_urls[0] : '/placeholder.svg'),
              description: theirItem?.description,
              category: theirItem?.category,
              condition: theirItem?.condition,
              price_range_min: theirItem?.price_range_min,
              price_range_max: theirItem?.price_range_max,
              tags: theirItem?.tags
            },
            partnerProfile: otherUserProfile ? {
              id: otherUserId,
              username: otherUserProfile.username,
              avatar_url: otherUserProfile.avatar_url,
              created_at: otherUserProfile.created_at,
              location: otherUserProfile.location
            } : undefined
          };

          displayExchangePairs.push(exchangePair);

          const conversation: ConversationDisplay = {
            id: tc.id,
            name: otherUserProfile?.username || `Trading Partner`,
            lastMessage: `Trading ${myItem?.name} for ${theirItem?.name}`,
            time: new Date(tc.updated_at).toLocaleDateString(),
            rating: 5,
            distance: '2.3 mi away',
            isNew: tc.status === 'pending',
            isCompleted: tc.status === 'completed',
            otherUserProfile: otherUserProfile || {
              id: otherUserId,
              username: 'Trading Partner',
              email: '',
              avatar_url: '',
              bio: '',
              location: '2.3 mi away',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          };

          console.log('DEBUG - Created conversation:', {
            id: tc.id,
            otherUserId,
            otherUserProfile: JSON.stringify(otherUserProfile, null, 2),
            finalOtherUserProfile: JSON.stringify(conversation.otherUserProfile, null, 2)
          });

          displayConversations.push(conversation);
        });

        // Sort conversations to ensure newest conversations appear at the top
        // Sort by created_at first (newest first), then by updated_at (newest first) as secondary sort
        displayConversations.sort((a, b) => {
          const aConversation = tradeConversations.find(tc => tc.id === a.id);
          const bConversation = tradeConversations.find(tc => tc.id === b.id);
          
          if (!aConversation || !bConversation) return 0;
          
          // Primary sort: created_at (newest first)
          const aCreated = new Date(aConversation.created_at).getTime();
          const bCreated = new Date(bConversation.created_at).getTime();
          if (aCreated !== bCreated) {
            return bCreated - aCreated;
          }
          
          // Secondary sort: updated_at (newest first)
          const aUpdated = new Date(aConversation.updated_at).getTime();
          const bUpdated = new Date(bConversation.updated_at).getTime();
          return bUpdated - aUpdated;
        });

        console.log('Display conversations:', displayConversations);
        console.log('Display exchange pairs:', displayExchangePairs);

        setConversations(displayConversations);
        setExchangePairs(displayExchangePairs);

        // Handle navigation from trade creation or URL parameters
        const searchParams = new URLSearchParams(location.search);
        const conversationParam = searchParams.get('conversation');
        
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
        } else if (location.state?.newMatch && location.state?.matchData) {
          // Handle new match - find the most recent conversation (should be the new match)
          // The new match conversation should be at the top due to our sorting
          if (displayConversations.length > 0) {
            const newMatchConversation = displayConversations[0]; // Should be the newest
            setActiveConversation(newMatchConversation.id);
            
            // Find the corresponding pair
            const pairIndex = displayExchangePairs.findIndex(pair => pair.partnerId === newMatchConversation.id);
            if (pairIndex !== -1) {
              setSelectedPairId(displayExchangePairs[pairIndex].id);
            }
            
            console.log('New match conversation set as active:', newMatchConversation.id);
          }
        } else if (conversationParam && displayConversations.find(conv => conv.id === conversationParam)) {
          // Handle URL parameter ?conversation=xyz
          console.log('Setting active conversation from URL parameter:', conversationParam);
          setActiveConversation(conversationParam);
          
          // Find the corresponding pair
          const pairIndex = displayExchangePairs.findIndex(pair => pair.partnerId === conversationParam);
          if (pairIndex !== -1) {
            setSelectedPairId(displayExchangePairs[pairIndex].id);
          }
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
  }, [location.state, location.search]);

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

  const selectedPair = exchangePairs.find(pair => 
    selectedPairId ? pair.id === selectedPairId : pair.partnerId === activeConversation
  );

  const handlePairSelect = (partnerId: string, pairId: number) => {
    setActiveConversation(partnerId);
    setSelectedPairId(pairId);
  };

  const resetSelectedPair = () => {
    setSelectedPairId(null);
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
    resetSelectedPair,
    loading
  };
};
