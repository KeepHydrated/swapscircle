import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      }, () => {
        loadConversations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(conversationChannel);
    };
  }, [isAdmin]);

  // Real-time message updates for selected conversation
  useEffect(() => {
    if (!selectedConversation || !isAdmin) return;

    const messageChannel = supabase
      .channel('admin_support_messages')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'support_messages',
        filter: `conversation_id=eq.${selectedConversation.id}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setMessages(prev => [...prev, payload.new as SupportMessage]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
    };
  }, [selectedConversation, isAdmin]);

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
            .single();
          
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

  const sendMessage = async () => {
    if (!inputValue.trim() || !selectedConversation || !user?.id) return;

    const messageText = inputValue.trim();
    setInputValue('');
    setLoading(true);

    try {
      const { error } = await supabase
        .from('support_messages' as any)
        .insert({
          conversation_id: selectedConversation.id,
          user_id: user.id,
          message: messageText,
          sender_type: 'support'
        });

      if (error) throw error;

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
      setInputValue(messageText);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationSelect = (conversation: SupportConversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id);
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

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString([], { 
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-3rem)] overflow-hidden">
      {/* Conversations List */}
      <Card className="lg:col-span-1 h-full flex flex-col">
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
      <Card className="lg:col-span-2 flex flex-col h-full">
        {selectedConversation ? (
          <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="p-4 border-b">
              <h3 className="font-semibold">
                Chat with {selectedConversation.profiles?.username || selectedConversation.profiles?.name || 'User'}
              </h3>
              <p className="text-sm text-muted-foreground">
                Started {formatDate(selectedConversation.created_at)}
              </p>
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

            {/* Input */}
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