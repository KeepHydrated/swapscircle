
import React from 'react';
import { Conversation } from '@/data/conversations';
import ChatHeader from './ChatHeader';
import MessageDisplay from './MessageDisplay';
import MessageInput from './MessageInput';

interface ChatAreaProps {
  activeChat: Conversation | undefined;
}

const ChatArea = ({ activeChat }: ChatAreaProps) => {
  if (!activeChat) {
    return (
      <div className="flex flex-col flex-1">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <ChatHeader activeChat={activeChat} />
      <div className="flex-1">
        <MessageDisplay activeChat={activeChat} />
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatArea;
