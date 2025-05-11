
import React, { useState } from 'react';
import { Search, Paperclip, Send, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import MainLayout from '@/components/layout/MainLayout';

type Conversation = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  avatar?: string;
  rating?: number;
  isNew?: boolean;
  distance?: string;
};

const Messages = () => {
  const [activeConversation, setActiveConversation] = useState<string | null>("1");
  const [messageInput, setMessageInput] = useState("");
  
  const conversations: Conversation[] = [
    {
      id: "1",
      name: "Emma Wilson",
      lastMessage: "Be the first to reach out and start the conversation.",
      time: "New match",
      rating: 5,
      distance: "2.3 mi away",
      isNew: true
    },
    {
      id: "2",
      name: "Sarah Johnson",
      lastMessage: "Would you like to meet up sometime this week?",
      time: "Today, 10:30 AM"
    },
    {
      id: "3",
      name: "Michael Thompson",
      lastMessage: "I can drop it off this weekend if that works for you.",
      time: "Today, 9:15 AM"
    },
    {
      id: "4",
      name: "Jessica Lee",
      lastMessage: "Great, I'll take it! When can we meet?",
      time: "Yesterday, 5:45 PM"
    },
    {
      id: "5",
      name: "David Rodriguez",
      lastMessage: "Would you consider trading for my blender?",
      time: "Mon, 3:20 PM"
    }
  ];

  const activeChat = conversations.find(conv => conv.id === activeConversation);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // Here you would normally send the message to your backend
      // For now we'll just clear the input
      setMessageInput("");
    }
  };

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-64px)]">
        {/* Conversations sidebar */}
        <div className="w-full md:w-96 border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Search messages..." 
                className="pl-10"
              />
            </div>
          </div>
          
          <ScrollArea className="h-[calc(100vh-130px)]">
            {conversations.map((conversation) => (
              <div 
                key={conversation.id}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${activeConversation === conversation.id ? 'bg-gray-50' : ''}`}
                onClick={() => setActiveConversation(conversation.id)}
              >
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-purple-100 text-purple-800">
                      {conversation.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-medium truncate">{conversation.name}</h3>
                      <span className="text-xs text-gray-500">{conversation.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>
        
        {/* Chat area */}
        <div className="hidden md:flex flex-col flex-1">
          {activeChat ? (
            <>
              {/* Chat header */}
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-purple-100 text-purple-800">
                      {activeChat.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center">
                      <h2 className="font-medium">{activeChat.name}</h2>
                      {activeChat.rating && (
                        <div className="ml-2 flex text-yellow-400">
                          {"★".repeat(activeChat.rating)}
                          <span className="ml-1 text-gray-500 text-sm">({42})</span>
                        </div>
                      )}
                    </div>
                    {activeChat.distance && (
                      <p className="text-sm text-gray-500 flex items-center">
                        <span className="mr-2">📍 {activeChat.distance}</span>
                        {activeChat.isNew && <span>• New match</span>}
                      </p>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Chat messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="flex justify-center my-8">
                  <p className="text-blue-500">{activeChat.lastMessage}</p>
                </div>
                
                {/* This section would contain the actual messages
                    For now, we're showing just the product info card for Emma */}
                {activeChat.id === "1" && (
                  <Card className="mx-auto max-w-lg p-4 mb-8">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold">Blender</h3>
                    </div>
                    <div className="bg-gray-100 rounded-md h-48 mb-4 flex items-center justify-center">
                      <span className="text-gray-400 text-lg">Product Image</span>
                    </div>
                    <p className="text-gray-700">
                      This is the item you'll be trading away. It's currently listed for exchange with your trading partner.
                    </p>
                  </Card>
                )}
              </ScrollArea>
              
              {/* Message input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Input 
                    placeholder="Type a message..." 
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    size="icon"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
        
        {/* New column on the far right */}
        <div className="hidden lg:block w-80 border-l border-gray-200 bg-gray-50">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-lg">Details</h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">About</h3>
                <p className="text-sm">
                  Additional information about the conversation or user could appear here.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Shared Files</h3>
                <div className="bg-white p-3 rounded-md border border-gray-200">
                  <p className="text-sm text-gray-500">No files shared yet</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start text-sm">
                    View Profile
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-sm">
                    Block User
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-sm text-red-500 hover:text-red-600">
                    Report Issue
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages;
