
import React from 'react';
import { Conversation } from '@/data/conversations';
import ChatHeader from './ChatHeader';
import MessageDisplay from './MessageDisplay';
import MessageInput from './MessageInput';

interface ChatAreaProps {
  activeChat: Conversation | undefined;
  onSendFirstMessage?: (conversationId: string) => void;
}

const ChatArea = ({ activeChat, onSendFirstMessage }: ChatAreaProps) => {
  if (!activeChat) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader activeChat={activeChat} />
      <div className="flex-1 overflow-y-auto">
        <MessageDisplay 
          activeChat={activeChat} 
          onSendFirstMessage={onSendFirstMessage}
        />
      </div>
      <div className="p-4 border-t">
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatArea;
