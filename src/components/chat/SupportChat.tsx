import React, { useState, useEffect } from 'react';
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
}

const SupportChat = ({ embedded = false }: SupportChatProps) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);

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
            // If it's an auto-reply message, treat it as support
            // Otherwise, if it's from current user, treat it as user message
            sender: msg.message === "Thanks for your message! I'll get back to you shortly." 
              ? 'support' 
              : (msg.user_id === user.id ? 'user' : 'support'),
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

    // Save user message to database
    const { data: userMessage, error } = await supabase
      .from('support_messages')
      .insert({
        conversation_id: conversationId,
        user_id: user.id,
        message: inputValue,
        sender_type: 'user'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving message:', error);
      return;
    }

    // Add user message to local state
    const newMessage: Message = {
      id: userMessage.id,
      text: userMessage.message,
      sender: 'user',
      timestamp: new Date(userMessage.created_at)
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');

    // Auto-reply from support
    setTimeout(async () => {
      const { data: supportReply } = await supabase
        .from('support_messages')
        .insert({
          conversation_id: conversationId,
          user_id: user.id,
          message: "Thanks for your message! I'll get back to you shortly.",
          sender_type: 'support'
        })
        .select()
        .single();

      if (supportReply) {
        const supportMessage: Message = {
          id: supportReply.id,
          text: supportReply.message,
          sender: 'support',
          timestamp: new Date(supportReply.created_at)
        };
        setMessages(prev => [...prev, supportMessage]);
      }
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  if (embedded) {
    return (
      <div className="flex flex-col h-full">
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