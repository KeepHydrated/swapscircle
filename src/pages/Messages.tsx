import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { useTradeConversations } from '@/hooks/useTradeConversations';
import { fetchTradeMessages, sendTradeMessage } from '@/services/tradeService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MapPin, Clock } from 'lucide-react';
import TradeDetailsTabs from '@/components/messages/details/TradeDetailsTabs';
import MessageInput from '@/components/messages/MessageInput';

const Messages = () => {
  const {
    conversations,
    exchangePairs,
    activeConversation,
    setActiveConversation,
    activeChat,
    selectedPair,
    selectedPairId,
    handlePairSelect,
    handleSendFirstMessage,
    handleTradeCompleted,
    loading
  } = useTradeConversations();

  const [messageText, setMessageText] = useState('');
  const [selectedItem, setSelectedItem] = useState<'item1' | 'item2'>('item1');
  const queryClient = useQueryClient();

  // Fetch messages for active conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['trade-messages', activeConversation],
    queryFn: () => activeConversation ? fetchTradeMessages(activeConversation) : Promise.resolve([]),
    enabled: !!activeConversation,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ conversationId, message }: { conversationId: string; message: string }) =>
      sendTradeMessage(conversationId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trade-messages', activeConversation] });
      setMessageText('');
      toast({
        title: "Message sent!",
        description: "Your message has been sent successfully.",
      });
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
      });
    },
  });

  const handleSendMessage = () => {
    if (!messageText.trim() || !activeConversation) return;
    
    sendMessageMutation.mutate({
      conversationId: activeConversation,
      message: messageText.trim()
    });
  };

  const handleSelectItem = (item: 'item1' | 'item2') => {
    setSelectedItem(item);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex justify-center items-center flex-1">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <Header />
      
      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">        
        {/* Left sidebar - Conversations */}
        <div className="w-[350px] border-r border-gray-200 flex flex-col">
          {conversations.length > 0 ? (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-gray-200 bg-white flex items-center flex-shrink-0">
                <h2 className="font-semibold">Trade Conversations</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {conversations.map((conversation) => {
                  const exchangePair = exchangePairs.find(pair => pair.partnerId === conversation.id);
                  
                  return (
                    <div 
                      key={conversation.id}
                      className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${activeConversation === conversation.id ? 'bg-gray-50' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        alert(`Clicked conversation: ${conversation.id}`);
                        console.log('Conversation clicked:', conversation.id);
                        setActiveConversation(conversation.id);
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-purple-800 font-medium text-sm">
                            {conversation.name.substring(0, 2)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <div className="font-medium truncate">
                              {conversation.name}
                            </div>
                            <span className="text-xs text-gray-500 flex-shrink-0">{conversation.time}</span>
                          </div>
                          
                          {exchangePair && (
                            <div className="flex items-center mb-1 text-xs">
                              <span className="truncate text-gray-900 max-w-[80px] inline-block">{exchangePair.item1.name}</span>
                              <span className="mx-1 text-blue-600">↔</span>
                              <span className="truncate text-gray-900 max-w-[80px] inline-block">{exchangePair.item2.name}</span>
                            </div>
                          )}
                          
                          <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-500">No conversations yet</p>
                <p className="text-sm text-gray-400 mt-2">Start trading to begin conversations!</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Middle - Chat area */}
        <div className="flex-1 flex flex-col">
          {activeConversation ? (
            <>
              {/* Partner information header */}
              <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
                <div className="flex items-center">
                  <Link to={`/other-profile/${activeChat.otherUserProfile?.id}`}>
                    <Avatar className="h-8 w-8 mr-3 hover:ring-2 hover:ring-blue-300 transition-all cursor-pointer">
                      <AvatarImage src={activeChat.otherUserProfile?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&h=250&auto=format&fit=crop"} />
                      <AvatarFallback>{(activeChat.otherUserProfile?.username || activeChat.name).substring(0, 2)}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <Link 
                          to={`/other-profile/${activeChat.otherUserProfile?.id}`}
                          className="text-sm font-semibold hover:text-blue-600 transition-colors"
                        >
                          {activeChat.otherUserProfile?.username || activeChat.name}
                        </Link>
                        <div className="flex text-amber-400 text-xs">★★★★★ <span className="text-gray-500 ml-1">(42)</span></div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Since {activeChat.otherUserProfile?.created_at ? new Date(activeChat.otherUserProfile.created_at).getFullYear() : 2023}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{activeChat.otherUserProfile?.location || "2.3 mi away"}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>~1 hour</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 min-h-0">
                {messagesLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message: any) => (
                      <div key={message.id} className="flex flex-col">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-800 font-medium text-xs">
                              {message.sender_profile?.name?.substring(0, 2) || 'U'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="bg-white rounded-lg p-3 shadow-sm">
                              <p className="text-sm">{message.message}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(message.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Trade conversation started!</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Send a message to start the conversation.
                    </p>
                  </div>
                )}
              </div>
              
              {/* Message input */}
              <div className="flex-shrink-0">
                <MessageInput 
                  onMarkCompleted={() => handleTradeCompleted(activeConversation)}
                  conversationId={activeConversation}
                />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
        
        {/* Right sidebar - Details panel with tabs */}
        <div className="w-80 border-l border-gray-200 bg-gray-50 flex-shrink-0">
          {selectedPair ? (
            <TradeDetailsTabs 
              selectedPair={selectedPair}
              selectedItem={selectedItem}
              onSelectItem={handleSelectItem}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-center">
                Select a trade conversation<br />
                to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
