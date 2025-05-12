
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Conversation } from '@/data/conversations';
import { toast } from 'sonner';
import { getMessagesByChatId } from '@/utils/messageData';
import NewMatchPrompt from './NewMatchPrompt';
import MessageList from './MessageList';

interface MessageDisplayProps {
  activeChat: Conversation;
  onSendFirstMessage?: (conversationId: string) => void;
}

const MessageDisplay = ({ activeChat, onSendFirstMessage }: MessageDisplayProps) => {
  // Choose the correct message set based on active chat ID
  const messages = getMessagesByChatId(activeChat.id);
  
  const handleSendFirstMessage = () => {
    if (onSendFirstMessage) {
      onSendFirstMessage(activeChat.id);
      toast(`First message sent to ${activeChat.name}`);
    }
  };

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col overflow-hidden">
      {activeChat.isNew ? (
        <NewMatchPrompt 
          name={activeChat.name} 
          onSendFirstMessage={handleSendFirstMessage} 
          conversationId={activeChat.id} 
        />
      ) : (
        <MessageList 
          messages={messages} 
          chatName={activeChat.name} 
        />
      )}
    </div>
  );
};

export default MessageDisplay;
