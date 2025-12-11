
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info, MessageSquare } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useIsTablet } from '@/hooks/use-tablet';
import ConversationList from '@/components/messages/ConversationList';
import ChatArea from '@/components/messages/ChatArea';
import DetailsPanel from '@/components/messages/details/DetailsPanel';
import { ExchangePairDisplay, ConversationDisplay } from '@/hooks/useTradeConversations';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import MessageDisplay from './MessageDisplay';
import MessageInput from './MessageInput';

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
  const [rightPanelView, setRightPanelView] = useState<'chat' | 'details'>('details');

  console.log('🖥️ MESSAGES LAYOUT DEBUG:', { 
    isMobile, 
    isTablet, 
    currentView, 
    activeConversation, 
    windowWidth: typeof window !== 'undefined' ? window.innerWidth : 'unknown',
    shouldUseMobileLayout: isMobile || isTablet
  });

  const handleBackToConversations = () => {
    setCurrentView('conversations');
    setActiveConversation('');
  };

  const handleShowDetails = () => {
    if (isMobile || isTablet) {
      setCurrentView('details');
    }
  };

  const handleBackToChat = () => {
    setCurrentView('chat');
  };

  const handleTradeCompleted = () => {
    if (activeChat && onTradeCompleted) {
      onTradeCompleted(activeChat.id);
    }
  };

  // Mobile/Tablet layout - same as before
  if (isMobile || isTablet) {
    return (
      <div className="flex flex-col h-full">
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
                setCurrentView('chat');
                
                setTimeout(() => {
                  const containers = document.querySelectorAll('[data-messages-container]');
                  containers.forEach((container) => {
                    if (container instanceof HTMLElement) {
                      container.scrollTop = container.scrollHeight;
                    }
                  });
                }, 300);
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

  // Desktop layout - 2 columns with toggleable right panel
  const profile = activeChat?.otherUserProfile;
  const profileName = profile?.username || activeChat?.name || '';
  const avatarUrl = profile?.avatar_url;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left sidebar - Conversations (always visible) */}
      <div className="w-[200px] border-r border-gray-200 flex flex-col min-h-0">
        <ConversationList 
          conversations={conversations}
          activeConversation={activeConversation}
          setActiveConversation={setActiveConversation}
          exchangePairs={exchangePairs}
        />
      </div>
      
      {/* Right side - Combined chat/details area */}
      <div className="flex-1 flex flex-col min-h-0 bg-white">
        {activeChat ? (
          <>
            {/* Header with user info and toggle buttons */}
            <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Link to={`/other-person-profile?userId=${profile?.id}`}>
                    <Avatar className="h-10 w-10 cursor-pointer">
                      <AvatarImage src={avatarUrl} alt={profileName} />
                      <AvatarFallback>
                        {profileName.substring(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <Link to={`/other-person-profile?userId=${profile?.id}`} className="hover:underline">
                    <h2 className="font-semibold text-lg">{profileName}</h2>
                  </Link>
                </div>
                
                {/* Toggle buttons */}
                <div className="flex items-center gap-1">
                  <Button 
                    variant={rightPanelView === 'chat' ? 'default' : 'ghost'} 
                    size="icon"
                    onClick={() => setRightPanelView('chat')}
                    className={rightPanelView === 'chat' ? 'bg-primary text-primary-foreground' : ''}
                  >
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant={rightPanelView === 'details' ? 'default' : 'ghost'} 
                    size="icon"
                    onClick={() => setRightPanelView('details')}
                    className={rightPanelView === 'details' ? 'bg-primary text-primary-foreground' : ''}
                  >
                    <Info className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Content area - toggles between chat and details */}
            {rightPanelView === 'chat' ? (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-hidden">
                  <MessageDisplay 
                    activeChat={activeChat} 
                    onSendFirstMessage={onSendFirstMessage}
                  />
                </div>
                <div className="flex-shrink-0">
                  <MessageInput 
                    onMarkCompleted={handleTradeCompleted} 
                    conversationId={activeChat.id} 
                  />
                </div>
              </div>
            ) : (
              <ScrollArea className="flex-1 bg-gray-50">
                <DetailsPanel selectedPair={selectedPair} />
              </ScrollArea>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesLayout;
