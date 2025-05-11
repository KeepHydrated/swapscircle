
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Send } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Messages = () => {
  // Sample message data
  const conversations = [
    { id: 1, name: "Jane Cooper", message: "Looking forward to our meeting tomorrow!", time: "2 hours ago", unread: true },
    { id: 2, name: "Robert Fox", message: "I'm interested in your listing. Is it still available?", time: "Yesterday", unread: false },
    { id: 3, name: "Esther Howard", message: "Thank you for the quick response!", time: "2 days ago", unread: false },
    { id: 4, name: "Cameron Williamson", message: "Can you provide more details about the item?", time: "1 week ago", unread: false },
  ];

  return (
    <MainLayout>
      <div className="container mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Communicate with other TradeMate users</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle>Conversations</CardTitle>
                <CardDescription>Your recent message threads</CardDescription>
              </CardHeader>
              
              <Tabs defaultValue="all" className="px-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="unread">Unread</TabsTrigger>
                </TabsList>
              </Tabs>

              <CardContent className="flex-grow overflow-y-auto pt-4">
                <div className="space-y-2">
                  {conversations.map((convo) => (
                    <div 
                      key={convo.id}
                      className={`p-3 rounded-lg cursor-pointer flex items-start gap-3 hover:bg-gray-100 transition-colors ${convo.unread ? 'bg-gray-50' : ''}`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={convo.unread ? 'bg-green-100 text-green-800' : 'bg-gray-100'}>
                          {convo.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className={`font-medium truncate ${convo.unread ? 'text-black' : 'text-gray-700'}`}>{convo.name}</p>
                          <span className="text-xs text-gray-500 whitespace-nowrap">{convo.time}</span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{convo.message}</p>
                      </div>
                      {convo.unread && (
                        <span className="h-2 w-2 rounded-full bg-green-500 mt-2"></span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-purple-100 text-purple-800">JC</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>Jane Cooper</CardTitle>
                    <CardDescription>Last active 10 minutes ago</CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-grow overflow-y-auto p-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-end gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-purple-100 text-purple-800">JC</AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 px-4 py-2 rounded-t-xl rounded-r-xl max-w-[80%]">
                      <p className="text-sm">Hi! I saw your listing for the vintage camera. Is it still available?</p>
                      <span className="text-xs text-gray-500 mt-1">2:30 PM</span>
                    </div>
                  </div>

                  <div className="flex items-end justify-end gap-2">
                    <div className="bg-green-600 text-white px-4 py-2 rounded-t-xl rounded-l-xl max-w-[80%]">
                      <p className="text-sm">Yes, it's still available! Are you interested in purchasing it?</p>
                      <span className="text-xs text-green-100 mt-1">2:35 PM</span>
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>You</AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="flex items-end gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-purple-100 text-purple-800">JC</AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 px-4 py-2 rounded-t-xl rounded-r-xl max-w-[80%]">
                      <p className="text-sm">Definitely! Would you be willing to meet up tomorrow to see it in person?</p>
                      <span className="text-xs text-gray-500 mt-1">2:42 PM</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="p-4 border-t">
                <div className="flex items-center w-full gap-2">
                  <Input className="flex-1" placeholder="Type your message..." />
                  <Button size="icon">
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send message</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages;
