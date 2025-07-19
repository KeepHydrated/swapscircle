
import React from 'react';
import { ConversationDisplay } from '@/hooks/useTradeConversations';
import ChatHeader from './ChatHeader';
import MessageDisplay from './MessageDisplay';
import MessageInput from './MessageInput';

interface ChatAreaProps {
  activeChat: ConversationDisplay | undefined;
  onSendFirstMessage?: (conversationId: string) => void;
  onTradeCompleted?: (conversationId: string) => void;
}

const ChatArea = ({ activeChat, onSendFirstMessage, onTradeCompleted }: ChatAreaProps) => {
  console.log('ChatArea DEBUG - activeChat:', activeChat);
  if (!activeChat) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  const handleTradeCompleted = () => {
    if (activeChat && onTradeCompleted) {
      onTradeCompleted(activeChat.id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Fixed header */}
      <ChatHeader activeChat={activeChat} showProfileInfo={true} />
      
      {/* Scrollable message area with reduced height */}
      <div className="flex-1 overflow-hidden">
        <MessageDisplay 
          activeChat={activeChat} 
          onSendFirstMessage={onSendFirstMessage}
        />
      </div>
      
      {/* Fixed input area at the bottom */}
      <div className="flex-shrink-0">
        <MessageInput 
          onMarkCompleted={handleTradeCompleted} 
          conversationId={activeChat.id} 
        />
      </div>
    </div>
  );
};

export default ChatArea;
