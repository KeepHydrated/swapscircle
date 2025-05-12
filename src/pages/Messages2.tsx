
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ConversationList from '@/components/messages/ConversationList';
import ChatArea from '@/components/messages/ChatArea';
import DetailsPanel from '@/components/messages/details/DetailsPanel';
import ExchangeCarousel from '@/components/messages/ExchangeCarousel';
import { mockConversations } from '@/data/conversations';
import { exchangePairs } from '@/data/exchangePairs';
import { toast } from "sonner";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocation } from 'react-router-dom';

const Messages2 = () => {
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
  }, [location.state]);

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

  // Get the currently selected pair
  const selectedPair = dynamicExchangePairs.find(pair => pair.id === selectedPairId);

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
    // In a real app, this would save the completed trade to the user's profile
    // and potentially remove it from active conversations
    
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
      // No myReview yet, as the user hasn't left one
    };
    
    // In a real app, we would save this completed trade to the database
    console.log("Trade completed:", completedTrade);
    
    toast.success("Trade completed and added to your profile!");
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-64px)]">
        {/* Item exchange carousel - improved styling to prevent cutoff */}
        <div className="w-full border-b border-gray-200 bg-white z-20 h-24 flex items-center px-2 py-1 sticky top-0">
          <ExchangeCarousel 
            exchangePairs={dynamicExchangePairs}
            selectedPairId={selectedPairId}
            onPairSelect={handlePairSelect}
          />
        </div>
        
        {/* Three columns with consistent header heights */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar - Conversations */}
          <div className="w-[350px] border-r border-gray-200 overflow-hidden flex flex-col">
            <ConversationList 
              conversations={displayedConversations}
              activeConversation={activeConversation}
              setActiveConversation={setActiveConversation}
              exchangePairs={dynamicExchangePairs}
            />
          </div>
          
          {/* Middle - Chat area - Ensure it has proper height and doesn't scroll as a whole */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <ChatArea 
              activeChat={activeChat} 
              onSendFirstMessage={handleSendFirstMessage}
              onTradeCompleted={handleTradeCompleted}
            />
          </div>
          
          {/* Right sidebar - Details panel with consistent header height */}
          <div className="w-80 border-l border-gray-200 overflow-hidden bg-gray-50">
            <ScrollArea className="h-full">
              <DetailsPanel selectedPair={selectedPair} />
            </ScrollArea>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages2;
