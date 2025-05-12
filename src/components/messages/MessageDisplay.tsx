
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Conversation } from '@/data/conversations';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MessageDisplayProps {
  activeChat: Conversation;
  onSendFirstMessage?: (conversationId: string) => void;
}

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'other';
  timestamp: string;
}

const MessageDisplay = ({ activeChat, onSendFirstMessage }: MessageDisplayProps) => {
  // Sample messages for demonstration
  const sampleMessages: ChatMessage[] = [
    {
      id: '1',
      content: "Hi there! I'm interested in trading my item for yours. Is it still available?",
      sender: 'user',
      timestamp: '10:30 AM'
    },
    {
      id: '2',
      content: "Hello! Yes, it's still available. I'd be happy to discuss a trade.",
      sender: 'other',
      timestamp: '10:32 AM'
    },
    {
      id: '3',
      content: "Great! What condition is your item in? I've had mine for about 3 months and it's practically new.",
      sender: 'user',
      timestamp: '10:35 AM'
    },
    {
      id: '4',
      content: "It's in excellent condition. I've only used it a few times. Would you be open to meeting somewhere to exchange?",
      sender: 'other',
      timestamp: '10:38 AM'
    },
    {
      id: '5',
      content: "Absolutely! There's a coffee shop downtown that would be perfect. How about this weekend?",
      sender: 'user',
      timestamp: '10:40 AM'
    },
    {
      id: '6',
      content: "This weekend works for me. Saturday around 2pm?",
      sender: 'other',
      timestamp: '10:42 AM'
    },
    {
      id: '7',
      content: "Perfect! I'll see you then. Looking forward to the exchange!",
      sender: 'user',
      timestamp: '10:45 AM'
    },
    {
      id: '8',
      content: "Great! Looking forward to it as well. I'll bring the item in its original packaging.",
      sender: 'other',
      timestamp: '10:47 AM'
    }
  ];

  const handleSendFirstMessage = () => {
    if (onSendFirstMessage) {
      onSendFirstMessage(activeChat.id);
      toast(`First message sent to ${activeChat.name}`);
    }
  };

  return (
    <ScrollArea className="flex-1 p-4 bg-white">
      {activeChat.isNew ? (
        <div className="flex flex-col items-center my-8 gap-4">
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
      ) : (
        <div className="flex flex-col gap-4 py-4">
          <p className="text-xs text-center text-gray-500 my-2">Today</p>
          
          {sampleMessages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end gap-2 max-w-[70%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {message.sender === 'other' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-purple-100 text-purple-800">
                      {activeChat.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`rounded-2xl px-4 py-2 ${
                  message.sender === 'user' 
                    ? 'bg-blue-500 text-white rounded-tr-none' 
                    : 'bg-gray-100 text-gray-800 rounded-tl-none'
                }`}>
                  <p>{message.content}</p>
                </div>
              </div>
            </div>
          ))}
          
          <div className="flex justify-end">
            <div className="text-xs text-gray-500 mt-1 mr-2">
              Delivered
            </div>
          </div>
        </div>
      )}
    </ScrollArea>
  );
};

export default MessageDisplay;
