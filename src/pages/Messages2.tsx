
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import MessagesLayout from '@/components/messages/MessagesLayout';
import { useConversations } from '@/hooks/useConversations';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

const Messages2 = () => {
  const navigate = useNavigate();
  const [showReview, setShowReview] = useState(false);
  
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
    setShowReview(true);
    
    // Simulate a delay before redirecting to profile
    setTimeout(() => {
      toast.success("Trade completed! Redirecting to your profile to leave a review...");
      
      // In a real app, we would redirect after a short delay
      setTimeout(() => {
        navigate('/profile-duplicate');
      }, 2000);
    }, 5000);
  };

  return (
    <MainLayout>
      {showReview && (
        <div className="mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-xl">
                <Star className="h-5 w-5 text-yellow-500 mr-2" fill="#FFD700" />
                Trade Completed!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Your trade with {activeChat?.name} was successful. Please leave a review for your trading partner.</p>
              <div className="flex mt-4 space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star}
                    className="h-6 w-6 cursor-pointer hover:text-yellow-500 transition-colors"
                    onClick={() => {
                      toast.success(`You rated this trade ${star} stars!`);
                      setTimeout(() => setShowReview(false), 1000);
                    }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
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
