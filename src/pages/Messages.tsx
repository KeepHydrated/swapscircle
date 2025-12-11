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

// Demo Trade Details Component - matches the real TradeDetailsTabs layout
interface DemoTradeDetailsTabsProps {
  demoData: {
    theirItem: any;
    myItem: any;
    partnerProfile: any;
  };
  onCancel: () => void;
}

const DemoTradeDetailsTabs: React.FC<DemoTradeDetailsTabsProps> = ({ demoData, onCancel }) => {
  const [selectedItem, setSelectedItem] = useState<'item1' | 'item2'>('item2');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const getItemImages = (item: any) => {
    if (item.image_urls && item.image_urls.length > 0) return item.image_urls;
    if (item.image_url) return [item.image_url];
    if (item.image) return [item.image];
    return [];
  };

  const theirItemImages = getItemImages(demoData.theirItem);
  const myItemImages = getItemImages(demoData.myItem);
  const currentImages = selectedItem === 'item2' ? theirItemImages : myItemImages;
  const currentItem = selectedItem === 'item2' ? demoData.theirItem : demoData.myItem;

  React.useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedItem]);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? currentImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === currentImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="p-4 border-b border-gray-200 bg-white flex flex-col h-full">
      {/* Item Selector Tabs */}
      <div className="mb-4">
        <div className="flex gap-3">
          <button
            onClick={() => setSelectedItem('item2')}
            className={`flex-1 h-8 md:h-12 rounded-lg border text-sm font-medium transition-colors flex items-center justify-center ${
              selectedItem === 'item2' 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
          >
            Their Item
          </button>
          <button
            onClick={() => setSelectedItem('item1')}
            className={`flex-1 h-8 md:h-12 rounded-lg border text-sm font-medium transition-colors flex items-center justify-center ${
              selectedItem === 'item1' 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
          >
            Your Item
          </button>
        </div>
      </div>
      
      {/* Item Details Content */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Item Image with Navigation */}
          <div className="relative aspect-square bg-gray-100 w-full h-52 md:h-64">
            <img 
              src={currentImages[currentImageIndex] || '/placeholder.svg'} 
              alt={currentItem.name} 
              className="w-full h-full object-cover"
            />
            
            {currentImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs rounded-full px-2 py-1">
                  {currentImageIndex + 1}/{currentImages.length}
                </div>
              </>
            )}
          </div>
          
          {/* Item Details */}
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2">{currentItem.name}</h3>
            <p className="text-gray-600 text-sm mb-3">
              {currentItem.description || 'No description available.'}
            </p>
            
            {/* Property Tags */}
            <div className="grid grid-cols-2 gap-1.5 text-sm">
              {currentItem.category && (
                <div className="flex items-center gap-2">
                  <span>{currentItem.category}</span>
                </div>
              )}
              {currentItem.tags && currentItem.tags[0] && (
                <div className="flex items-center gap-2">
                  <span>{currentItem.tags[0]}</span>
                </div>
              )}
              {currentItem.condition && (
                <div className="flex items-center gap-2">
                  <span>{currentItem.condition}</span>
                </div>
              )}
              {(currentItem.price_range_min || currentItem.price_range_max) && (
                <div className="flex items-center gap-2">
                  <span>{currentItem.price_range_min || 0} - {currentItem.price_range_max || '∞'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Cancel Request Button */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button 
            variant="outline" 
            className="w-full text-red-600 border-red-200 hover:bg-red-50"
            onClick={onCancel}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel Request
          </Button>
        </div>
      </div>
    </div>
  );
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
      {/* Header - conditionally rendered */}
      {!(isTablet && currentMobileView === 'details') && <Header />}
      
      {/* Mobile/Tablet Layout */}
      {(isMobile || isTablet) ? (
        <div className={`flex-1 overflow-hidden pt-16 ${isTablet && currentMobileView === 'details' ? 'h-screen' : ''}`}>
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
                
                {/* Toggle between Messages and Details - Mobile Only */}
                {isMobile && (
                  <div className="flex bg-gray-100 rounded-lg p-1">
                     <Button
                       variant={currentMobileView === 'messages' ? 'default' : 'ghost'}
                       size="sm"
                       onClick={() => {
                         setCurrentMobileView('messages');
                         
                         // Force scroll to bottom when switching back to messages tab
                         console.log('🔄 TAB SWITCH: Switching to messages tab, forcing scroll...');
                         
                         // Multiple attempts with delays to ensure content is rendered
                         [100, 300, 500, 800].forEach((delay) => {
                           setTimeout(() => {
                             console.log(`⏰ TAB SCROLL after ${delay}ms`);
                             forceScrollToBottom();
                           }, delay);
                         });
                       }}
                       className="px-3 py-1 text-xs"
                     >
                       <MessageSquare className="h-4 w-4" />
                     </Button>
                     <Button
                       variant={currentMobileView === 'details' ? 'default' : 'ghost'}
                       size="sm"
                       onClick={() => setCurrentMobileView('details')}
                       className="px-3 py-1 text-xs"
                     >
                       <Info className="h-4 w-4" />
                     </Button>
                  </div>
                )}
              </div>
              
              {/* Mobile/Tablet Chat Content */}
              <div className="flex-1 flex min-h-0">
                {/* Messages Area - Full width on mobile when showing messages, shared on tablet */}
                {isMobile && currentMobileView === 'messages' ? (
                  <div className="flex-1 flex flex-col min-h-0">
                    {isDemoTrade && demoTradeData ? (
                      /* Demo trade on mobile - PRIORITIZED FIRST */
                      <div className="flex flex-col h-full">
                        <div className="flex-1 overflow-y-auto p-4 bg-muted/50">
                          <div className="max-w-sm mx-auto">
                            <TradeRequestMessage
                              partnerProfile={demoTradeData.partnerProfile}
                              theirItem={demoTradeData.theirItem}
                              yourItem={demoTradeData.myItem}
                              conversationTime="Just now"
                              isPending={true}
                              isRequester={true}
                              onCancel={() => {
                                setIsDemoTrade(false);
                                setDemoTradeData(null);
                                setCurrentView('conversations');
                                toast({
                                  title: "Trade Cancelled",
                                  description: "This was a demo trade request.",
                                });
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-white">
                          <p className="text-center text-sm text-muted-foreground">
                            This is a demo trade.
                          </p>
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
                ) : isMobile && currentMobileView === 'details' ? (
                  /* Details Panel - Full width on mobile when showing details */
                  <div className="flex-1 flex flex-col overflow-y-auto">
                    {selectedPair ? (
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
                ) : (
                  /* Tablet Layout - Both panels side by side */
                  <>
                    <div className={`flex-1 flex flex-col min-h-0 ${isTablet ? 'mr-80' : ''}`}>
                      {activeConversation ? (
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

                    {/* Trade Details Panel - Always visible on tablet, full height on iPad */}
                    <div className={`w-80 border-l border-gray-200 bg-gray-50 flex-shrink-0 flex flex-col overflow-y-auto ${
                      isTablet ? 'fixed right-0 top-0 h-screen z-40' : ''
                    }`}>
                      {selectedPair ? (
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
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Desktop Layout */
        <div className="flex flex-1 min-h-0 overflow-hidden pt-16">
          {/* Left sidebar - Conversations */}
          <div className="w-[350px] border-r border-gray-200 flex flex-col h-full">
            
          {(conversations.length > 0 || isDemoTrade) ? (
            <div className="flex flex-col h-full">
              <div ref={leftListRef} className="flex-1 overflow-y-auto">
                {/* Demo Trade Entry */}
                {isDemoTrade && demoTradeData && (
                  <div 
                    className="p-4 border-b border-gray-200 cursor-pointer bg-blue-50 border-l-4 border-l-blue-500"
                    onClick={() => {
                      // Clear any active real conversation to show demo
                      setActiveConversation(null as any);
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
                      id={`conv-${conversation.id}`}
                      className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 ${activeConversation === conversation.id && !isDemoTrade ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Conversation clicked:', conversation.id);
                        // Clear demo trade when clicking a real conversation
                        setIsDemoTrade(false);
                        setDemoTradeData(null);
                        setActiveConversation(conversation.id);
                        setSelectedItem('item2'); // Reset to "Their Item" when clicking new conversation
                        
                        // Switch to chat view on mobile/tablet
                        if (isMobile || isTablet) {
                          setCurrentView('chat');
                        }
                        
                        // Instead of resetting to null, find and set the correct pair
                        const matchingPair = exchangePairs.find(pair => pair.partnerId === conversation.id);
                        if (matchingPair) {
                          console.log('Setting selectedPairId to:', matchingPair.id);
                          // Use the handlePairSelect to properly set both active conversation and pair
                          handlePairSelect(conversation.id, matchingPair.id);
                        } else {
                          console.log('No matching pair found for conversation:', conversation.id);
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
        
        {/* Middle - Chat area */}
        <div className="flex-1 flex flex-col h-full">{/* Add h-full for proper height */}
          {isDemoTrade && demoTradeData ? (
            /* Demo trade view - messages only in middle */
            <div className="flex flex-col h-full">
              {/* Demo Partner Header */}
              <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarImage src={demoTradeData.partnerProfile?.avatar_url} />
                    <AvatarFallback>{demoTradeData.partnerProfile?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-semibold">{demoTradeData.partnerProfile?.username || 'Demo User'}</span>
                        <div className="flex items-center text-amber-400 text-xs">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`h-3 w-3 ${star <= 4 ? 'fill-current' : ''}`} />
                          ))}
                          <span className="ml-1 text-gray-600">(12)</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Since 2023</span>
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

              {/* Empty messages area - no messages yet for demo */}
              <div className="flex-1 overflow-y-auto p-4 bg-muted/50 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs mt-1">Send a message to start the conversation</p>
                </div>
              </div>

              {/* Demo Message Input */}
              <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-white">
                <p className="text-center text-sm text-muted-foreground">
                  This is a demo trade. Send messages to start chatting!
                </p>
              </div>
            </div>
          ) : activeConversation ? (
            <>
              {/* Debug log for activeChat */}
              {(() => {
  console.log('DEBUG - Messages page activeChat:', JSON.stringify(activeChat, null, 2));
  console.log('DEBUG - Messages page activeConversation:', activeConversation);
                return null;
              })()}
              {/* Partner information header */}
              <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
                <div className="flex items-center">
                  <Link to={`/other-person-profile?userId=${activeChat.otherUserProfile?.id}`} onClick={() => console.log('Messages.tsx Avatar Link - userId:', activeChat.otherUserProfile?.id)}>
                    <Avatar className="h-8 w-8 mr-3 hover:ring-2 hover:ring-blue-300 transition-all cursor-pointer">
                      <AvatarImage src={activeChat.otherUserProfile?.avatar_url || undefined} />
                      <AvatarFallback>{(activeChat.otherUserProfile?.username || activeChat.name).substring(0, 1).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <Link 
                          to={`/other-person-profile?userId=${activeChat.otherUserProfile?.id}`}
                          className="text-sm font-semibold hover:text-blue-600 transition-colors"
                          onClick={() => console.log('Messages.tsx Name Link - userId:', activeChat.otherUserProfile?.id)}
                        >
                          {activeChat.otherUserProfile?.username || activeChat.name}
                        </Link>
                        <div className="flex items-center text-amber-400 text-xs">
                          {(() => {
                            const avgRating = partnerReviews.length > 0 
                              ? partnerReviews.reduce((sum, review) => sum + review.rating, 0) / partnerReviews.length 
                              : 0;
                            const fullStars = Math.floor(avgRating);
                            const reviewCount = partnerReviews.length;
                            
                            return (
                              <>
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-3 w-3 ${star <= fullStars ? 'fill-current' : ''}`}
                                  />
                                ))}
                                <span className="ml-1">({reviewCount})</span>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Since {activeChat.otherUserProfile?.created_at ? new Date(activeChat.otherUserProfile.created_at).getFullYear() : 2023}</span>
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
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 bg-muted/50 min-h-0">
                {messagesLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    
                    {/* Regular messages - filter out auto-generated first message */}
                    {messages
                      .filter((message: any, index: number) => {
                        // Skip the first message if it's the auto-generated trade request message
                        if (index === 0 && message.message?.startsWith("Hi! I'm interested in trading")) {
                          return false;
                        }
                        return true;
                      })
                      .map((message: any) => (
                        <TradeMessageBubble 
                          key={message.id}
                          message={message}
                          senderName={message.sender_profile?.username || activeChat?.name || 'User'}
                          onImageLoad={handleScrollToBottom}
                          currentUserId={currentUserId}
                        />
                      ))}
                    {/* Anchor for auto-scrolling */}
                    <div ref={scrollRef} />
                  </div>
                )}
              </div>
              
              {/* Message input - frozen at bottom */}
              <div className="flex-shrink-0 border-t border-gray-200">{/* Add border for clear separation */}
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
        <div className="w-80 border-l border-gray-200 bg-gray-50 flex-shrink-0 flex flex-col h-full overflow-y-auto">
          {isDemoTrade && demoTradeData ? (
            /* Demo trade details - tabbed view matching real trades */
            <DemoTradeDetailsTabs
              demoData={demoTradeData}
              onCancel={() => {
                setIsDemoTrade(false);
                setDemoTradeData(null);
                toast({
                  title: "Trade Cancelled",
                  description: "This was a demo trade request.",
                });
              }}
            />
          ) : selectedPair ? (
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
      )}
      <SupportChat />
    </div>
  );
};

export default Messages;
