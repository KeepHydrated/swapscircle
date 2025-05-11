
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ConversationList from '@/components/messages/ConversationList';
import ChatArea from '@/components/messages/ChatArea';
import DetailsPanel from '@/components/messages/details/DetailsPanel';
import ExchangeCarousel from '@/components/messages/ExchangeCarousel';
import { mockConversations } from '@/data/conversations';
import { exchangePairs } from '@/data/exchangePairs';
import { toast } from "sonner";

const Messages = () => {
  const [activeConversation, setActiveConversation] = useState<string | null>("1");
  const [selectedPairId, setSelectedPairId] = useState<number | null>(1);
  const [conversations, setConversations] = useState(mockConversations);
  
  const activeChat = conversations.find(conv => conv.id === activeConversation);

  // Get the currently selected pair
  const selectedPair = exchangePairs.find(pair => pair.id === selectedPairId);

  const handlePairSelect = (partnerId: string, pairId: number) => {
    setActiveConversation(partnerId);
    setSelectedPairId(pairId);
    toast(`Starting conversation about this item exchange`);
  };

  const handleSendFirstMessage = (conversationId: string) => {
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
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-64px)]">
        {/* Item exchange carousel - frozen at top with consistent height */}
        <div className="w-full border-b border-gray-200 bg-white z-10 h-16 flex items-center">
          <ExchangeCarousel 
            exchangePairs={exchangePairs}
            selectedPairId={selectedPairId}
            onPairSelect={handlePairSelect}
          />
        </div>
        
        {/* Three columns with individual scroll areas */}
        <div className="flex flex-1 overflow-hidden">
          {/* Conversations sidebar with its own scrollbar - now wider */}
          <div className="w-80 border-r border-gray-200 overflow-hidden flex flex-col">
            <ConversationList 
              conversations={conversations}
              activeConversation={activeConversation}
              setActiveConversation={setActiveConversation}
              exchangePairs={exchangePairs}
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
            <DetailsPanel selectedPair={selectedPair} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages;
