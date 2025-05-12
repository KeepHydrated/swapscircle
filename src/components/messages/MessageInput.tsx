
import React, { useState } from 'react';
import { Paperclip, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const MessageInput = () => {
  const [messageInput, setMessageInput] = useState("");

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // Here you would normally send the message to your backend
      // For now we'll just clear the input
      setMessageInput("");
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-200 w-full">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Paperclip className="h-5 w-5" />
        </Button>
        <Input 
          placeholder="Type a message..." 
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
        />
        <Button 
          onClick={handleSendMessage}
          disabled={!messageInput.trim()}
          size="icon"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
