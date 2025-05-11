
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

const Messages = () => {
  const [activeConversation, setActiveConversation] = useState<string | null>("1");
  const [selectedPairId, setSelectedPairId] = useState<number | null>(1);
  const [conversations, setConversations] = useState(mockConversations);
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
    { id: activeConversation || '', name: 'New Match', isNew: true };

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

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-64px)]">
        {/* Item exchange carousel - frozen at top with consistent height */}
        <div className="w-full border-b border-gray-200 bg-white z-10 h-16 flex items-center">
          <ExchangeCarousel 
            exchangePairs={dynamicExchangePairs}
            selectedPairId={selectedPairId}
            onPairSelect={handlePairSelect}
          />
        </div>
        
        {/* Three columns with individual scroll areas */}
        <div className="flex flex-1 overflow-hidden">
          {/* Conversations sidebar with its own scrollbar - now wider */}
          <div className="w-80 border-r border-gray-200 overflow-hidden flex flex-col">
            <ConversationList 
              conversations={displayedConversations}
              activeConversation={activeConversation}
              setActiveConversation={setActiveConversation}
              exchangePairs={dynamicExchangePairs}
            />
          </div>
          
          {/* Chat area with its own scrollbar */}
          <div className="flex-1 overflow-hidden">
            <ChatArea 
              activeChat={activeChat} 
              onSendFirstMessage={handleSendFirstMessage}
            />
          </div>
          
          {/* Details panel with its own scrollbar */}
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

export default Messages;
