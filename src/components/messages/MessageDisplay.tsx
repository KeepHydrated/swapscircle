
import React, { useEffect, useRef } from 'react';
import { ConversationDisplay } from '@/hooks/useTradeConversations';
import { toast } from 'sonner';
import { getMessagesByChatId } from '@/utils/messageData';
import NewMatchPrompt from './NewMatchPrompt';
import MessageList from './MessageList';
import { useIsMobile } from '@/hooks/use-mobile';
import { useIsTablet } from '@/hooks/use-tablet';

interface MessageDisplayProps {
  activeChat: ConversationDisplay;
  onSendFirstMessage?: (conversationId: string) => void;
}

const MessageDisplay = ({ activeChat, onSendFirstMessage }: MessageDisplayProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  
  // Choose the correct message set based on active chat ID
  const messages = getMessagesByChatId(activeChat.id);
  
  const handleSendFirstMessage = () => {
    if (onSendFirstMessage) {
      onSendFirstMessage(activeChat.id);
      toast(`First message sent to ${activeChat.name}`);
    }
  };

  // Set initial position at bottom when chat changes (no animation)
  useEffect(() => {
    requestAnimationFrame(() => {
      const messageContainer = document.querySelector('[data-messages-container]') as HTMLElement;
      if (messageContainer) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }
    });
  }, [activeChat.id]);

  return (
    <div ref={containerRef} className="flex-1 overflow-hidden max-h-[calc(50vh-120px)]">
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
