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
import { useRealtimeSupportMessages } from '@/hooks/useRealtimeSupportMessages';

interface SupportMessage {
  id: string;
  message: string;
  sender_type: 'user' | 'support';
  created_at: string;
  is_read: boolean;
  conversation_id: string;
}

interface ConversationSeparator {
  id: string;
  type: 'separator';
  conversation_id: string;
  created_at: string;
  status: 'open' | 'closed';
}

interface SupportChatProps {
  embedded?: boolean;
}

const SupportChat = ({ embedded = false }: SupportChatProps) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [allHistoryItems, setAllHistoryItems] = useState<(SupportMessage | ConversationSeparator)[]>([]);
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

  // Auto-scroll when history changes
  useEffect(() => {
    console.log('History changed, scrolling to bottom. Item count:', allHistoryItems.length);
    // Use setTimeout to ensure DOM is updated before scrolling
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  }, [allHistoryItems]);

  // Initialize conversation and load messages
  useEffect(() => {
    if (!user?.id) return;
    initializeConversation();
  }, [user?.id]);

  // Use real-time hook for support messages
  console.log('🔌 Setting up real-time for conversation ID:', conversationId, 'user ID:', user?.id);
  
  useRealtimeSupportMessages({
    conversationId,
    onNewMessage: (newMessage) => {
      console.log('📨 New message callback triggered:', newMessage);
      
      // Check if it's a closure message and update conversation status
      if (newMessage.sender_type === 'support' && newMessage.message.includes('This ticket has been closed')) {
        console.log('🔒 Detected closure message, updating status to closed');
        setConversationStatus('closed');
      }
      
      setMessages(prev => {
        // Avoid duplicates by checking if message already exists
        const exists = prev.some(msg => msg.id === newMessage.id);
        if (exists) {
          console.log('⚠️ Message already exists in messages, skipping');
          return prev;
        }
        console.log('✅ Adding new message to messages state');
        return [...prev, newMessage];
      });

      // Also add to full history
      setAllHistoryItems(prev => {
        // Avoid duplicates by checking if message already exists
        const exists = prev.some(item => 'id' in item && item.id === newMessage.id);
        if (exists) {
          console.log('⚠️ Message already exists in history, skipping');
          return prev;
        }
        console.log('✅ Adding new message to history state');
        return [...prev, newMessage];
      });
    },
    onConversationUpdate: (status) => {
      console.log('🔄 Conversation status update callback:', status);
      setConversationStatus(status);
    }
  });

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
      // Find or create a single conversation for the user
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
        // Use existing conversation
        currentConversationId = (conversations as any)[0].id;
        currentStatus = (conversations as any)[0].status;
      } else {
        // Create new conversation if none exists
        const { data: newConversation, error: createError } = await supabase
          .from('support_conversations' as any)
          .insert({
            user_id: user.id,
            status: 'open'
          })
          .select('id, status, created_at')
          .single();

        if (createError) throw createError;
        
        currentConversationId = (newConversation as any).id;
        currentStatus = (newConversation as any).status;
        
        // Add welcome message to new conversation
        const { error: welcomeError } = await supabase
          .from('support_messages' as any)
          .insert({
            conversation_id: currentConversationId,
            user_id: user.id,
            message: "Hi! How can I help you today?",
            sender_type: 'support'
          });

        if (welcomeError) throw welcomeError;
      }

      setConversationId(currentConversationId);
      setConversationStatus(currentStatus);

      // Load all messages from the single conversation
      const { data: allMessages, error: messagesError } = await supabase
        .from('support_messages' as any)
        .select('*')
        .eq('conversation_id', currentConversationId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      // Set messages for both display and logic (no separators needed)
      setMessages((allMessages as any) || []);
      setAllHistoryItems((allMessages as any) || []);

    } catch (error) {
      console.error('Error initializing conversation:', error);
      toast.error('Failed to initialize support chat');
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !user?.id) return;

    console.log('sendMessage called with:', { 
      inputValue: inputValue.trim(), 
      conversationStatus, 
      conversationId, 
      category,
      messagesLength: messages.length 
    });

    let currentConversationId = conversationId;

    if (!currentConversationId) {
      console.error('No conversationId available');
      toast.error('Could not establish conversation. Please try again.');
      return;
    }

    // Check if this is the first user message (only welcome message exists)
    const isFirstMessage = messages.length <= 1;
    
    // Require category for first message OR when conversation is closed
    if ((isFirstMessage || conversationStatus === 'closed') && !category) {
      const errorMsg = conversationStatus === 'closed' 
        ? 'Please select a category to continue the conversation' 
        : 'Please select a category for your first message';
      toast.error(errorMsg);
      return;
    }

    const messageText = (isFirstMessage || conversationStatus === 'closed') && category 
      ? `[${category}] ${inputValue.trim()}` 
      : inputValue.trim();
    console.log('Sending message:', { messageText, currentConversationId, isFirstMessage, conversationStatus });
    
    setInputValue('');
    setCategory('');
    setLoading(true);

    try {
      const { error } = await supabase
        .from('support_messages' as any)
        .insert({
          conversation_id: currentConversationId,
          user_id: user.id,
          message: messageText,
          sender_type: 'user'
        });

      if (error) throw error;
      
      console.log('Message sent successfully');

      // Update conversation last_message_at and status (reopen if closed)
      const updateData: any = { 
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // If conversation was closed, reopen it
      if (conversationStatus === 'closed') {
        updateData.status = 'open';
        setConversationStatus('open');
      }

      await supabase
        .from('support_conversations' as any)
        .update(updateData)
        .eq('id', currentConversationId);

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

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderHistoryItem = (item: SupportMessage | ConversationSeparator) => {
    // Since we're using a single conversation, no separators needed
    const message = item as SupportMessage;
    return (
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
              ? "Ticket closed"
              : message.message}
          </div>
          <span className="text-xs text-muted-foreground px-1">
            {formatTime(message.created_at)}
          </span>
        </div>
      </div>
    );
  };

  // Don't render anything if user is not logged in
  if (!user) {
    return null;
  }

  if (embedded) {
    const isFirstMessage = messages.length <= 1;
    const showCategorySelector = isFirstMessage || conversationStatus === 'closed';
    
    return (
      <div className="flex flex-col h-full">
        {/* Category Selection - Show for first message OR when conversation is closed */}
        {showCategorySelector && (
          <div className="px-4 pt-2 pb-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SelectField
              id="category"
              label=""
              value={category}
              onChange={setCategory}
              options={categories}
              placeholder={conversationStatus === 'closed' 
                ? "Select category to continue conversation" 
                : "Select a topic category"}
              className="z-50"
            />
          </div>
        )}
        
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {allHistoryItems.map(renderHistoryItem)}
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
              placeholder={conversationStatus === 'closed' 
                ? "Continue conversation..." 
                : "Type your message..."}
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
          {(messages.length <= 1 || conversationStatus === 'closed') && (
            <div className="px-4 pt-2 pb-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <SelectField
                id="category"
                label=""
                value={category}
                onChange={setCategory}
                options={categories}
                placeholder={conversationStatus === 'closed' 
                  ? "Select category to continue conversation" 
                  : "Select a topic category"}
                className="z-50"
              />
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {allHistoryItems.map(renderHistoryItem)}
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
                placeholder={(() => {
                  const lastMessage = messages[messages.length - 1];
                  const isWaitingForResponse = lastMessage && lastMessage.sender_type === 'user' && conversationStatus === 'open' && messages.length > 1;
                  return isWaitingForResponse 
                    ? "Waiting for support response..." 
                    : conversationStatus === 'closed' 
                    ? "Continue conversation..." 
                    : "Type your message...";
                })()}
                className="flex-1"
                disabled={loading || (() => {
                  const lastMessage = messages[messages.length - 1];
                  return lastMessage && lastMessage.sender_type === 'user' && conversationStatus === 'open' && messages.length > 1;
                })()}
              />
              <Button 
                size="icon" 
                onClick={sendMessage}
                disabled={loading || !inputValue.trim() || ((messages.length <= 1 || conversationStatus === 'closed') && !category) || (() => {
                  const lastMessage = messages[messages.length - 1];
                  return lastMessage && lastMessage.sender_type === 'user' && conversationStatus === 'open' && messages.length > 1;
                })()}
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