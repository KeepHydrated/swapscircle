
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Conversation } from '@/data/conversations';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface MessageDisplayProps {
  activeChat: Conversation;
  onSendFirstMessage?: (conversationId: string) => void;
}

const MessageDisplay = ({ activeChat, onSendFirstMessage }: MessageDisplayProps) => {
  const handleSendFirstMessage = () => {
    if (onSendFirstMessage) {
      onSendFirstMessage(activeChat.id);
      toast(`First message sent to ${activeChat.name}`);
    }
  };

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="flex flex-col items-center my-8 gap-4">
        {activeChat.isNew && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-gray-600">You've matched with {activeChat.name}!</p>
            <p className="text-blue-500 font-medium">Start the conversation about this potential exchange</p>
            <Button 
              onClick={handleSendFirstMessage}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Send First Message
            </Button>
          </div>
        )}
        {!activeChat.isNew && (
          <p className="text-gray-500">{activeChat.lastMessage}</p>
        )}
      </div>
    </ScrollArea>
  );
};

export default MessageDisplay;
