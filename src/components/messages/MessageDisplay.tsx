
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Conversation } from '@/data/conversations';

interface MessageDisplayProps {
  activeChat: Conversation;
}

const MessageDisplay = ({ activeChat }: MessageDisplayProps) => {
  return (
    <ScrollArea className="flex-1 p-4">
      <div className="flex justify-center my-8">
        <p className="text-blue-500">{activeChat.lastMessage}</p>
      </div>
      
      {/* Product card for new matches */}
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
  );
};

export default MessageDisplay;
