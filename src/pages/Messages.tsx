
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ConversationList from '@/components/messages/ConversationList';
import ChatArea from '@/components/messages/ChatArea';
import DetailsPanel from '@/components/messages/DetailsPanel';
import { mockConversations } from '@/data/conversations';
import { Card } from '@/components/ui/card';
import { Exchange } from 'lucide-react';

const Messages = () => {
  const [activeConversation, setActiveConversation] = useState<string | null>("1");
  
  const activeChat = mockConversations.find(conv => conv.id === activeConversation);

  // Mock data for matched items
  const matchedItems = [
    { id: "1", name: "Blender" },
    { id: "2", name: "Stand Mixer" },
    { id: "3", name: "Toaster" },
    { id: "4", name: "Coffee Maker" },
  ];

  return (
    <MainLayout>
      {/* Matched Items Row */}
      <div className="overflow-x-auto pb-4 border-b border-gray-200">
        <div className="flex space-x-4 px-4 py-2">
          {matchedItems.map((item) => (
            <Card 
              key={item.id} 
              className={`flex flex-col items-center p-3 min-w-[120px] cursor-pointer hover:bg-gray-50 ${activeConversation === item.id ? 'border-blue-500 bg-blue-50' : ''}`}
              onClick={() => setActiveConversation(item.id)}
            >
              <div className="bg-gray-100 w-16 h-16 rounded-md flex items-center justify-center mb-2">
                <span className="text-gray-400 text-xs">Item</span>
              </div>
              <span className="text-sm font-medium">{item.name}</span>
              {item.id !== matchedItems[matchedItems.length - 1].id && (
                <div className="absolute -right-6 top-1/2 transform -translate-y-1/2">
                  <Exchange className="text-blue-500 bg-blue-100 rounded-full p-1 w-8 h-8" />
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      <div className="flex h-[calc(100vh-140px)]">
        {/* Chat area */}
        <ChatArea activeChat={activeChat} />
        
        {/* Details panel */}
        <DetailsPanel />
      </div>
    </MainLayout>
  );
};

export default Messages;
