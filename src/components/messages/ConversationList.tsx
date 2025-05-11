
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

type Conversation = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  avatar?: string;
  rating?: number;
  isNew?: boolean;
  distance?: string;
};

interface ConversationListProps {
  conversations: Conversation[];
  activeConversation: string | null;
  setActiveConversation: (id: string) => void;
}

const ConversationList = ({ 
  conversations, 
  activeConversation, 
  setActiveConversation 
}: ConversationListProps) => {
  return (
    <>
      <div className="p-4 border-b border-gray-200 flex items-center">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Search messages..." 
            className="pl-10"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1 h-[calc(100vh-130px)]">
        {conversations.map((conversation) => (
          <div 
            key={conversation.id}
            className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${activeConversation === conversation.id ? 'bg-gray-50' : ''}`}
            onClick={() => setActiveConversation(conversation.id)}
          >
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-purple-100 text-purple-800">
                  {conversation.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-medium truncate">{conversation.name}</h3>
                  <span className="text-xs text-gray-500">{conversation.time}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>
    </>
  );
};

export default ConversationList;
