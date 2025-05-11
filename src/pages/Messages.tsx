
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ConversationList from '@/components/messages/ConversationList';
import ChatArea from '@/components/messages/ChatArea';
import DetailsPanel from '@/components/messages/DetailsPanel';
import { mockConversations } from '@/data/conversations';
import { ArrowLeftRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { toast } from "sonner";

const Messages = () => {
  const [activeConversation, setActiveConversation] = useState<string | null>("1");
  
  const activeChat = mockConversations.find(conv => conv.id === activeConversation);

  // Mock items for the exchange with more items
  const exchangeItems = [
    { id: 1, name: "Blender", image: "/placeholder.svg", partnerId: "1" },
    { id: 2, name: "Stand Mixer", image: "/placeholder.svg", partnerId: "2" },
    { id: 3, name: "Coffee Machine", image: "/placeholder.svg", partnerId: "3" },
    { id: 4, name: "Toaster", image: "/placeholder.svg", partnerId: "4" },
    { id: 5, name: "Food Processor", image: "/placeholder.svg", partnerId: "5" },
  ];

  const handleItemSelect = (partnerId: string) => {
    setActiveConversation(partnerId);
    toast(`Starting conversation about this item exchange`);
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-64px)]">
        {/* Item exchange row at the top with carousel */}
        <div className="w-full py-4 border-b border-gray-200">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-md mx-auto"
          >
            <CarouselContent>
              {exchangeItems.map((item, index) => (
                <CarouselItem key={item.id} className="basis-1/2 md:basis-1/3 lg:basis-1/4 pl-1">
                  <div 
                    className="flex flex-col items-center cursor-pointer transition-transform hover:scale-105"
                    onClick={() => handleItemSelect(item.partnerId)}
                  >
                    <div className="relative">
                      <Avatar className="h-16 w-16 bg-gray-100">
                        <AvatarImage src={item.image} alt={item.name} />
                        <AvatarFallback>{item.name[0]}</AvatarFallback>
                      </Avatar>
                      
                      {index % 2 === 0 && (
                        <div className="absolute -bottom-2 -right-2 flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                          <ArrowLeftRight className="h-4 w-4 text-blue-600" />
                        </div>
                      )}
                    </div>
                    <span className="text-sm mt-2 text-gray-700 text-center">{item.name}</span>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center mt-2">
              <CarouselPrevious className="relative left-0 translate-y-0 mr-2" />
              <CarouselNext className="relative right-0 translate-y-0" />
            </div>
          </Carousel>
        </div>
        
        <div className="flex flex-1">
          {/* Conversations sidebar */}
          <ConversationList 
            conversations={mockConversations}
            activeConversation={activeConversation}
            setActiveConversation={setActiveConversation}
          />
          
          {/* Chat area */}
          <ChatArea activeChat={activeChat} />
          
          {/* Details panel */}
          <DetailsPanel />
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages;
