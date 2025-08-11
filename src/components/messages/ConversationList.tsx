
import React, { useEffect } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { ConversationDisplay, ExchangePairDisplay } from '@/hooks/useTradeConversations';

interface ConversationListProps {
  conversations: ConversationDisplay[];
  activeConversation: string | null;
  setActiveConversation: (id: string) => void;
  exchangePairs?: ExchangePairDisplay[];
}

const ConversationList = ({ 
  conversations, 
  activeConversation, 
  setActiveConversation,
  exchangePairs = []
}: ConversationListProps) => {
  // Debug: Log conversation data when it changes
  useEffect(() => {
    console.log('ConversationList conversations:', conversations);
    conversations.forEach((conv, index) => {
      console.log(`Conversation ${index}:`, conv);
      console.log(`Avatar URL for ${conv.name}:`, (conv as any).otherUserProfile?.avatar_url);
    });
  }, [conversations]);

  return (
    <>
      {/* Fixed height header with consistent padding and styling */}
      <div className="p-4 border-b border-gray-200 flex items-center bg-white z-10 h-16">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Search messages..." 
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="h-[calc(100vh-130px)] overflow-y-auto">
        {conversations.map((conversation) => {
          // Find the exchange pair for this conversation if it exists
          const exchangePair = exchangePairs.find(pair => pair.partnerId === conversation.id);
          
          return (
            <div 
              key={conversation.id}
              className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 relative z-10 ${activeConversation === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
              style={{ pointerEvents: 'auto' }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Conversation clicked:', conversation.id);
                setActiveConversation(conversation.id);
              }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Avatar className="h-12 w-12">
                    <AvatarImage 
                      src={conversation.otherUserProfile?.avatar_url || undefined} 
                      alt={`${conversation.name}'s avatar`} 
                    />
                    <AvatarFallback>
                      {conversation.name.substring(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{conversation.name}</h3>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500 text-xs">★</span>
                        <span className="text-xs text-gray-600">4.5</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">{conversation.time}</span>
                  </div>
                  
                  {/* Exchange item display */}
                  {exchangePair && (
                    <div className="flex items-center mb-1 text-xs">
                      <span className="truncate text-gray-900 max-w-[100px] inline-block">{exchangePair.item1.name}</span>
                      <ArrowRight className="h-3 w-3 mx-1 text-blue-600 flex-shrink-0" />
                      <span className="truncate text-gray-900 max-w-[100px] inline-block">{exchangePair.item2.name}</span>
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
