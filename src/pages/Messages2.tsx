
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import MessagesLayout from '@/components/messages/MessagesLayout';
import { useConversations } from '@/hooks/useConversations';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

const Messages2 = () => {
  const navigate = useNavigate();
  const {
    conversations,
    activeConversation,
    setActiveConversation,
    activeChat,
    selectedPair,
    dynamicExchangePairs,
    selectedPairId,
    handlePairSelect,
    handleSendFirstMessage,
    handleTradeCompleted
  } = useConversations();

  // Wrapper for trade completion that adds navigation
  const handleTradeCompletedWithRedirect = (conversationId: string) => {
    handleTradeCompleted(conversationId);
    
    // Simulate a delay before redirecting to profile
    setTimeout(() => {
      toast.success("Trade completed! Redirecting to your profile to leave a review...");
      
      // In a real app, we would redirect after a short delay
      setTimeout(() => {
        navigate('/profile-duplicate');
      }, 2000);
    }, 1000);
  };

  return (
    <MainLayout>
      <MessagesLayout 
        exchangePairs={dynamicExchangePairs}
        selectedPairId={selectedPairId}
        onPairSelect={handlePairSelect}
        conversations={conversations}
        activeConversation={activeConversation}
        setActiveConversation={setActiveConversation}
        activeChat={activeChat}
        selectedPair={selectedPair}
        onSendFirstMessage={handleSendFirstMessage}
        onTradeCompleted={handleTradeCompletedWithRedirect}
      />
    </MainLayout>
  );
};

export default Messages2;
