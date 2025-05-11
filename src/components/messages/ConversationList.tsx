
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  exchangePairs?: Array<{
    id: number;
    partnerId: string;
    item1: { name: string; image: string };
    item2: { name: string; image: string };
  }>;
}

const ConversationList = ({ 
  conversations, 
  activeConversation, 
  setActiveConversation,
  exchangePairs = []
}: ConversationListProps) => {
  return (
    <>
      <div className="p-4 border-b border-gray-200 flex items-center sticky top-0 bg-white z-10">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Search messages..." 
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="h-[calc(100vh-130px)]">
        {conversations.map((conversation) => {
          // Find the exchange pair for this conversation if it exists
          const exchangePair = exchangePairs.find(pair => pair.partnerId === conversation.id);
          
          return (
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
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{conversation.name}</h3>
                      
                      {/* Item indicators next to person's name */}
                      {exchangePair && (
                        <div className="flex items-center space-x-0.5 ml-1">
                          <div className="relative">
                            <Avatar className="h-6 w-6 bg-gray-100">
                              <AvatarImage src={exchangePair.item1.image} alt={exchangePair.item1.name} />
                              <AvatarFallback className="text-xs">{exchangePair.item1.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 flex items-center justify-center bg-blue-100 rounded-full">
                              <span className="font-bold text-[8px] text-blue-700">C</span>
                            </div>
                          </div>
                          <span className="text-gray-400 text-xs mx-0.5">↔</span>
                          <div className="relative">
                            <Avatar className="h-6 w-6 bg-gray-100">
                              <AvatarImage src={exchangePair.item2.image} alt={exchangePair.item2.name} />
                              <AvatarFallback className="text-xs">{exchangePair.item2.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 flex items-center justify-center bg-gray-200 rounded-full">
                              <span className="font-bold text-[8px] text-gray-600">B</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{conversation.time}</span>
                  </div>
                  
                  {/* Display exchange pair info if available */}
                  {exchangePair && conversation.isNew && (
                    <div className="flex items-center text-xs text-blue-600 mb-1">
                      <span className="truncate">{exchangePair.item1.name}</span>
                      <span className="mx-1">↔</span>
                      <span className="truncate">{exchangePair.item2.name}</span>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ConversationList;
