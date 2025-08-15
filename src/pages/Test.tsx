import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageCircle, User } from 'lucide-react';
import { supportService, SupportMessage, SupportConversation } from '@/services/supportService';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import MainLayout from '@/components/layout/MainLayout';

interface ConversationWithDetails extends SupportConversation {
  user_name: string;
  user_email: string;
  latest_message: string;
}

const Test = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Check if current user is the admin (you)
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
      const convos = await supportService.getAllConversations();
      setConversations(convos);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const msgs = await supportService.getMessages(conversationId);
      setMessages(msgs);
      await supportService.markMessagesAsRead(conversationId);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const sendReply = async () => {
    if (!inputValue.trim() || !selectedConversation || !user) return;

    try {
      await supportService.sendMessage(selectedConversation, inputValue, 'support', user.id);
      setInputValue('');
      await loadMessages(selectedConversation);
      await loadConversations();
      toast.success('Reply sent');
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendReply();
    }
  };

  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-muted-foreground">This page is only accessible to administrators.</p>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Support Messages</h1>
          <p className="text-muted-foreground">Manage customer support conversations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Conversations</h2>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="text-sm text-muted-foreground">Loading conversations...</div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-sm text-muted-foreground">No conversations yet</div>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100%-60px)]">
                <div className="space-y-2">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedConversation === conversation.id
                          ? 'bg-primary/10 border-primary border'
                          : 'bg-muted hover:bg-muted/70'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium text-sm">{conversation.user_name}</span>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          conversation.status === 'open' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {conversation.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {conversation.latest_message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(conversation.last_message_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b">
                  <h3 className="font-semibold">Support Chat</h3>
                  <p className="text-sm text-muted-foreground">
                    Conversation with {conversations.find(c => c.id === selectedConversation)?.user_name}
                  </p>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_type === 'support' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            message.sender_type === 'support'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <p className={`text-xs mt-1 opacity-70`}>
                            {new Date(message.created_at).toLocaleTimeString()}
                          </p>
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
                      placeholder="Type your reply..."
                      className="flex-1"
                    />
                    <Button onClick={sendReply} disabled={!inputValue.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a Conversation</h3>
                  <p className="text-muted-foreground">Choose a conversation from the list to start chatting</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Test;