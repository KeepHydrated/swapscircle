
import React from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

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
                    <h3 className="font-medium truncate">{conversation.name}</h3>
                    <span className="text-xs text-gray-500">{conversation.time}</span>
                  </div>
                  
                  {/* Simplified exchange item display */}
                  {exchangePair && (
                    <div className="flex items-center mb-1 text-xs">
                      <span className="truncate text-gray-900 max-w-[140px]">{exchangePair.item1.name}</span>
                      <ArrowRight className="h-3 w-3 mx-1 text-blue-600 flex-shrink-0" />
                      <span className="truncate text-gray-900 max-w-[140px]">{exchangePair.item2.name}</span>
                      
                      {conversation.isNew && (
                        <Badge variant="outline" className="text-xs ml-2 font-normal flex-shrink-0">
                          {conversation.rating && conversation.rating > 0 ? `$100-$250` : "New"}
                        </Badge>
                      )}
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
