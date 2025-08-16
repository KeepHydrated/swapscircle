import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Send, User, Clock, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useRealtimeSupportMessages } from '@/hooks/useRealtimeSupportMessages';

interface SupportMessage {
  id: string;
  message: string;
  sender_type: 'user' | 'support';
  created_at: string;
  is_read: boolean;
}

interface SupportConversation {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  last_message_at: string;
  updated_at: string;
  profiles?: {
    username?: string;
    name?: string;
  };
}

const AdminSupportChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<SupportConversation | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<{ 
    username?: string; 
    name?: string; 
    avatar_url?: string;
    averageRating?: number;
    reviewCount?: number;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Check if user is admin (nadiachibri@gmail.com)
  const isAdmin = user?.email === 'nadiachibri@gmail.com';

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations on mount
  useEffect(() => {
    console.log('AdminSupportChat: isAdmin check:', isAdmin, 'user email:', user?.email);
    if (isAdmin) {
      console.log('AdminSupportChat: Loading conversations...');
      loadConversations();
    }
  }, [isAdmin]);

  // Real-time conversation updates
  useEffect(() => {
    if (!isAdmin) return;

    const conversationChannel = supabase
      .channel('admin_support_conversations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'support_conversations',
      }, (payload) => {
        console.log('Real-time conversation change:', payload);
        loadConversations();
        
        // If the current conversation was updated, update its status locally
        if (selectedConversation && payload.new && (payload.new as any).id === selectedConversation.id) {
          setSelectedConversation(prev => prev ? { ...prev, ...(payload.new as any) } : null);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(conversationChannel);
    };
  }, [isAdmin, selectedConversation?.id]);

  // Stable callback function to prevent unnecessary re-subscriptions
  const handleNewMessage = useCallback((newMessage: SupportMessage) => {
    console.log('🔧 ADMIN - handleNewMessage called:', {
      messageId: newMessage.id,
      senderType: newMessage.sender_type,
      message: newMessage.message.substring(0, 50) + '...',
      timestamp: newMessage.created_at,
      isAdmin,
      selectedConversationId: selectedConversation?.id
    });
    
    if (!isAdmin) {
      console.log('❌ ADMIN - User is not admin, ignoring message');
      return;
    }
    
    setMessages(prev => {
      // Avoid duplicates by checking if message already exists
      const exists = prev.some(msg => msg.id === newMessage.id);
      if (exists) {
        console.log('⚠️ ADMIN - Message already exists, skipping');
        return prev;
      }
      console.log('✅ ADMIN - Adding new message to state. Previous count:', prev.length);
      return [...prev, newMessage];
    });
  }, [isAdmin, selectedConversation?.id]);

  // Use real-time hook for admin support messages
  console.log('🔧 ADMIN - Setting up real-time subscription:', {
    conversationId: selectedConversation?.id || null,
    isAdmin,
    selectedConversationExists: !!selectedConversation
  });
  
  useRealtimeSupportMessages({
    conversationId: selectedConversation?.id || null,
    onNewMessage: handleNewMessage
  });

  const loadConversations = async () => {
    console.log('AdminSupportChat: loadConversations called');
    try {
      // First get conversations
      const { data: conversations, error: convError } = await supabase
        .from('support_conversations')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (convError) throw convError;

      // Then get profile data for each conversation
      const conversationsWithProfiles = await Promise.all(
        (conversations || []).map(async (conv) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, name')
            .eq('id', conv.user_id)
            .maybeSingle();
          
          return {
            ...conv,
            profiles: profile
          };
        })
      );

      console.log('AdminSupportChat: Query result:', { data: conversationsWithProfiles });
      
      const conversationsList = conversationsWithProfiles as unknown as SupportConversation[];
      setConversations(conversationsList);
      
      // Auto-select first conversation if none is selected and conversations exist
      if (!selectedConversation && conversationsList.length > 0) {
        const firstConversation = conversationsList[0];
        setSelectedConversation(firstConversation);
        loadMessages(firstConversation.id);
        loadUserProfile(firstConversation.user_id);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Failed to load conversations');
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('support_messages' as any)
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []) as unknown as SupportMessage[]);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const loadUserProfile = async (userId: string) => {
    console.log('Loading profile for user:', userId);
    setUserProfile(null); // Clear previous profile
    
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username, name, avatar_url')
        .eq('id', userId)
        .maybeSingle();

      console.log('Profile query result:', { profile, profileError });

      if (profileError) {
        console.error('Error loading profile:', profileError);
      }

      // Get user reviews and calculate average rating
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('reviewee_id', userId);

      console.log('Reviews query result:', { reviews, reviewsError });

      if (reviewsError) {
        console.error('Error loading reviews:', reviewsError);
      }

      const reviewCount = reviews?.length || 0;
      const averageRating = reviewCount > 0 
        ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount).toFixed(1))
        : 0;

      const profileData = {
        username: profile?.username || 'Unknown User',
        name: profile?.name || profile?.username || 'Unknown User',
        avatar_url: profile?.avatar_url || '',
        averageRating,
        reviewCount
      };

      console.log('Setting profile data:', profileData);
      setUserProfile(profileData);
      
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      setUserProfile({
        username: 'Unknown User',
        name: 'Unknown User',
        avatar_url: '',
        averageRating: 0,
        reviewCount: 0
      });
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !selectedConversation || !user?.id) return;

    const messageText = inputValue.trim();
    
    // Create optimistic message for immediate UI update
    const optimisticMessage: SupportMessage = {
      id: `temp-${Date.now()}`, // Temporary ID
      message: messageText,
      sender_type: 'support',
      created_at: new Date().toISOString(),
      is_read: false
    };
    
    // Add message to UI immediately (optimistic update)
    setMessages(prev => [...prev, optimisticMessage]);
    
    setInputValue('');
    setLoading(true);

    try {
      console.log('🔧 ADMIN - Sending message:', {
        messageText,
        conversationId: selectedConversation.id,
        userId: user.id
      });

      const { error, data } = await supabase
        .from('support_messages' as any)
        .insert({
          conversation_id: selectedConversation.id,
          user_id: user.id,
          message: messageText,
          sender_type: 'support'
        })
        .select();

      if (error) {
        console.error('🔧 ADMIN - Error sending message:', error);
        // Remove optimistic message on error
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
        throw error;
      }
      
      console.log('🔧 ADMIN - Message sent successfully:', data);

      // Replace optimistic message with real message from database
      if (data && data.length > 0) {
        const realMessage = data[0] as unknown as SupportMessage;
        setMessages(prev => prev.map(msg => 
          msg.id === optimisticMessage.id ? realMessage : msg
        ));
      }

      // Update conversation last_message_at
      await supabase
        .from('support_conversations' as any)
        .update({ 
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedConversation.id);

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      // Remove optimistic message and restore input on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      setInputValue(messageText);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationSelect = (conversation: SupportConversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id);
    loadUserProfile(conversation.user_id);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const closeTicket = async () => {
    if (!selectedConversation) return;
    
    try {
      // Update conversation status to closed
      const { error } = await supabase
        .from('support_conversations')
        .update({ 
          status: 'closed',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedConversation.id);

      if (error) throw error;

      // Send a closing message
      await supabase
        .from('support_messages')
        .insert({
          conversation_id: selectedConversation.id,
          user_id: user.id,
          message: "This ticket has been closed by customer support. If you need further assistance, please start a new conversation.",
          sender_type: 'support'
        });

      toast.success('Ticket closed successfully');
      
      // Update the selected conversation status locally to reflect the change immediately
      setSelectedConversation(prev => prev ? { ...prev, status: 'closed' } : null);
      
      // Refresh conversations list to update the status in the sidebar
      loadConversations();
      
    } catch (error) {
      console.error('Error closing ticket:', error);
      toast.error('Failed to close ticket');
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString([], { 
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleProfileClick = () => {
    if (selectedConversation?.user_id) {
      navigate(`/other-person-profile?userId=${selectedConversation.user_id}`);
    }
  };

  if (!isAdmin) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">Access Denied</h2>
        <p className="text-muted-foreground">
          You don't have permission to access the admin support chat.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-fit overflow-hidden">
      {/* Conversations List */}
      <Card className="lg:col-span-1 h-[520px] flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Support Conversations
          </h2>
          <p className="text-sm text-muted-foreground">
            {conversations.length} conversations
          </p>
        </div>
        <ScrollArea className="h-[calc(100%-5rem)]">
          <div className="p-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationSelect(conversation)}
                className={`p-3 rounded-lg cursor-pointer mb-2 border transition-colors ${
                  selectedConversation?.id === conversation.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">
                        {conversation.profiles?.username || conversation.profiles?.name || 'User'}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(conversation.last_message_at)}
                      </div>
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    conversation.status === 'open' ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat Interface */}
      <Card className="lg:col-span-2 flex flex-col h-[520px]">
        {selectedConversation ? (
          <div className="flex flex-col h-full">
            {/* Profile Header */}
            <div className="p-6 border-b bg-muted/30">
              <div className="flex items-center gap-3">
                <Avatar 
                  className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all" 
                  onClick={handleProfileClick}
                >
                  <AvatarImage src={userProfile?.avatar_url} />
                  <AvatarFallback>
                    {(userProfile?.name || userProfile?.username || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 
                      className="font-semibold text-lg cursor-pointer hover:text-primary transition-colors"
                      onClick={handleProfileClick}
                    >
                      {userProfile?.name || userProfile?.username || 'User'}
                    </h3>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= Math.round(userProfile?.averageRating || 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({userProfile?.reviewCount || 0})
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    Started {formatDate(selectedConversation.created_at)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedConversation.status === 'open' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={closeTicket}
                      className="h-7 px-2 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Close Ticket
                    </Button>
                  )}
                  {selectedConversation.status === 'closed' && (
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
                      CLOSED
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 min-h-0 p-4">
              <div className="space-y-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_type === 'support' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex flex-col space-y-0.5 max-w-[70%]">
                      <div
                        className={`rounded-lg px-3 py-1.5 text-sm ${
                          message.sender_type === 'support'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {message.message}
                      </div>
                      <span className="text-xs text-muted-foreground px-1">
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                  </div>
                 ))}
                 <div ref={messagesEndRef} />
               </div>
             </ScrollArea>

            {/* Input - Only show if conversation is open */}
            {selectedConversation?.status === 'open' ? (
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your response..."
                    className="flex-1"
                    disabled={loading}
                  />
                  <Button 
                    size="icon" 
                    onClick={sendMessage}
                    disabled={loading || !inputValue.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 border-t bg-muted/30">
                <p className="text-center text-sm text-muted-foreground">
                  This ticket is closed. Customer must start a new conversation for further assistance.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a Conversation</h3>
              <p className="text-muted-foreground">
                Choose a conversation from the list to start responding to users.
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminSupportChat;