import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import SelectField from '@/components/ui/select-field';
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

interface SupportChatProps {
  embedded?: boolean;
}

const SupportChat = ({ embedded = false }: SupportChatProps) => {
  const { user } = useAuth();
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

  // Scroll to bottom function
  const scrollToBottom = () => {
    console.log('scrollToBottom called, messagesEndRef:', messagesEndRef.current);
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  // Auto-scroll when messages change
  useEffect(() => {
    console.log('Messages changed, scrolling to bottom. Message count:', messages.length);
    // Use setTimeout to ensure DOM is updated before scrolling
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  }, [messages]);

  // Initialize conversation and load messages
  useEffect(() => {
    if (!user?.id) return;
    initializeConversation();
  }, [user?.id]);

  // Real-time message subscription
  useEffect(() => {
    if (!conversationId || !user?.id) return;

    console.log('Setting up real-time subscription for conversation:', conversationId);

    const channel = supabase
      .channel(`support_messages_${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'support_messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        console.log('Real-time message received:', payload);
        const newMessage = payload.new as SupportMessage;
        
        // Check if it's a closure message
        if (newMessage.sender_type === 'support' && newMessage.message.includes('This ticket has been closed')) {
          setConversationStatus('closed');
        }
        
        setMessages(prev => {
          // Avoid duplicates by checking if message already exists
          const exists = prev.some(msg => msg.id === newMessage.id);
          if (exists) {
            console.log('Message already exists, skipping');
            return prev;
          }
          console.log('Adding new message to state');
          return [...prev, newMessage];
        });
      })
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [conversationId, user?.id]);

  // Click outside to close chat popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && chatWindowRef.current && !chatWindowRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const initializeConversation = async () => {
    if (!user?.id) return;

    try {
      // Check if user has an existing conversation (open or closed)
      const { data: existingConversation, error: convError } = await supabase
        .from('support_conversations' as any)
        .select('id, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      let conversationId: string;
      let status: 'open' | 'closed' = 'open';

      if (existingConversation && !convError) {
        // Use existing conversation (open or closed)
        conversationId = (existingConversation as any).id;
        status = (existingConversation as any).status;
        
        // If the existing conversation is closed, we still load it but the UI will show category selector
      } else {
        // If no conversation exists, create new one
        const { data: newConversation, error: createError } = await supabase
          .from('support_conversations' as any)
          .insert({
            user_id: user.id,
            status: 'open'
          })
          .select('id, status')
          .single();

        if (createError) throw createError;
        conversationId = (newConversation as any).id;
        status = (newConversation as any).status;
      }

      setConversationId(conversationId);
      setConversationStatus(status);

      // Load messages for this conversation
      const { data: messages, error: messagesError } = await supabase
        .from('support_messages' as any)
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      if (messages && messages.length === 0) {
        // Add welcome message if no messages exist
        const { error: welcomeError } = await supabase
          .from('support_messages' as any)
          .insert({
            conversation_id: conversationId,
            user_id: user.id,
            message: "Hi! How can I help you today?",
            sender_type: 'support'
          });

        if (welcomeError) throw welcomeError;
      } else if (messages) {
        console.log('Setting messages from DB:', messages.length);
        setMessages(messages as unknown as SupportMessage[]);
      }

    } catch (error) {
      console.error('Error initializing conversation:', error);
      toast.error('Failed to initialize support chat');
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !user?.id) return;

    // If conversation is closed, create a new one
    if (conversationStatus === 'closed') {
      if (!category) {
        toast.error('Please select a category to start a new conversation');
        return;
      }
      await initializeConversation();
      return;
    }

    if (!conversationId) return;

    // Only require category for the very first message (when no messages exist yet)
    const isFirstMessage = messages.length === 0;
    if (isFirstMessage && !category) {
      toast.error('Please select a category for your first message');
      return;
    }

    const messageText = isFirstMessage && category ? `[${category}] ${inputValue.trim()}` : inputValue.trim();
    setInputValue('');
    setCategory('');
    setLoading(true);

    try {
      const { error } = await supabase
        .from('support_messages' as any)
        .insert({
          conversation_id: conversationId,
          user_id: user.id,
          message: messageText,
          sender_type: 'user'
        });

      if (error) throw error;

      // Update conversation last_message_at
      await supabase
        .from('support_conversations' as any)
        .update({ 
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setInputValue(messageText); // Restore message on error
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

  // Don't render anything if user is not logged in
  if (!user) {
    return null;
  }

  if (embedded) {
    const isFirstMessage = messages.length === 0;
    const showCategorySelector = isFirstMessage || conversationStatus === 'closed';
    
    return (
      <div className="flex flex-col h-full">
        {/* Category Selection - Show for first message OR when conversation is closed */}
        {showCategorySelector && (
          <div className="px-4 pt-2 pb-4 border-b">
            <SelectField
              id="category"
              label=""
              value={category}
              onChange={setCategory}
              options={categories}
              placeholder={conversationStatus === 'closed' ? "Select category for new conversation" : "Select a topic category"}
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
                <div className="flex flex-col space-y-1">
                  <div
                    className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                      message.sender_type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : message.message.includes('This ticket has been closed')
                        ? 'bg-muted/70 text-muted-foreground border border-border'
                        : 'bg-muted'
                    }`}
                  >
                    {message.message.includes('This ticket has been closed') 
                      ? "Your ticket has been closed. If you need further assistance, please start a new conversation."
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
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={conversationStatus === 'closed' ? "Start a new conversation..." : "Type your message..."}
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
      </div>
    );
  }

  return (
    <>
      {/* Chat Button */}
      <Button
        onClick={() => {
          setIsOpen(true);
          // Scroll to bottom when chat opens
          setTimeout(() => scrollToBottom(), 200);
        }}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card ref={chatWindowRef} className="fixed bottom-24 right-6 w-80 h-96 shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h3 className="font-semibold">Customer Support</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Category Selection - Show for first message OR when conversation is closed */}
          {(messages.length === 0 || conversationStatus === 'closed') && (
            <div className="px-4 pt-2 pb-4 border-b bg-muted/30">
              <SelectField
                id="category"
                label=""
                value={category}
                onChange={setCategory}
                options={categories}
                placeholder={conversationStatus === 'closed' ? "Select category for new conversation" : "Select a topic category"}
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
                  <div className="flex flex-col space-y-1">
                    <div
                      className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                        message.sender_type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : message.message.includes('This ticket has been closed')
                          ? 'bg-muted/70 text-muted-foreground border border-border'
                          : 'bg-muted'
                      }`}
                     >
                       {message.message.includes('This ticket has been closed') 
                         ? "Your ticket has been closed. If you need further assistance, please start a new conversation."
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
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={conversationStatus === 'closed' ? "Start a new conversation..." : "Type your message..."}
                className="flex-1"
                disabled={loading}
              />
              <Button 
                size="icon" 
                onClick={sendMessage}
                disabled={loading || !inputValue.trim() || ((messages.length === 0 || conversationStatus === 'closed') && !category)}
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

export default SupportChat;