
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ConversationList from '@/components/messages/ConversationList';
import ChatArea from '@/components/messages/ChatArea';
import { useConversations } from '@/hooks/useConversations';

const TestMessages = () => {
  const {
    conversations,
    activeConversation,
    setActiveConversation,
    activeChat,
    selectedPair,
    dynamicExchangePairs,
    selectedPairId,
    handlePairSelect,
    handleSendFirstMessage,
    handleTradeCompleted
  } = useConversations();

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-64px)]">
        {/* Three columns layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left column - Messages List */}
          <div className="w-1/3 border-r border-gray-200 overflow-hidden flex flex-col">
            <ConversationList 
              conversations={conversations}
              activeConversation={activeConversation}
              setActiveConversation={setActiveConversation}
              exchangePairs={dynamicExchangePairs}
            />
          </div>
          
          {/* Middle column - Messaging System */}
          <div className="w-1/3 border-r border-gray-200 overflow-hidden flex flex-col">
            <ChatArea 
              activeChat={activeChat} 
              onSendFirstMessage={handleSendFirstMessage}
              onTradeCompleted={handleTradeCompleted}
            />
          </div>
          
          {/* Right column - Blank */}
          <div className="w-1/3 bg-gray-50">
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Blank column</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TestMessages;
