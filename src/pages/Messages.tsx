
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ConversationList from '@/components/messages/ConversationList';
import ChatArea from '@/components/messages/ChatArea';
import DetailsPanel from '@/components/messages/DetailsPanel';
import { mockConversations } from '@/data/conversations';
import { ArrowLeftRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Messages = () => {
  const [activeConversation, setActiveConversation] = useState<string | null>("1");
  
  const activeChat = mockConversations.find(conv => conv.id === activeConversation);

  // Mock items for the exchange
  const exchangeItems = [
    { id: 1, name: "Blender", image: "/placeholder.svg" },
    { id: 2, name: "Stand Mixer", image: "/placeholder.svg" }
  ];

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-64px)]">
        {/* Item exchange row at the top */}
        <div className="w-full py-3 border-b border-gray-200">
          <div className="flex items-center justify-center gap-4">
            {/* First item */}
            <div className="flex flex-col items-center cursor-pointer">
              <Avatar className="h-16 w-16 bg-gray-100">
                <AvatarImage src={exchangeItems[0].image} alt={exchangeItems[0].name} />
                <AvatarFallback>{exchangeItems[0].name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm mt-1 text-gray-700">{exchangeItems[0].name}</span>
            </div>

            {/* Exchange icon */}
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
              <ArrowLeftRight className="h-5 w-5 text-blue-600" />
            </div>

            {/* Second item */}
            <div className="flex flex-col items-center cursor-pointer">
              <Avatar className="h-16 w-16 bg-gray-100">
                <AvatarImage src={exchangeItems[1].image} alt={exchangeItems[1].name} />
                <AvatarFallback>{exchangeItems[1].name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm mt-1 text-gray-700">{exchangeItems[1].name}</span>
            </div>
          </div>
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
          <DetailsPanel />
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages;
