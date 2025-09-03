
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useIsTablet } from '@/hooks/use-tablet';
import ConversationList from '@/components/messages/ConversationList';
import ChatArea from '@/components/messages/ChatArea';
import DetailsPanel from '@/components/messages/details/DetailsPanel';
import { ExchangePairDisplay, ConversationDisplay } from '@/hooks/useTradeConversations';

interface MessagesLayoutProps {
  exchangePairs: ExchangePairDisplay[];
  selectedPairId: number | null;
  onPairSelect: (partnerId: string, pairId: number) => void;
  conversations: ConversationDisplay[];
  activeConversation: string | null;
  setActiveConversation: (id: string) => void;
  activeChat: ConversationDisplay;
  selectedPair: ExchangePairDisplay | undefined;
  onSendFirstMessage: (conversationId: string) => void;
  onTradeCompleted: (conversationId: string) => void;
}

const MessagesLayout: React.FC<MessagesLayoutProps> = ({
  exchangePairs,
  selectedPairId,
  onPairSelect,
  conversations,
  activeConversation,
  setActiveConversation,
  activeChat,
  selectedPair,
  onSendFirstMessage,
  onTradeCompleted
}) => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const [currentView, setCurrentView] = useState<'conversations' | 'chat' | 'details'>('conversations');
  const [showDetails, setShowDetails] = useState(false);

  console.log('🖥️ MESSAGES LAYOUT DEBUG:', { 
    isMobile, 
    isTablet, 
    currentView, 
    activeConversation, 
    windowWidth: typeof window !== 'undefined' ? window.innerWidth : 'unknown',
    shouldUseMobileLayout: isMobile || isTablet
  });

  // Keep conversations view as default on mobile/tablet
  // Remove auto-switch to chat - user stays on conversation list

  const handleBackToConversations = () => {
    setCurrentView('conversations');
    setActiveConversation('');
  };

  const handleShowDetails = () => {
    if (isMobile || isTablet) {
      setCurrentView('details');
    } else {
      setShowDetails(!showDetails);
    }
  };

  const handleBackToChat = () => {
    setCurrentView('chat');
  };

  if (isMobile || isTablet) {
    return (
      <div className="flex flex-col h-full">{/* Use full height for mobile/tablet */}
        {/* Mobile/Tablet Header */}
        {currentView === 'chat' && activeChat && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBackToConversations}
                className="p-1"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <span className="font-medium">{activeChat.name}</span>
            </div>
            {selectedPair && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleShowDetails}
                className="p-1"
              >
                <Info className="h-5 w-5" />
              </Button>
            )}
          </div>
        )}

        {currentView === 'details' && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBackToChat}
                className="p-1"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <span className="font-medium">Trade Details</span>
            </div>
          </div>
        )}

        {/* Mobile Content */}
        <div className="flex-1 overflow-hidden">
          {currentView === 'conversations' && (
            <ConversationList 
              conversations={conversations}
              activeConversation={activeConversation}
              setActiveConversation={(id) => {
                setActiveConversation(id);
                setCurrentView('chat'); // Only switch to chat when user clicks a conversation
              }}
              exchangePairs={exchangePairs}
            />
          )}
          
          {currentView === 'chat' && (
            <ChatArea 
              activeChat={activeChat} 
              onSendFirstMessage={onSendFirstMessage}
              onTradeCompleted={onTradeCompleted}
            />
          )}
          
          {currentView === 'details' && (
            <ScrollArea className="h-full bg-gray-50">
              <DetailsPanel selectedPair={selectedPair} />
            </ScrollArea>
          )}
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="flex h-full overflow-hidden">
      {/* Left sidebar - Conversations */}
      <div className="w-[350px] border-r border-gray-200 flex flex-col min-h-0">
        <ConversationList 
          conversations={conversations}
          activeConversation={activeConversation}
          setActiveConversation={setActiveConversation}
          exchangePairs={exchangePairs}
        />
      </div>
      
      {/* Middle - Chat area */}
      <div className="flex-1 flex flex-col min-h-0">
        <ChatArea 
          activeChat={activeChat} 
          onSendFirstMessage={onSendFirstMessage}
          onTradeCompleted={onTradeCompleted}
        />
      </div>
      
      {/* Right sidebar - Details panel */}
      <div className="w-80 border-l border-gray-200 flex flex-col min-h-0 bg-gray-50">
        <ScrollArea className="flex-1">
          <DetailsPanel selectedPair={selectedPair} />
        </ScrollArea>
      </div>
    </div>
  );
};

export default MessagesLayout;
