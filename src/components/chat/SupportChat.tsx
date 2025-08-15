import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { supportService, SupportMessage } from '@/services/supportService';
import { toast } from 'sonner';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
}

const SupportChat = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load conversation when chat opens
  useEffect(() => {
    if (isOpen && user && !conversationId) {
      loadConversation();
    }
  }, [isOpen, user, conversationId]);

  const loadConversation = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const convId = await supportService.getOrCreateConversation(user.id);
      setConversationId(convId);
      
      const supportMessages = await supportService.getMessages(convId);
      const formattedMessages = supportMessages.map(msg => ({
        id: msg.id,
        text: msg.message,
        sender: msg.sender_type,
        timestamp: new Date(msg.created_at)
      }));
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast.error('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !conversationId || !user) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    // Add message to UI immediately
    setMessages(prev => [...prev, newMessage]);
    const messageText = inputValue;
    setInputValue('');

    try {
      // Save to database
      await supportService.sendMessage(conversationId, messageText, 'user', user.id);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      // Remove message from UI if failed to save
      setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // Don't show chat button if user is not logged in
  if (!user) {
    return null;
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
              <p className="text-sm text-muted-foreground">
                {loading ? 'Loading...' : 'Ask any questions!'}
              </p>
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
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Loading messages...</div>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-sm text-muted-foreground mb-2">👋 Welcome to support!</div>
                    <div className="text-sm text-muted-foreground">How can we help you today?</div>
                  </div>
                )}
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
            )}
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
              <Button size="icon" onClick={sendMessage} disabled={loading || !inputValue.trim()}>
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