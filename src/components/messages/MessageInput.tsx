
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
      
      toast.success("Trade has been completed! You can now leave a review in your Completed Trades tab.");
    }, 3000);
  };

  return (
    <div className="p-3 bg-white border-t border-gray-200 w-full">
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant={pendingCompletion ? "secondary" : "ghost"} 
              size="icon" 
              className={`shrink-0 ${tradeCompleted ? "bg-green-100 text-green-700" : ""}`}
              disabled={tradeCompleted || pendingCompletion}
            >
              <Check className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4">
            <div className="space-y-2">
              <h4 className="font-medium">Complete this Trade?</h4>
              <p className="text-sm text-muted-foreground">
                Mark this trade as completed. The other party will need to confirm.
              </p>
              <div className="flex justify-end gap-2">
                <Button 
                  onClick={handleMarkAsCompleted} 
                  disabled={tradeCompleted || pendingCompletion}
                >
                  {tradeCompleted ? "Completed" : "Mark as Complete"}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
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
      
      {tradeCompleted && (
        <div className="mt-2 bg-green-50 text-green-700 p-2 rounded-md text-xs flex items-center">
          <Check className="h-4 w-4 mr-1" />
          This trade has been completed! You can leave a review in your profile.
        </div>
      )}
      
      {pendingCompletion && (
        <div className="mt-2 bg-yellow-50 text-yellow-700 p-2 rounded-md text-xs flex items-center">
          <Check className="h-4 w-4 mr-1" />
          Waiting for the other party to confirm trade completion...
        </div>
      )}
    </div>
  );
};

export default MessageInput;
