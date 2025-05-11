
import React, { useState } from 'react';
import { Paperclip, Send, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

type Conversation = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  avatar?: string;
  rating?: number;
  isNew?: boolean;
  distance?: string;
};

interface ChatAreaProps {
  activeChat: Conversation | undefined;
}

const ChatArea = ({ activeChat }: ChatAreaProps) => {
  const [messageInput, setMessageInput] = useState("");

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // Here you would normally send the message to your backend
      // For now we'll just clear the input
      setMessageInput("");
    }
  };

  if (!activeChat) {
    return (
      <div className="hidden md:flex flex-col flex-1">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden md:flex flex-col flex-1">
      {/* Chat header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-purple-100 text-purple-800">
              {activeChat.name.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center">
              <h2 className="font-medium">{activeChat.name}</h2>
              {activeChat.rating && (
                <div className="ml-2 flex text-yellow-400">
                  {"★".repeat(activeChat.rating)}
                  <span className="ml-1 text-gray-500 text-sm">({42})</span>
                </div>
              )}
            </div>
            {activeChat.distance && (
              <p className="text-sm text-gray-500 flex items-center">
                <span className="mr-2">📍 {activeChat.distance}</span>
                {activeChat.isNew && <span>• New match</span>}
              </p>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Chat messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="flex justify-center my-8">
          <p className="text-blue-500">{activeChat.lastMessage}</p>
        </div>
        
        {/* This section would contain the actual messages */}
        {activeChat.id === "1" && (
          <Card className="mx-auto max-w-lg p-4 mb-8">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold">Blender</h3>
            </div>
            <div className="bg-gray-100 rounded-md h-48 mb-4 flex items-center justify-center">
              <span className="text-gray-400 text-lg">Product Image</span>
            </div>
            <p className="text-gray-700">
              This is the item you'll be trading away. It's currently listed for exchange with your trading partner.
            </p>
          </Card>
        )}
      </ScrollArea>
      
      {/* Message input */}
      <div className="p-4 border-t border-gray-200">
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
    </div>
  );
};

export default ChatArea;
