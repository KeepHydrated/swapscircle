
import { useState, useEffect } from 'react';
import { mockConversations } from '@/data/conversations';
import { exchangePairs } from '@/data/exchangePairs';
import { toast } from "sonner";
import { useLocation } from 'react-router-dom';

export interface ExchangePair {
  id: number;
  item1: { name: string; image: string };
  item2: { name: string; image: string };
  partnerId: string;
}

export interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  rating?: number;
  distance?: string;
  isNew?: boolean;
  isCompleted?: boolean;
}

export const useConversations = () => {
  const [activeConversation, setActiveConversation] = useState<string | null>("2");
  const [selectedPairId, setSelectedPairId] = useState<number | null>(1);
  
  // Filter out Emma Wilson (id: "1") from the conversations
  const [conversations, setConversations] = useState(
    mockConversations.filter(conv => conv.id !== "1")
  );
  
  const [dynamicExchangePairs, setDynamicExchangePairs] = useState(exchangePairs);
  const location = useLocation();
  
  // Check if we've navigated here from liking an item
  useEffect(() => {
    const likedItemMatch = location.state?.likedItem;
    if (likedItemMatch) {
      // Check if we already have a conversation for this match
      const existingConvo = conversations.find(
        convo => convo.name === `${likedItemMatch.name} Owner`
      );
      
      if (!existingConvo) {
        // Create a new exchange pair for the carousel
        const newConversationId = `match-${Date.now()}`;
        const newExchangePair = {
          id: dynamicExchangePairs.length + 1,
          partnerId: newConversationId,
          item1: { name: "Your Item", image: "/placeholder.svg" },
          item2: { name: likedItemMatch.name, image: likedItemMatch.image || "/placeholder.svg" }
        };
        
        // Add the new exchange pair to the top carousel
        setDynamicExchangePairs(prev => [...prev, newExchangePair]);
        
        // Set it as active
        setActiveConversation(newConversationId);
        setSelectedPairId(newExchangePair.id);
        
        // Show a toast
        toast(`New match created with ${likedItemMatch.name}!`);
      }
    }
  }, [location.state, conversations]);

  // Get the currently selected pair
  const selectedPair = dynamicExchangePairs.find(pair => pair.id === selectedPairId);

  // Only show conversations that are not new matches (a message has been sent)
  const displayedConversations = conversations.filter(conv => !conv.isNew);

  const activeChat = conversations.find(conv => conv.id === activeConversation) || 
    { 
      id: activeConversation || '', 
      name: 'New Match', 
      isNew: true,
      lastMessage: "No messages yet. Start the conversation!", 
      time: "Just matched",
      rating: 5,
      distance: "Unknown distance"
    };

  const handlePairSelect = (partnerId: string, pairId: number) => {
    setActiveConversation(partnerId);
    setSelectedPairId(pairId);
    toast(`Starting conversation about this item exchange`);
  };

  const handleSendFirstMessage = (conversationId: string) => {
    // Find the exchange pair related to this conversation
    const relatedPair = dynamicExchangePairs.find(pair => pair.partnerId === conversationId);
    
    if (relatedPair) {
      // Create a new conversation entry for the match that just had its first message
      const newConvo = {
        id: conversationId,
        name: `${relatedPair.item2.name} Owner`,
        lastMessage: "Hi there! I'm interested in exchanging items with you.",
        time: "Just now",
        rating: 5,
        distance: "2.5 mi away",
        isNew: false
      };
      
      // Add the conversation to the list
      setConversations(prev => [newConvo, ...prev]);
    } else {
      // Update existing conversation
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === conversationId 
            ? { 
                ...conv, 
                isNew: false, 
                lastMessage: "Hi there! I'm interested in exchanging items with you.",
                time: "Just now" 
              } 
            : conv
        )
      );
    }
  };

  const handleTradeCompleted = (conversationId: string) => {
    // Mark the conversation as completed
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
    
    // Create a completed trade record
    // This would typically be done on the server
    const completedTrade = {
      id: Date.now(),
      name: "Your Item",
      tradedFor: activeChat.name.replace(" Owner", ""),
      tradedWith: activeChat.name,
      tradeDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      image: "/placeholder.svg",
      theirReview: {
        rating: 5,
        comment: "Great trade! The item was exactly as described.",
        date: "Just now"
      }
    };
    
    // In a real app, we would save this completed trade to the database
    console.log("Trade completed:", completedTrade);
    
    toast.success("Trade completed and added to your profile!");
  };

  return {
    conversations: displayedConversations,
    activeConversation,
    setActiveConversation,
    activeChat,
    selectedPair,
    dynamicExchangePairs,
    selectedPairId,
    handlePairSelect,
    handleSendFirstMessage,
    handleTradeCompleted
  };
};
