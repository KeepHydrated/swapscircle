import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { useTradeConversations } from '@/hooks/useTradeConversations';
import { fetchTradeMessages, sendTradeMessage } from '@/services/tradeService';
import { fetchUserReviews } from '@/services/authService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SupportChat from '@/components/chat/SupportChat';
import { useIsMobile } from '@/hooks/use-mobile';
import { useIsTablet } from '@/hooks/use-tablet';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare, Info, ChevronLeft, ChevronRight, X } from 'lucide-react';

import { Calendar, MapPin, Clock, Star } from 'lucide-react';
import TradeDetailsTabs from '@/components/messages/details/TradeDetailsTabs';
import MessageInput from '@/components/messages/MessageInput';

// Helper to construct selectedPair from demo data for TradeDetailsTabs
const constructDemoPair = (demoData: any) => {
  if (!demoData) return null;
  
  const getItemImage = (item: any) => {
    if (item?.image_urls?.length > 0) return item.image_urls[0];
    if (item?.image_url) return item.image_url;
    if (item?.image) return item.image;
    return '/placeholder.svg';
  };

  return {
    id: 0,
    item1: {
      id: demoData.myItem?.id || 'demo-my-item',
      name: demoData.myItem?.name || 'My Item',
      image: getItemImage(demoData.myItem),
      image_url: demoData.myItem?.image_url,
      image_urls: demoData.myItem?.image_urls,
      description: demoData.myItem?.description,
      category: demoData.myItem?.category,
      condition: demoData.myItem?.condition,
      price_range_min: demoData.myItem?.price_range_min,
      price_range_max: demoData.myItem?.price_range_max,
      tags: demoData.myItem?.tags
    },
    item2: {
      id: demoData.theirItem?.id || 'demo-their-item',
      name: demoData.theirItem?.name || 'Their Item',
      image: getItemImage(demoData.theirItem),
      image_url: demoData.theirItem?.image_url,
      image_urls: demoData.theirItem?.image_urls,
      description: demoData.theirItem?.description,
      category: demoData.theirItem?.category,
      condition: demoData.theirItem?.condition,
      price_range_min: demoData.theirItem?.price_range_min,
      price_range_max: demoData.theirItem?.price_range_max,
      tags: demoData.theirItem?.tags
    },
    partnerId: 'demo-trade',
    partnerProfile: {
      id: demoData.partnerProfile?.id || 'demo-user',
      username: demoData.partnerProfile?.username || 'Demo User',
      avatar_url: demoData.partnerProfile?.avatar_url,
      created_at: demoData.partnerProfile?.created_at || new Date().toISOString(),
      location: demoData.partnerProfile?.location
    }
  };
};

// Force scroll helper for tablet/mobile
const forceScrollToBottom = () => {
  console.log('🔍 FORCE SCROLL: Looking for message containers...');
  
  // Try multiple selectors to find the message container
  const selectors = [
    '[data-messages-container]',
    '.overflow-y-auto.p-4.bg-gray-50',  // The actual container class in Messages.tsx
    '.flex-1.overflow-y-auto.p-4.bg-gray-50',
    '.space-y-4'  // The messages wrapper
  ];
  
  let foundContainer = false;
  
  selectors.forEach((selector, selectorIndex) => {
    const containers = document.querySelectorAll(selector);
    console.log(`📦 FORCE SCROLL: Selector ${selectorIndex} (${selector}): Found ${containers.length} containers`);
    
    containers.forEach((container, index) => {
      if (container instanceof HTMLElement && container.scrollHeight > container.clientHeight) {
        const beforeScroll = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        container.scrollTop = scrollHeight;
        foundContainer = true;
        console.log(`📱 FORCE SCROLL: Scrolled selector ${selectorIndex} container ${index}: before=${beforeScroll}, height=${scrollHeight}, after=${container.scrollTop}`);
      }
    });
  });
  
  if (!foundContainer) {
    console.log('❌ FORCE SCROLL: No scrollable containers found');
  }
};
import TradeMessageBubble from '@/components/messages/TradeMessageBubble';
import TradeRequestMessage from '@/components/messages/TradeRequestMessage';
import { updateTradeAcceptance, rejectTrade, updateTradeStatus, fetchUserTradeConversations } from '@/services/tradeService';

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
    resetSelectedPair,
    loading
  } = useTradeConversations();

  const [messageText, setMessageText] = useState('');
  const [selectedItem, setSelectedItem] = useState<'item1' | 'item2'>('item2');
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const leftListRef = useRef<HTMLDivElement>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const location = useLocation();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const [currentView, setCurrentView] = useState<'conversations' | 'chat'>('conversations');
  const [currentMobileView, setCurrentMobileView] = useState<'messages' | 'details'>('messages');
  
  // Demo trade mode state
  const [isDemoTrade, setIsDemoTrade] = useState(false);
  const [demoTradeData, setDemoTradeData] = useState<any>(null);
  
  // Width detector state
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const showThreeColumns = windowWidth > 1120;
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Handle demo trade from navigation state
  useEffect(() => {
    if (location.state?.demoTrade && location.state?.demoData) {
      setIsDemoTrade(true);
      setDemoTradeData(location.state.demoData);
      // Switch to chat view on mobile/tablet
      if (isMobile || isTablet) {
        setCurrentView('chat');
      }
    }
  }, [location.state, isMobile, isTablet]);

  // Get current user ID and email
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
      setCurrentUserEmail(user?.email || null);
    };
    getCurrentUser();
  }, []);

  // Real-time message updates for active conversation
  useEffect(() => {
    if (!activeConversation || !currentUserId) {
      console.log('Skipping real-time setup:', { activeConversation, currentUserId });
      return;
    }

    console.log('Setting up real-time subscription for trade messages:', activeConversation);

    const channel = supabase
      .channel(`trade_messages_${activeConversation}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${activeConversation}`,
      }, (payload) => {
        console.log('🔥 Real-time INSERT received:', payload);
        const newMessage = payload.new as any;
        
        // Only add messages that are not from the current user (to avoid duplicates from optimistic updates)
        if (newMessage.sender_id !== currentUserId) {
          console.log('Adding new message from other user to cache');
          queryClient.setQueryData(['trade-messages', activeConversation], (old: any[]) => {
            if (!old) return [newMessage];
            
            // Avoid duplicates by checking if message already exists
            const exists = old.some(msg => msg.id === newMessage.id);
            if (exists) {
              console.log('Message already exists, skipping');
              return old;
            }
            
            return [...old, newMessage];
          });
        } else {
          console.log('Skipping own message to avoid duplicate');
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${activeConversation}`,
      }, (payload) => {
        console.log('🔥 Real-time UPDATE received:', payload);
        const updatedMessage = payload.new as any;
        
        // Update the query cache with the updated message
        queryClient.setQueryData(['trade-messages', activeConversation], (old: any[]) => {
          if (!old) return [updatedMessage];
          
          return old.map(msg => 
            msg.id === updatedMessage.id ? updatedMessage : msg
          );
        });
      })
      .subscribe((status, error) => {
        console.log('🔥 Real-time subscription status:', status);
        if (error) {
          console.error('🔥 Real-time subscription error:', error);
        }
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to real-time messages for conversation:', activeConversation);
        }
      });

    return () => {
      console.log('🧹 Cleaning up real-time subscription for conversation:', activeConversation);
      supabase.removeChannel(channel);
    };
  }, [activeConversation, currentUserId, queryClient]);

  // Fetch messages for active conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['trade-messages', activeConversation],
    queryFn: () => activeConversation ? fetchTradeMessages(activeConversation) : Promise.resolve([]),
    enabled: !!activeConversation,
  });

  // Fetch reviews for the active chat partner
  const { data: partnerReviews = [] } = useQuery({
    queryKey: ['partner-reviews', activeChat?.otherUserProfile?.id],
    queryFn: () => activeChat?.otherUserProfile?.id ? fetchUserReviews(activeChat.otherUserProfile.id) : Promise.resolve([]),
    enabled: !!activeChat?.otherUserProfile?.id,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ conversationId, message }: { conversationId: string; message: string }) =>
      sendTradeMessage(conversationId, message),
    onMutate: async ({ conversationId, message }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['trade-messages', conversationId] });
      
      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(['trade-messages', conversationId]);
      
      // Optimistically update to the new value
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        message,
        sender_id: currentUserId,
        created_at: new Date().toISOString(),
        sender_profile: {
          id: currentUserId,
          username: 'You'
        }
      };
      
      queryClient.setQueryData(['trade-messages', conversationId], (old: any[]) => 
        old ? [...old, optimisticMessage] : [optimisticMessage]
      );
      
      return { previousMessages };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(['trade-messages', variables.conversationId], context.previousMessages);
      }
      console.error('Error sending message:', err);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trade-messages', activeConversation] });
      setMessageText('');
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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Function to trigger scroll (for image loading)
  const handleScrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Ensure the entire content is visible on initial render
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
    
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [activeConversation]);

  // Sync selection from URL params to ensure left column highlights correct chat
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const convId = params.get('conversation');
    const partnerId = params.get('partnerId');
    if (convId) {
      setActiveConversation(convId);
      const pair = exchangePairs.find(p => p.partnerId === convId);
      if (pair) handlePairSelect(convId, pair.id);
      // Switch to chat view on mobile/tablet when navigating via URL
      if (isMobile || isTablet) {
        setCurrentView('chat');
      }
    } else if (partnerId) {
      const byPartner = conversations.find(c => c.otherUserProfile?.id === partnerId);
      if (byPartner) {
        setActiveConversation(byPartner.id);
        const pair = exchangePairs.find(p => p.partnerId === byPartner.id);
        if (pair) handlePairSelect(byPartner.id, pair.id);
        // Switch to chat view on mobile/tablet when navigating via URL
        if (isMobile || isTablet) {
          setCurrentView('chat');
        }
      }
    }
  }, [location.search, conversations, exchangePairs, isMobile, isTablet]);

  // Ensure the selected conversation is scrolled into view in the left list
  useEffect(() => {
    if (!activeConversation) return;
    const el = document.querySelector(`[data-conv-id="${activeConversation}"]`) as HTMLElement | null;
    if (el) {
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeConversation, conversations]);

  // Simple scroll to bottom when switching to chat view
  useEffect(() => {
    if ((isMobile || isTablet) && currentView === 'chat' && activeConversation) {
      // Single scroll attempt with reasonable delay
      setTimeout(() => {
        forceScrollToBottom();
      }, 300);
    }
  }, [currentView, activeConversation, isMobile, isTablet]);

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

  
  console.log('🖥️ MESSAGES PAGE DEBUG:', { 
    isMobile, 
    isTablet, 
    currentView, 
    activeConversation, 
    windowWidth: typeof window !== 'undefined' ? window.innerWidth : 'unknown',
    shouldUseMobileLayout: isMobile || isTablet,
    isDesktop: !isMobile && !isTablet
  });

  return (
    <div className="flex flex-col h-screen">
      {/* Header - always visible */}
      <Header />
      
      {/* Mobile Layout Only */}
      {isMobile ? (
        <div className="flex-1 overflow-hidden pt-16">
          {currentView === 'conversations' ? (
            /* Conversations List Only */
            <div className="h-full flex flex-col">
              {(conversations.length > 0 || isDemoTrade) ? (
                <div className="flex-1 overflow-y-auto">
                  {/* Demo Trade Entry */}
                  {isDemoTrade && demoTradeData && (
                    <div 
                      className="p-4 border-b border-gray-200 cursor-pointer bg-blue-50 border-l-4 border-l-blue-500"
                      onClick={() => {
                        setCurrentView('chat');
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage 
                            src={demoTradeData.partnerProfile?.avatar_url || undefined} 
                            alt={`${demoTradeData.partnerProfile?.username}'s avatar`} 
                          />
                          <AvatarFallback>
                            {(demoTradeData.partnerProfile?.username || 'U').substring(0, 1).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <div className="font-medium truncate">
                              {demoTradeData.partnerProfile?.username || 'Demo User'}
                            </div>
                            <span className="text-xs text-gray-500 flex-shrink-0">Just now</span>
                          </div>
                          
                          <div className="flex items-center mb-1 text-xs">
                            <span className="truncate text-gray-900 max-w-[80px] inline-block">{demoTradeData.myItem?.name}</span>
                            <span className="mx-1 text-blue-600">↔</span>
                            <span className="truncate text-gray-900 max-w-[80px] inline-block">{demoTradeData.theirItem?.name}</span>
                          </div>
                          
                          <p className="text-sm text-gray-600 truncate">Demo trade request</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {conversations.map((conversation) => {
                    const exchangePair = exchangePairs.find(pair => pair.partnerId === conversation.id);
                    
                    return (
                      <div 
                        key={conversation.id}
                        data-conv-id={conversation.id}
                        className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 ${activeConversation === conversation.id && !isDemoTrade ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Mobile conversation clicked:', conversation.id);
                          // Clear demo trade when clicking a real conversation
                          setIsDemoTrade(false);
                          setDemoTradeData(null);
                          setActiveConversation(conversation.id);
                          setSelectedItem('item2');
                          setCurrentView('chat');
                          
                          // Single scroll attempt after reasonable delay
                          setTimeout(() => {
                            forceScrollToBottom();
                          }, 500);
                          
                          const matchingPair = exchangePairs.find(pair => pair.partnerId === conversation.id);
                          if (matchingPair) {
                            handlePairSelect(conversation.id, matchingPair.id);
                          } else {
                            resetSelectedPair();
                          }
                        }}
                      >
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage 
                              src={conversation.otherUserProfile?.avatar_url || undefined} 
                              alt={`${conversation.name}'s avatar`} 
                            />
                            <AvatarFallback>
                              {conversation.name.substring(0, 1).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <div className="font-medium truncate">
                                {conversation.name}
                              </div>
                              <span className="text-xs text-gray-500 flex-shrink-0">{conversation.time}</span>
                            </div>
                            
                            {exchangePair && (
                              <div className="flex items-center mb-1 text-xs">
                                <span className="truncate text-gray-900 max-w-[80px] inline-block">{exchangePair.item2.name}</span>
                                <span className="mx-1 text-blue-600">↔</span>
                                <span className="truncate text-gray-900 max-w-[80px] inline-block">{exchangePair.item1.name}</span>
                              </div>
                            )}
                            
                            <p className="text-sm text-gray-600 truncate">{conversation.lastMessage || "No messages yet"}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
               ) : (
                 <div className="flex items-center justify-center h-full">
                   <div className="text-center">
                     <p className="text-gray-500">No messages yet</p>
                    <p className="text-sm text-gray-400 mt-2">Start trading to begin conversations!</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Chat View with Back Button */
            <div className="h-full flex flex-col">
              {/* Mobile Header with Back Button and Toggle */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      if (isDemoTrade) {
                        setIsDemoTrade(false);
                        setDemoTradeData(null);
                      }
                      setCurrentView('conversations');
                    }}
                    className="p-2"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={isDemoTrade ? demoTradeData?.partnerProfile?.avatar_url : activeChat?.otherUserProfile?.avatar_url || undefined} 
                      alt={`${isDemoTrade ? demoTradeData?.partnerProfile?.username : activeChat?.name}'s avatar`} 
                    />
                    <AvatarFallback>
                      {(isDemoTrade ? demoTradeData?.partnerProfile?.username : activeChat?.name)?.substring(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isDemoTrade ? (
                    <span className="font-medium text-lg">{demoTradeData?.partnerProfile?.username || 'Demo User'}</span>
                  ) : (
                    <Link 
                      to={`/other-person-profile?userId=${activeChat?.otherUserProfile?.id}`}
                      className="font-medium hover:underline text-lg"
                    >
                      {activeChat?.name}
                    </Link>
                  )}
                </div>
                
                {/* Toggle Details - Mobile Only */}
                {isMobile && (
                  <Button
                    variant={currentMobileView === 'details' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      if (currentMobileView === 'details') {
                        setCurrentMobileView('messages');
                        // Force scroll to bottom when switching back to messages
                        [100, 300, 500, 800].forEach((delay) => {
                          setTimeout(() => {
                            forceScrollToBottom();
                          }, delay);
                        });
                      } else {
                        setCurrentMobileView('details');
                      }
                    }}
                    className="px-3 py-1"
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {/* Mobile/Tablet Chat Content */}
              <div className="flex-1 flex min-h-0 bg-background">
                {/* Messages Area - Full width on mobile when showing messages, shared on tablet */}
                {isMobile && currentMobileView === 'messages' ? (
                  <div className="flex-1 flex flex-col min-h-0">
                    {isDemoTrade && demoTradeData ? (
                      /* Demo trade on mobile - matches real trade layout */
                      <div className="flex flex-col h-full">
                        <div className="flex-1 overflow-y-auto p-4 bg-muted/50 min-h-0">
                          <div className="text-center py-8">
                            <p className="text-gray-500">Trade conversation started!</p>
                            <p className="text-sm text-gray-400 mt-2">Send a message to start the conversation.</p>
                          </div>
                        </div>
                        <div className="flex-shrink-0 border-t border-gray-200">
                          <MessageInput onMarkCompleted={() => {}} conversationId="" />
                        </div>
                      </div>
                    ) : activeConversation ? (
                      <>
                        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 bg-gray-50 min-h-0">
                          {messagesLoading ? (
                            <div className="flex justify-center items-center h-full">
                              <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
                            </div>
                          ) : messages.length > 0 ? (
                            <div className="space-y-4">
                              {messages.map((message: any) => (
                                <TradeMessageBubble 
                                  key={message.id}
                                  message={message}
                                  senderName={message.sender_profile?.username || activeChat?.name || 'User'}
                                  onImageLoad={handleScrollToBottom}
                                  currentUserId={currentUserId}
                                />
                              ))}
                              <div ref={scrollRef} />
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-gray-500">Trade conversation started!</p>
                              <p className="text-sm text-gray-400 mt-2">Send a message to start the conversation.</p>
                              <div ref={scrollRef} />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-shrink-0 border-t border-gray-200">
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
                ) : currentMobileView === 'details' ? (
                  /* Details Panel - Full width on mobile when showing details */
                  <div className="flex-1 flex flex-col overflow-y-auto bg-white">
                    {isDemoTrade && demoTradeData ? (
                      <TradeDetailsTabs 
                        selectedPair={constructDemoPair(demoTradeData)}
                        selectedItem={selectedItem}
                        onSelectItem={handleSelectItem}
                      />
                    ) : selectedPair ? (
                      <TradeDetailsTabs 
                        selectedPair={selectedPair}
                        selectedItem={selectedItem}
                        onSelectItem={handleSelectItem}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full p-4">
                        <p className="text-gray-500 text-center text-sm">
                          Trade details will appear here
                        </p>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Desktop Layout - 2 columns with toggleable right panel */
        <div className="flex flex-1 min-h-0 overflow-hidden pt-16">
          {/* Left sidebar - Conversations (always visible, narrower) */}
          <div className="w-[340px] border-r border-gray-200 flex flex-col h-full">
            
          {(conversations.length > 0 || demoTradeData) ? (
            <div className="flex flex-col h-full">
              <div ref={leftListRef} className="flex-1 overflow-y-auto">
                {/* Demo Trade Entry - always visible when demoTradeData exists */}
                {demoTradeData && (
                  <div 
                    className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 ${isDemoTrade ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                    onClick={() => {
                      setIsDemoTrade(true);
                      setActiveConversation(null as any);
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={demoTradeData.partnerProfile?.avatar_url || undefined} 
                          alt={`${demoTradeData.partnerProfile?.username}'s avatar`} 
                        />
                        <AvatarFallback>
                          {(demoTradeData.partnerProfile?.username || 'U').substring(0, 1).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <div className="font-medium truncate text-sm">
                            {demoTradeData.partnerProfile?.username || 'Demo User'}
                          </div>
                        </div>
                        <div className="flex items-center mb-1 text-xs">
                          <span className="truncate text-gray-900 max-w-[80px] inline-block">{demoTradeData.theirItem?.name || 'Their Item'}</span>
                          <span className="mx-1 text-blue-600">↔</span>
                          <span className="truncate text-gray-900 max-w-[80px] inline-block">{demoTradeData.myItem?.name || 'Your Item'}</span>
                        </div>
                        <p className="text-xs text-gray-600 truncate">Demo trade</p>
                      </div>
                    </div>
                  </div>
                )}
                {conversations.map((conversation) => {
                  const exchangePair = exchangePairs.find(pair => pair.partnerId === conversation.id);
                  
                  return (
                    <div 
                      key={conversation.id}
                      data-conv-id={conversation.id}
                      id={`conv-${conversation.id}`}
                      className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 ${activeConversation === conversation.id && !isDemoTrade ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDemoTrade(false);
                        // Don't clear demoTradeData - keep it in the list
                        setActiveConversation(conversation.id);
                        setSelectedItem('item2');
                        setCurrentMobileView('messages'); // Reset to messages view when switching chats
                        
                        const matchingPair = exchangePairs.find(pair => pair.partnerId === conversation.id);
                        if (matchingPair) {
                          handlePairSelect(conversation.id, matchingPair.id);
                        } else {
                          resetSelectedPair();
                        }
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <Avatar className="h-10 w-10">
                           <AvatarImage 
                            src={conversation.otherUserProfile?.avatar_url || undefined} 
                            alt={`${conversation.name}'s avatar`} 
                          />
                          <AvatarFallback>
                            {conversation.name.substring(0, 1).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <div className="font-medium truncate text-sm">
                              {conversation.name}
                            </div>
                            <span className="text-xs text-gray-500 flex-shrink-0">{conversation.time}</span>
                          </div>
                          
                          {exchangePair && (
                            <div className="flex items-center mb-1 text-xs">
                              <span className="truncate text-gray-900 max-w-[80px] inline-block">{exchangePair.item2.name}</span>
                              <span className="mx-1 text-blue-600">↔</span>
                              <span className="truncate text-gray-900 max-w-[80px] inline-block">{exchangePair.item1.name}</span>
                            </div>
                          )}
                          
                          <p className="text-xs text-gray-600 truncate">{conversation.lastMessage || "No messages"}</p>
                        </div>
                      </div>
                    </div>
                  );
              })}
              </div>
            </div>
           ) : (
             <div className="flex items-center justify-center h-full">
               <div className="text-center p-4">
                 <p className="text-gray-500 text-sm">No messages yet</p>
               </div>
             </div>
          )}
        </div>
        
        {/* Right side - Chat and/or Details */}
        {showThreeColumns ? (
          /* Three column layout: Chat + Details side by side */
          <>
            {/* Middle - Chat area */}
            <div className="flex-1 flex flex-col h-full bg-white border-r border-gray-200">
              {isDemoTrade && demoTradeData ? (
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={demoTradeData.partnerProfile?.avatar_url} />
                        <AvatarFallback>{demoTradeData.partnerProfile?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                      <span className="font-semibold">{demoTradeData.partnerProfile?.username || 'Demo User'}</span>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 bg-muted/50 min-h-0">
                    <div className="text-center py-8">
                      <p className="text-gray-500">Trade conversation started!</p>
                      <p className="text-sm text-gray-400 mt-2">Send a message to start the conversation.</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 border-t border-gray-200">
                    <MessageInput onMarkCompleted={() => {}} conversationId="" />
                  </div>
                </div>
              ) : activeConversation ? (
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <Link to={`/other-person-profile?userId=${activeChat.otherUserProfile?.id}`}>
                        <Avatar className="h-10 w-10 hover:ring-2 hover:ring-blue-300 transition-all cursor-pointer">
                          <AvatarImage src={activeChat.otherUserProfile?.avatar_url || undefined} />
                          <AvatarFallback>{(activeChat.otherUserProfile?.username || activeChat.name).substring(0, 1).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </Link>
                      <Link to={`/other-person-profile?userId=${activeChat.otherUserProfile?.id}`} className="font-semibold hover:text-blue-600 transition-colors">
                        {activeChat.otherUserProfile?.username || activeChat.name}
                      </Link>
                    </div>
                  </div>
                  <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 bg-muted/50 min-h-0">
                    {messagesLoading ? (
                      <div className="flex justify-center items-center h-full">
                        <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages
                          .filter((message: any, index: number) => !(index === 0 && message.message?.startsWith("Hi! I'm interested in trading")))
                          .map((message: any) => (
                            <TradeMessageBubble 
                              key={message.id}
                              message={message}
                              senderName={message.sender_profile?.username || activeChat?.name || 'User'}
                              onImageLoad={handleScrollToBottom}
                              currentUserId={currentUserId}
                            />
                          ))}
                        <div ref={scrollRef} />
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0 border-t border-gray-200">
                    <MessageInput onMarkCompleted={() => handleTradeCompleted(activeConversation)} conversationId={activeConversation} />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Select a conversation to start messaging</p>
                </div>
              )}
            </div>
            
            {/* Right - Details panel (always visible in 3-column) */}
            <div className="w-[340px] flex flex-col h-full bg-gray-50 overflow-y-auto">
              {isDemoTrade && demoTradeData ? (
                <TradeDetailsTabs 
                  selectedPair={constructDemoPair(demoTradeData)} 
                  selectedItem={selectedItem} 
                  onSelectItem={handleSelectItem} 
                />
              ) : selectedPair ? (
                <TradeDetailsTabs selectedPair={selectedPair} selectedItem={selectedItem} onSelectItem={handleSelectItem} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 text-center text-sm">Select a trade conversation<br />to view details</p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Two column layout: Combined chat/details with toggle */
          <div className="flex-1 flex flex-col h-full bg-white">
            {isDemoTrade && demoTradeData ? (
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={demoTradeData.partnerProfile?.avatar_url} />
                        <AvatarFallback>{demoTradeData.partnerProfile?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                      <span className="font-semibold">{demoTradeData.partnerProfile?.username || 'Demo User'}</span>
                    </div>
                    <Button variant={currentMobileView === 'details' ? 'default' : 'ghost'} size="icon" onClick={() => setCurrentMobileView(currentMobileView === 'details' ? 'messages' : 'details')} className={currentMobileView === 'details' ? 'bg-primary text-primary-foreground' : ''}>
                      <Info className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                {currentMobileView === 'messages' ? (
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 overflow-y-auto p-4 bg-muted/50 min-h-0">
                      <div className="py-4">
                        <TradeRequestMessage
                          partnerProfile={{
                            id: 'demo-user',
                            username: demoTradeData.partnerProfile?.username || 'Demo User',
                            avatar_url: demoTradeData.partnerProfile?.avatar_url || '',
                          }}
                          theirItem={{
                            id: demoTradeData.theirItem?.id,
                            name: demoTradeData.theirItem?.name || 'Their Item',
                            image: demoTradeData.theirItem?.image,
                            image_url: demoTradeData.theirItem?.image,
                          }}
                          yourItem={{
                            id: demoTradeData.myItem?.id,
                            name: demoTradeData.myItem?.name || 'Your Item',
                            image: demoTradeData.myItem?.image,
                            image_url: demoTradeData.myItem?.image,
                          }}
                          isPending={true}
                          isRequester={true}
                          onCancel={() => {
                            setIsDemoTrade(false);
                            setDemoTradeData(null);
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex-shrink-0 border-t border-gray-200">
                      <MessageInput onMarkCompleted={() => {}} conversationId="" />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto bg-gray-50">
                    <TradeDetailsTabs 
                      selectedPair={constructDemoPair(demoTradeData)} 
                      selectedItem={selectedItem} 
                      onSelectItem={handleSelectItem} 
                    />
                  </div>
                )}
              </div>
            ) : activeConversation ? (
              <>
                <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Link to={`/other-person-profile?userId=${activeChat.otherUserProfile?.id}`}>
                        <Avatar className="h-10 w-10 hover:ring-2 hover:ring-blue-300 transition-all cursor-pointer">
                          <AvatarImage src={activeChat.otherUserProfile?.avatar_url || undefined} />
                          <AvatarFallback>{(activeChat.otherUserProfile?.username || activeChat.name).substring(0, 1).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </Link>
                      <Link to={`/other-person-profile?userId=${activeChat.otherUserProfile?.id}`} className="font-semibold hover:text-blue-600 transition-colors">
                        {activeChat.otherUserProfile?.username || activeChat.name}
                      </Link>
                    </div>
                    <Button variant={currentMobileView === 'details' ? 'default' : 'ghost'} size="icon" onClick={() => setCurrentMobileView(currentMobileView === 'details' ? 'messages' : 'details')} className={currentMobileView === 'details' ? 'bg-primary text-primary-foreground' : ''}>
                      <Info className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                {currentMobileView === 'messages' ? (
                  <div className="flex-1 flex flex-col min-h-0">
                    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 bg-muted/50 min-h-0">
                      {messagesLoading ? (
                        <div className="flex justify-center items-center h-full">
                          <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages
                            .filter((message: any, index: number) => !(index === 0 && message.message?.startsWith("Hi! I'm interested in trading")))
                            .map((message: any) => (
                              <TradeMessageBubble key={message.id} message={message} senderName={message.sender_profile?.username || activeChat?.name || 'User'} onImageLoad={handleScrollToBottom} currentUserId={currentUserId} />
                            ))}
                          <div ref={scrollRef} />
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0 border-t border-gray-200">
                      <MessageInput onMarkCompleted={() => handleTradeCompleted(activeConversation)} conversationId={activeConversation} />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto bg-white flex justify-center">
                    <div className="w-full max-w-md">
                      {selectedPair ? (
                        <TradeDetailsTabs selectedPair={selectedPair} selectedItem={selectedItem} onSelectItem={handleSelectItem} />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-gray-500 text-center">Select a trade conversation<br />to view details</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        )}
        </div>
      )}
      
    </div>
  );
};

export default Messages;
