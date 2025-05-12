
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ExchangeCarousel from '@/components/messages/ExchangeCarousel';
import ConversationList from '@/components/messages/ConversationList';
import ChatArea from '@/components/messages/ChatArea';
import DetailsPanel from '@/components/messages/details/DetailsPanel';
import { ExchangePair, Conversation } from '@/hooks/useConversations';

interface MessagesLayoutProps {
  exchangePairs: ExchangePair[];
  selectedPairId: number | null;
  onPairSelect: (partnerId: string, pairId: number) => void;
  conversations: Conversation[];
  activeConversation: string | null;
  setActiveConversation: (id: string) => void;
  activeChat: Conversation;
  selectedPair: ExchangePair | undefined;
  onSendFirstMessage: (conversationId: string) => void;
  onTradeCompleted: (conversationId: string) => void;
}

const MessagesLayout: React.FC<MessagesLayoutProps> = ({
  exchangePairs,
  selectedPairId,
  onPairSelect,
  conversations,
  activeConversation,
  setActiveConversation,
  activeChat,
  selectedPair,
  onSendFirstMessage,
  onTradeCompleted
}) => {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Item exchange carousel - reduced height */}
      <div className="w-full border-b border-gray-200 bg-white z-20 h-20 flex items-center px-2 py-0 sticky top-0">
        <ExchangeCarousel 
          exchangePairs={exchangePairs}
          selectedPairId={selectedPairId}
          onPairSelect={onPairSelect}
        />
      </div>
      
      {/* Three columns with consistent header heights */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Conversations */}
        <div className="w-[350px] border-r border-gray-200 overflow-hidden flex flex-col">
          <ConversationList 
            conversations={conversations}
            activeConversation={activeConversation}
            setActiveConversation={setActiveConversation}
            exchangePairs={exchangePairs}
          />
        </div>
        
        {/* Middle - Chat area with reduced height */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <ChatArea 
            activeChat={activeChat} 
            onSendFirstMessage={onSendFirstMessage}
            onTradeCompleted={onTradeCompleted}
          />
        </div>
        
        {/* Right sidebar - Details panel */}
        <div className="w-80 border-l border-gray-200 overflow-hidden bg-gray-50">
          <ScrollArea className="h-full">
            <DetailsPanel selectedPair={selectedPair} />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default MessagesLayout;
