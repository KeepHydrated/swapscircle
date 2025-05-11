
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ConversationList from '@/components/messages/ConversationList';
import ChatArea from '@/components/messages/ChatArea';
import DetailsPanel from '@/components/messages/DetailsPanel';
import { mockConversations } from '@/data/conversations';

const Messages = () => {
  const [activeConversation, setActiveConversation] = useState<string | null>("1");
  
  const activeChat = mockConversations.find(conv => conv.id === activeConversation);

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-64px)]">
        {/* Conversations sidebar */}
        <ConversationList 
          conversations={mockConversations}
          activeConversation={activeConversation}
          setActiveConversation={setActiveConversation}
        />
        
        {/* Chat area */}
        <ChatArea activeChat={activeChat} />
        
        {/* Details panel */}
        <DetailsPanel />
      </div>
    </MainLayout>
  );
};

export default Messages;
