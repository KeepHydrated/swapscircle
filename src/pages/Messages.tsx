
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ConversationList from '@/components/messages/ConversationList';
import ChatArea from '@/components/messages/ChatArea';
import DetailsPanel from '@/components/messages/DetailsPanel';
import ExchangeCarousel from '@/components/messages/ExchangeCarousel';
import { mockConversations } from '@/data/conversations';
import { exchangePairs } from '@/data/exchangePairs';
import { toast } from "sonner";

const Messages = () => {
  const [activeConversation, setActiveConversation] = useState<string | null>("1");
  const [selectedPairId, setSelectedPairId] = useState<number | null>(1);
  
  const activeChat = mockConversations.find(conv => conv.id === activeConversation);

  // Get the currently selected pair
  const selectedPair = exchangePairs.find(pair => pair.id === selectedPairId);

  const handlePairSelect = (partnerId: string, pairId: number) => {
    setActiveConversation(partnerId);
    setSelectedPairId(pairId);
    toast(`Starting conversation about this item exchange`);
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-64px)]">
        {/* Item exchange carousel taking full width */}
        <div className="w-full">
          <ExchangeCarousel 
            exchangePairs={exchangePairs}
            selectedPairId={selectedPairId}
            onPairSelect={handlePairSelect}
          />
        </div>
        
        <div className="flex flex-1">
          {/* Conversations sidebar */}
          <ConversationList 
            conversations={mockConversations}
            activeConversation={activeConversation}
            setActiveConversation={setActiveConversation}
          />
          
          {/* Chat area */}
          <ChatArea activeChat={activeChat} />
          
          {/* Details panel */}
          <DetailsPanel selectedPair={selectedPair} />
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages;
