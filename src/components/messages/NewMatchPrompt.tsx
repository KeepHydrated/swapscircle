
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface NewMatchPromptProps {
  name: string;
  onSendFirstMessage: (conversationId: string) => void;
  conversationId: string;
}

const NewMatchPrompt = ({ 
  name, 
  onSendFirstMessage, 
  conversationId 
}: NewMatchPromptProps) => {
  const handleSendFirstMessage = () => {
    onSendFirstMessage(conversationId);
  };

  return (
    <div className="flex flex-col items-center my-8 gap-4">
      <p className="text-gray-600">You've matched with {name}!</p>
      <p className="text-blue-500 font-medium">Start the conversation about this potential exchange</p>
      <Button 
        onClick={handleSendFirstMessage}
        className="flex items-center gap-2"
      >
        <MessageCircle className="h-4 w-4" />
        Send First Message
      </Button>
    </div>
  );
};

export default NewMatchPrompt;
