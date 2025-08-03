
import React, { useState } from 'react';
import { Paperclip, Send, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { toast } from 'sonner';

interface MessageInputProps {
  onMarkCompleted?: () => void;
  conversationId?: string;
}

const MessageInput = ({ onMarkCompleted, conversationId }: MessageInputProps = {}) => {
  const [messageInput, setMessageInput] = useState("");
  const [tradeCompleted, setTradeCompleted] = useState(false);
  const [pendingCompletion, setPendingCompletion] = useState(false);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // Here you would normally send the message to your backend
      // For now we'll just clear the input
      setMessageInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMarkAsCompleted = () => {
    setPendingCompletion(true);
    toast.success("Trade marked as pending completion. Waiting for other party to confirm.");
    
    // In a real app, you would notify the other user
    // For demo purposes, we'll simulate the other user confirming after a delay
    setTimeout(() => {
      setTradeCompleted(true);
      setPendingCompletion(false);
      
      if (onMarkCompleted) {
        onMarkCompleted();
      }
      
      toast.success("Trade has been completed! You can now leave a review.");
    }, 3000);
  };

  return (
    <div className="p-3 bg-white border-t border-gray-200 w-full">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="shrink-0">
          <Paperclip className="h-5 w-5" />
        </Button>
        <Input 
          placeholder="Type a message..." 
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          className="flex-1"
          onKeyDown={handleKeyDown}
        />
        <Button 
          onClick={handleSendMessage}
          disabled={!messageInput.trim()}
          size="icon"
          className="shrink-0"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
