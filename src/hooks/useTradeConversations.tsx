
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
  status?: string;
  requesterId?: string;
  ownerId?: string;
  requesterAccepted?: boolean;
  ownerAccepted?: boolean;
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

interface ItemDisplay {
  id?: string;
  name: string; 
  image: string;
  image_url?: string;
  image_urls?: string[];
  description?: string;
  category?: string;
  condition?: string;
  price_range_min?: number;
  price_range_max?: number;
  tags?: string[];
}

export interface ExchangePairDisplay {
  id: number;
  item1: ItemDisplay;
  item1Items?: ItemDisplay[]; // Array of all my items when multiple
  item2: ItemDisplay;
  item2Items?: ItemDisplay[]; // Array of all their items when multiple
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

        // Fetch last message for each conversation to show in sidebar
        const conversationIds = tradeConversations.map((tc: any) => tc.id);
        let lastMessagesMap: Record<string, { message: string; created_at: string }> = {};
        if (conversationIds.length > 0) {
          const { data: lastMsgs, error: lastMsgsError } = await supabase
            .from('trade_messages')
            .select('conversation_id, message, created_at')
            .in('conversation_id', conversationIds)
            .order('created_at', { ascending: false });

          if (!lastMsgsError && lastMsgs) {
            (lastMsgs as any[]).forEach((m: any) => {
              if (!lastMessagesMap[m.conversation_id]) {
                lastMessagesMap[m.conversation_id] = { message: m.message, created_at: m.created_at };
              }
            });
          } else if (lastMsgsError) {
            console.error('Error fetching last messages:', lastMsgsError);
          }
        }

        tradeConversations.forEach((tc: any, index: number) => {
          // Determine who is the other person
          const isRequester = tc.requester_id === currentUserId;
          const myItem = isRequester ? tc.requester_item : tc.owner_item;
          const myItems = isRequester ? tc.requester_items : tc.owner_items;
          const theirItem = isRequester ? tc.owner_item : tc.requester_item;
          const theirItems = isRequester ? tc.owner_items : tc.requester_items;
          const otherUserId = isRequester ? tc.owner_id : tc.requester_id;
          const otherUserProfile = isRequester ? tc.owner_profile : tc.requester_profile;
          

          // Create item1Items array with all my items
          const item1Items: ItemDisplay[] = (myItems || []).map((item: any) => ({
            id: item?.id,
            name: item?.name || 'Your Item',
            image: item?.image_url || (item?.image_urls && item?.image_urls.length > 0 ? item?.image_urls[0] : '/placeholder.svg'),
            image_url: item?.image_url,
            image_urls: item?.image_urls,
            description: item?.description,
            category: item?.category,
            condition: item?.condition,
            price_range_min: item?.price_range_min,
            price_range_max: item?.price_range_max,
            tags: item?.tags
          }));

          // Create item2Items array with all their items
          const item2Items: ItemDisplay[] = (theirItems || []).map((item: any) => ({
            id: item?.id,
            name: item?.name || 'Their Item',
            image: item?.image_url || (item?.image_urls && item?.image_urls.length > 0 ? item?.image_urls[0] : '/placeholder.svg'),
            image_url: item?.image_url,
            image_urls: item?.image_urls,
            description: item?.description,
            category: item?.category,
            condition: item?.condition,
            price_range_min: item?.price_range_min,
            price_range_max: item?.price_range_max,
            tags: item?.tags
          }));

          // Create exchange pair
          const exchangePair: ExchangePairDisplay = {
            id: index + 1,
            partnerId: tc.id,
            item1: {
              id: myItem?.id,
              name: myItem?.name || 'Your Item',
              image: myItem?.image_url || (myItem?.image_urls && myItem?.image_urls.length > 0 ? myItem?.image_urls[0] : '/placeholder.svg'),
              image_url: myItem?.image_url,
              image_urls: myItem?.image_urls,
              description: myItem?.description,
              category: myItem?.category,
              condition: myItem?.condition,
              price_range_min: myItem?.price_range_min,
              price_range_max: myItem?.price_range_max,
              tags: myItem?.tags
            },
            item1Items: item1Items.length > 0 ? item1Items : undefined,
            item2: {
              id: theirItem?.id,
              name: theirItem?.name || 'Their Item', 
              image: theirItem?.image_url || (theirItem?.image_urls && theirItem?.image_urls.length > 0 ? theirItem?.image_urls[0] : '/placeholder.svg'),
              image_url: theirItem?.image_url,
              image_urls: theirItem?.image_urls,
              description: theirItem?.description,
              category: theirItem?.category,
              condition: theirItem?.condition,
              price_range_min: theirItem?.price_range_min,
              price_range_max: theirItem?.price_range_max,
              tags: theirItem?.tags
            },
            item2Items: item2Items.length > 0 ? item2Items : undefined,
            partnerProfile: otherUserProfile ? {
              id: otherUserId,
              username: otherUserProfile.username,
              avatar_url: otherUserProfile.avatar_url,
              created_at: otherUserProfile.created_at,
              location: otherUserProfile.location
            } : undefined
          };

          displayExchangePairs.push(exchangePair);

          // Determine the last activity text for the sidebar
          const lastMsg = lastMessagesMap[tc.id];
          let lastMessageText = `Trading ${myItem?.name} for ${theirItem?.name}`;

          if (tc.status === 'completed') {
            lastMessageText = 'Trade Completed';
          } else {
            if (lastMsg?.message) {
              lastMessageText = lastMsg.message;
            }
            const lastMsgTime = lastMsg ? new Date(lastMsg.created_at).getTime() : 0;
            const updatedTime = new Date(tc.updated_at).getTime();
            if ((tc.requester_accepted || tc.owner_accepted) && updatedTime >= lastMsgTime) {
              const youAreRequester = tc.requester_id === currentUserId;
              const youAreOwner = tc.owner_id === currentUserId;
              const youAccepted = (youAreRequester && tc.requester_accepted) || (youAreOwner && tc.owner_accepted);
              const otherAccepted = !youAccepted && (tc.requester_accepted || tc.owner_accepted);
              if (youAccepted) lastMessageText = 'You accepted the trade';
              else if (otherAccepted) lastMessageText = 'They accepted the trade';
            }
          }
          const conversation: ConversationDisplay = {
            id: tc.id,
            name: otherUserProfile?.username || `Trading Partner`,
            lastMessage: lastMessageText,
            time: new Date(tc.updated_at).toLocaleDateString(),
            rating: 5,
            distance: '2.3 mi away',
            isNew: tc.status === 'pending',
            isCompleted: tc.status === 'completed',
            status: tc.status,
            requesterId: tc.requester_id,
            ownerId: tc.owner_id,
            requesterAccepted: tc.requester_accepted,
            ownerAccepted: tc.owner_accepted,
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
        console.log('DEBUG - Exchange pairs partnerId mapping:', displayExchangePairs.map(ep => ({ id: ep.id, partnerId: ep.partnerId })));


        setConversations(displayConversations);
        setExchangePairs(displayExchangePairs);

        // Handle navigation from trade creation or URL parameters
        const searchParams = new URLSearchParams(location.search);
        const rawConversationParam = searchParams.get('conversation');
        const partnerParam = searchParams.get('partnerId');
        // If both params are present and identical (likely a userId), prefer treating it as partnerId
        const conversationParam = partnerParam && rawConversationParam === partnerParam ? null : rawConversationParam;
        let didSelect = false;
        
        if (location.state?.tradeConversationId && location.state?.newTrade) {
          const newTradeId = location.state.tradeConversationId;
          setActiveConversation(newTradeId);
          didSelect = true;
          
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
            didSelect = true;
            
            // Find the corresponding pair
            const pairIndex = displayExchangePairs.findIndex(pair => pair.partnerId === newMatchConversation.id);
            if (pairIndex !== -1) {
              setSelectedPairId(displayExchangePairs[pairIndex].id);
            }
            
            console.log('New match conversation set as active:', newMatchConversation.id);
          }
        } else if (conversationParam && displayConversations.find(conv => conv.id === conversationParam)) {
          // Handle URL parameter ?conversation=xyz (conversation id)
          console.log('Setting active conversation from URL parameter:', conversationParam);
          setActiveConversation(conversationParam);
          didSelect = true;
          // Find the corresponding pair
          const pairIndex = displayExchangePairs.findIndex(pair => pair.partnerId === conversationParam);
          if (pairIndex !== -1) {
            setSelectedPairId(displayExchangePairs[pairIndex].id);
          }
        } else if (conversationParam) {
          // Back-compat: some old notifications put partner userId in the "conversation" param
          const byPartnerLikeConv = displayConversations.find(conv => conv.otherUserProfile?.id === conversationParam);
          if (byPartnerLikeConv) {
            console.log('Resolved legacy conversation param as partnerId, selecting conversation:', byPartnerLikeConv.id);
            setActiveConversation(byPartnerLikeConv.id);
            didSelect = true;
            const pairIndex = displayExchangePairs.findIndex(pair => pair.partnerId === byPartnerLikeConv.id);
            if (pairIndex !== -1) {
              setSelectedPairId(displayExchangePairs[pairIndex].id);
            }
          } else {
            // Last resort: still honor the param to avoid defaulting to the first chat
            console.warn('Conversation param provided but not found in list. Honoring param anyway:', conversationParam);
            setActiveConversation(conversationParam);
            didSelect = true;
          }
        } else if (partnerParam) {
          // Fallback: if we have a partnerId, find conversation with that user
          const byPartner = displayConversations.find(conv => conv.otherUserProfile?.id === partnerParam);
          if (byPartner) {
            setActiveConversation(byPartner.id);
            didSelect = true;
            const pairIndex = displayExchangePairs.findIndex(pair => pair.partnerId === byPartner.id);
            if (pairIndex !== -1) {
              setSelectedPairId(displayExchangePairs[pairIndex].id);
            }
          } else {
            // Secondary fallback: resolve via exchange pairs partnerProfile mapping
            const pairByPartner = displayExchangePairs.find(pair => pair.partnerProfile?.id === partnerParam);
            if (pairByPartner) {
              setActiveConversation(pairByPartner.partnerId);
              setSelectedPairId(pairByPartner.id);
              didSelect = true;
            }
          }
        }
        
        // Default to first conversation only if nothing else selected
        if (!didSelect && displayConversations.length > 0) {
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
  
  console.log('DEBUG - Selected pair determination:', {
    selectedPairId,
    activeConversation,
    exchangePairsCount: exchangePairs.length,
    selectedPair: selectedPair ? 'Found' : 'Not found',
    availablePartnerIds: exchangePairs.map(ep => ep.partnerId)
  });

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
