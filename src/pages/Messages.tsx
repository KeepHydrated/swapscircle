
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
      <div className="flex flex-col h-[calc(100vh-64px)]">
        {/* Blank row at the top */}
        <div className="w-full h-12 border-b border-gray-200"></div>
        
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
          <DetailsPanel />
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages;
