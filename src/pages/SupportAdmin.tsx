import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supportService, SupportMessage } from '@/services/supportService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle, Users, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ConversationWithDetails {
  id: string;
  user_id: string;
  status: 'open' | 'closed';
  last_message_at: string;
  created_at: string;
  user_name: string;
  user_email: string;
  latest_message: string;
}

const SupportAdmin = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Check if user is admin (nadiachibri@gmail.com)
  const isAdmin = user?.email === 'nadiachibri@gmail.com';

  useEffect(() => {
    if (isAdmin) {
      loadConversations();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await supportService.getAllConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setMessagesLoading(true);
      const data = await supportService.getMessages(conversationId);
      setMessages(data);
      // Mark messages as read
      await supportService.markMessagesAsRead(conversationId);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  const sendReply = async () => {
    if (!inputValue.trim() || !selectedConversation || !user) return;

    try {
      await supportService.sendMessage(selectedConversation, inputValue, 'support', user.id);
      setInputValue('');
      // Reload messages to show the new reply
      await loadMessages(selectedConversation);
      // Reload conversations to update last message timestamp
      await loadConversations();
      toast.success('Reply sent');
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendReply();
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </Card>
      </div>
    );
  }

  const selectedConversationData = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageCircle className="h-8 w-8" />
            Support Admin
          </h1>
          <p className="text-muted-foreground mt-2">Manage customer support conversations</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Conversations
                </h2>
                <Badge variant="secondary">
                  {conversations.length}
                </Badge>
              </div>
            </div>
            <ScrollArea className="h-[calc(100%-60px)]">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Loading conversations...
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No conversations yet
                </div>
              ) : (
                <div className="p-2">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                        selectedConversation === conversation.id
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium truncate">
                          {conversation.user_name}
                        </div>
                        <Badge variant={conversation.status === 'open' ? 'default' : 'secondary'}>
                          {conversation.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground truncate mb-2">
                        {conversation.latest_message}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(conversation.last_message_at), 'MMM d, HH:mm')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2">
            {selectedConversation ? (
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{selectedConversationData?.user_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Conversation started {format(new Date(selectedConversationData?.created_at || ''), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Badge variant={selectedConversationData?.status === 'open' ? 'default' : 'secondary'}>
                      {selectedConversationData?.status}
                    </Badge>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-sm text-muted-foreground">Loading messages...</div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_type === 'support' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                              message.sender_type === 'support'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <div>{message.message}</div>
                            <div className={`text-xs mt-1 ${
                              message.sender_type === 'support' 
                                ? 'text-primary-foreground/70' 
                                : 'text-muted-foreground'
                            }`}>
                              {format(new Date(message.created_at), 'MMM d, HH:mm')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {/* Reply Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your reply..."
                      className="flex-1"
                    />
                    <Button size="icon" onClick={sendReply} disabled={!inputValue.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SupportAdmin;