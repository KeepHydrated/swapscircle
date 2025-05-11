
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ConversationList from '@/components/messages/ConversationList';
import ChatArea from '@/components/messages/ChatArea';
import DetailsPanel from '@/components/messages/DetailsPanel';
import ExchangeCarousel from '@/components/messages/ExchangeCarousel';
import { mockConversations } from '@/data/conversations';
import { exchangePairs } from '@/data/exchangePairs';
import { toast } from "sonner";
import { ScrollArea } from '@/components/ui/scroll-area';

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
        {/* Item exchange carousel taking full width - frozen at top */}
        <div className="w-full border-b border-gray-200 sticky top-0 bg-white z-10">
          <ExchangeCarousel 
            exchangePairs={exchangePairs}
            selectedPairId={selectedPairId}
            onPairSelect={handlePairSelect}
          />
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Conversations sidebar with scroll */}
          <div className="w-64 border-r border-gray-200">
            <ScrollArea className="h-[calc(100vh-64px-60px)]">
              <ConversationList 
                conversations={mockConversations}
                activeConversation={activeConversation}
                setActiveConversation={setActiveConversation}
              />
            </ScrollArea>
          </div>
          
          {/* Chat area with scroll */}
          <div className="flex-1">
            <ScrollArea className="h-[calc(100vh-64px-60px)]">
              <ChatArea activeChat={activeChat} />
            </ScrollArea>
          </div>
          
          {/* Details panel with scroll */}
          <div className="w-80">
            <ScrollArea className="h-[calc(100vh-64px-60px)]">
              <DetailsPanel selectedPair={selectedPair} />
            </ScrollArea>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages;
