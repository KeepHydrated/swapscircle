import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import SelectField from '@/components/ui/select-field';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useRealtimeSupportMessages } from '@/hooks/useRealtimeSupportMessages';
import { useNavigate } from 'react-router-dom';

interface SupportMessage {
  id: string;
  message: string;
  sender_type: 'user' | 'support';
  created_at: string;
  is_read: boolean;
  conversation_id: string;
}

const LiveChatPopup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationStatus, setConversationStatus] = useState<'open' | 'closed'>('open');
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  const categories = [
    'General Question',
    'Technical Issue',
    'Feature Request',
    'Bug Report',
    'Account Help',
    'Other'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    setTimeout(() => scrollToBottom(), 100);
  }, [messages]);

  useEffect(() => {
    if (!user?.id || !isOpen) return;
    initializeConversation();
  }, [user?.id, isOpen]);

  // Listen for open-live-chat event from footer
  useEffect(() => {
    const handleOpenEvent = () => {
      handleOpenChat();
    };
    window.addEventListener('open-live-chat', handleOpenEvent);
    return () => window.removeEventListener('open-live-chat', handleOpenEvent);
  }, [user]);

  const stableHandleNewMessage = useCallback((newMessage: SupportMessage) => {
    if (conversationId && newMessage.conversation_id !== conversationId) return;
    
    if (newMessage.sender_type === 'support' && newMessage.message.includes('This ticket has been closed')) {
      setConversationStatus('closed');
    }

    setMessages(prev => {
      const existsById = prev.some(msg => msg.id === newMessage.id);
      if (existsById) return prev;
      return [...prev, newMessage];
    });
  }, [conversationId]);

  const stableHandleConversationUpdate = useCallback((status: 'open' | 'closed') => {
    setConversationStatus(status);
  }, []);

  useRealtimeSupportMessages({
    conversationId,
    onNewMessage: stableHandleNewMessage,
    onConversationUpdate: stableHandleConversationUpdate
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && chatWindowRef.current && !chatWindowRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-live-chat-trigger]')) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const initializeConversation = async () => {
    if (!user?.id) return;

    try {
      const { data: conversations, error: convError } = await supabase
        .from('support_conversations' as any)
        .select('id, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1);

      if (convError) throw convError;

      let currentConversationId: string;
      let currentStatus: 'open' | 'closed' = 'open';

      if (conversations && conversations.length > 0) {
        currentConversationId = (conversations as any)[0].id;
        currentStatus = (conversations as any)[0].status;
      } else {
        const { data: newConversation, error: createError } = await supabase
          .from('support_conversations' as any)
          .insert({ user_id: user.id, status: 'open' })
          .select('id, status, created_at')
          .single();

        if (createError) throw createError;
        
        currentConversationId = (newConversation as any).id;
        currentStatus = (newConversation as any).status;
        
        await supabase
          .from('support_messages' as any)
          .insert({
            conversation_id: currentConversationId,
            user_id: user.id,
            message: "Hi! How can I help you today?",
            sender_type: 'support'
          });
      }

      setConversationId(currentConversationId);
      setConversationStatus(currentStatus);

      const { data: allMessages, error: messagesError } = await supabase
        .from('support_messages' as any)
        .select('*')
        .eq('conversation_id', currentConversationId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;
      setMessages((allMessages as any) || []);

    } catch (error) {
      console.error('Error initializing conversation:', error);
      toast.error('Failed to initialize chat');
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !user?.id || !conversationId) return;

    const isFirstMessage = messages.length <= 1;
    
    if ((isFirstMessage || conversationStatus === 'closed') && !category) {
      toast.error('Please select a category');
      return;
    }

    const messageText = (isFirstMessage || conversationStatus === 'closed') && category 
      ? `[${category}] ${inputValue.trim()}` 
      : inputValue.trim();
    
    const optimisticMessage: SupportMessage = {
      id: `temp-${Date.now()}`,
      message: messageText,
      sender_type: 'user',
      created_at: new Date().toISOString(),
      is_read: false,
      conversation_id: conversationId
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    setInputValue('');
    setCategory('');
    setLoading(true);

    try {
      const { error, data } = await supabase
        .from('support_messages' as any)
        .insert({
          conversation_id: conversationId,
          user_id: user.id,
          message: messageText,
          sender_type: 'user'
        })
        .select();

      if (error) {
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
        throw error;
      }

      if (data && data.length > 0) {
        const realMessage = data[0] as unknown as SupportMessage;
        setMessages(prev => prev.map(msg => 
          msg.id === optimisticMessage.id ? realMessage : msg
        ));
      }

      const updateData: any = { 
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      if (conversationStatus === 'closed') {
        updateData.status = 'open';
        setConversationStatus('open');
      }

      await supabase
        .from('support_conversations' as any)
        .update(updateData)
        .eq('id', conversationId);

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setInputValue(messageText);
    } finally {
      setLoading(false);
    }
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

  const handleOpenChat = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setIsOpen(true);
    setTimeout(() => scrollToBottom(), 200);
  };

  const isFirstMessage = messages.length <= 1;
  const showCategorySelector = isFirstMessage || conversationStatus === 'closed';

  return (
    <>
      {/* Chat Popup */}
      {isOpen && (
        <Card 
          ref={chatWindowRef} 
          className="fixed bottom-24 right-6 w-80 h-[450px] shadow-2xl z-[9999] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <h3 className="font-semibold">Live Chat</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Category Selection */}
          {showCategorySelector && (
            <div className="px-4 pt-3 pb-3 border-b bg-muted/30">
              <SelectField
                id="popup-category"
                label=""
                value={category}
                onChange={setCategory}
                options={categories}
                placeholder={conversationStatus === 'closed' 
                  ? "Select category to continue" 
                  : "Select a topic"}
                className="z-[10000]"
              />
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex flex-col space-y-1 max-w-[80%]">
                    <div
                      className={`rounded-lg px-3 py-2 text-sm ${
                        message.sender_type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : message.message.includes('This ticket has been closed')
                          ? 'bg-muted/70 text-muted-foreground border border-border'
                          : 'bg-muted'
                      }`}
                    >
                      {message.message.includes('This ticket has been closed') 
                        ? "Ticket closed"
                        : message.message}
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
          <div className="p-3 border-t bg-background">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1"
                disabled={loading}
              />
              <Button 
                size="icon" 
                onClick={sendMessage}
                disabled={loading || !inputValue.trim() || (showCategorySelector && !category)}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default LiveChatPopup;
