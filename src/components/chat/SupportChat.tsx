import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
}

interface SupportChatProps {
  embedded?: boolean;
  asSupport?: boolean;
}

const SupportChat = ({ embedded = false, asSupport = false }: SupportChatProps) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get or create conversation and fetch messages
  useEffect(() => {
    const initializeConversation = async () => {
      if (!user?.id) return;

      // First, try to find existing conversation
      let { data: conversation } = await supabase
        .from('support_conversations')
        .select('id')
        .eq('user_id', user.id)
        .single();

      // If no conversation exists, create one
      if (!conversation) {
        const { data: newConversation } = await supabase
          .from('support_conversations')
          .insert({ user_id: user.id })
          .select('id')
          .single();
        
        conversation = newConversation;
      }

      if (conversation) {
        setConversationId(conversation.id);

        // Now fetch messages for this conversation
        const { data: supportMessages } = await supabase
          .from('support_messages')
          .select('*')
          .eq('conversation_id', conversation.id)
          .order('created_at', { ascending: true });

        if (supportMessages) {
          const formattedMessages: Message[] = supportMessages.map(msg => ({
            id: msg.id,
            text: msg.message,
            sender: msg.sender_type as 'user' | 'support',
            timestamp: new Date(msg.created_at)
          }));

          setMessages(formattedMessages);
        }
      }
    };

    initializeConversation();
  }, [user?.id]);

  // Don't show chat button if user is not logged in
  if (!user) {
    return null;
  }

  const sendMessage = async () => {
    if (!inputValue.trim() || !user?.id || !conversationId) return;

    // Determine sender type based on mode
    const senderType = asSupport ? 'support' : 'user';

    // Save message to database
    const { data: newMessage, error } = await supabase
      .from('support_messages')
      .insert({
        conversation_id: conversationId,
        user_id: user.id,
        message: inputValue,
        sender_type: senderType
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving message:', error);
      return;
    }

    // Add message to local state
    const messageObj: Message = {
      id: newMessage.id,
      text: newMessage.message,
      sender: asSupport ? 'support' : 'user',
      timestamp: new Date(newMessage.created_at)
    };

    setMessages(prev => [...prev, messageObj]);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  if (embedded) {
    return (
      <div className="flex flex-col h-full max-h-full">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4 max-h-0">
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t flex-shrink-0">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={asSupport ? "Reply as support..." : "Type your message..."}
              className="flex-1"
            />
            <Button size="icon" onClick={sendMessage}>
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
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-80 h-96 shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h3 className="font-semibold">Support Chat</h3>
              <p className="text-sm text-muted-foreground">Ask any questions!</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.text}
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
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button size="icon" onClick={sendMessage}>
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