
import React from 'react';
import { Conversation } from '@/data/conversations';
import ChatHeader from './ChatHeader';
import MessageDisplay from './MessageDisplay';
import MessageInput from './MessageInput';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ChatAreaProps {
  activeChat: Conversation | undefined;
  onSendFirstMessage?: (conversationId: string) => void;
  onTradeCompleted?: (conversationId: string) => void;
}

const ChatArea = ({ activeChat, onSendFirstMessage, onTradeCompleted }: ChatAreaProps) => {
  const navigate = useNavigate();

  if (!activeChat) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  const handleTradeCompleted = () => {
    if (activeChat && onTradeCompleted) {
      onTradeCompleted(activeChat.id);
      
      // Simulate a delay before redirecting to profile
      setTimeout(() => {
        toast.success("Trade completed! Redirecting to your profile to leave a review...");
        
        // In a real app, we would redirect after a short delay
        setTimeout(() => {
          navigate('/profile-duplicate');
        }, 2000);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Fixed header */}
      <ChatHeader activeChat={activeChat} showProfileInfo={true} />
      
      {/* Scrollable message area that takes available space */}
      <div className="flex-1 overflow-hidden">
        <MessageDisplay 
          activeChat={activeChat} 
          onSendFirstMessage={onSendFirstMessage}
        />
      </div>
      
      {/* Fixed input area at the bottom */}
      <div className="flex-shrink-0">
        <MessageInput 
          onMarkCompleted={handleTradeCompleted} 
          conversationId={activeChat.id} 
        />
      </div>
    </div>
  );
};

export default ChatArea;
