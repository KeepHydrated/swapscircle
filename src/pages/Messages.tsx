
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
} from "@/components/ui/carousel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

const Messages = () => {
  const [activeConversation, setActiveConversation] = useState<string | null>("1");
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  
  const activeChat = mockConversations.find(conv => conv.id === activeConversation);

  // Items for exchange with real product names to match the image
  const exchangePairs = [
    { 
      id: 1, 
      item1: { name: "Acoustic Guitar", image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b" },
      item2: { name: "Keyboard", image: "/placeholder.svg" },
      partnerId: "1"
    },
    { 
      id: 2, 
      item1: { name: "Laptop", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f" },
      item2: { name: "Tablet", image: "/placeholder.svg" },
      partnerId: "2"
    },
    { 
      id: 3, 
      item1: { name: "Drone", image: "https://images.unsplash.com/photo-1487887235947-a955ef187fcc" },
      item2: { name: "Camera", image: "/placeholder.svg" },
      partnerId: "3"
    },
    { 
      id: 4, 
      item1: { name: "Smart Watch", image: "/placeholder.svg" },
      item2: { name: "Fitness Tracker", image: "/placeholder.svg" },
      partnerId: "4"
    },
    { 
      id: 5, 
      item1: { name: "Gaming Console", image: "/placeholder.svg" },
      item2: { name: "VR Headset", image: "/placeholder.svg" },
      partnerId: "5"
    },
    { 
      id: 6, 
      item1: { name: "Turntable", image: "https://images.unsplash.com/photo-1483058712412-4245e9b90334" },
      item2: { name: "Speakers", image: "/placeholder.svg" },
      partnerId: "3"
    }
  ];

  const handlePairSelect = (partnerId: string) => {
    setActiveConversation(partnerId);
    toast(`Starting conversation about this item exchange`);
  };

  // Function to handle carousel slide change
  const handleSlideChange = (api: any) => {
    if (!api) return;
    const currentIndex = api.selectedScrollSnap();
    setActiveSlideIndex(currentIndex);
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
              dragFree: true,
            }}
            className="w-full max-w-4xl mx-auto"
            onSelect={handleSlideChange}
          >
            <ScrollArea className="w-full" orientation="horizontal">
              <CarouselContent className="cursor-grab active:cursor-grabbing">
                {exchangePairs.map((pair) => (
                  <CarouselItem key={pair.id} className="basis-1/2 md:basis-1/2 lg:basis-1/3 pl-1">
                    <div 
                      className="flex flex-row items-center justify-center cursor-pointer transition-transform hover:scale-105 px-2"
                      onClick={() => handlePairSelect(pair.partnerId)}
                    >
                      {/* First item */}
                      <div className="flex flex-col items-center">
                        <Avatar className="h-16 w-16 bg-gray-100">
                          <AvatarImage src={pair.item1.image} alt={pair.item1.name} />
                          <AvatarFallback>{pair.item1.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm mt-1 text-gray-700">{pair.item1.name}</span>
                      </div>
                      
                      {/* Exchange icon */}
                      <div className="flex items-center justify-center h-8 w-8 mx-3 rounded-full bg-blue-100">
                        <ArrowLeftRight className="h-4 w-4 text-blue-600" />
                      </div>
                      
                      {/* Second item */}
                      <div className="flex flex-col items-center">
                        <Avatar className="h-16 w-16 bg-gray-100">
                          <AvatarImage src={pair.item2.image} alt={pair.item2.name} />
                          <AvatarFallback>{pair.item2.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm mt-1 text-gray-700">{pair.item2.name}</span>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </ScrollArea>
            <div className="flex justify-center items-center mt-4 px-4">
              <div className="w-full max-w-md mx-auto px-4">
                {/* Custom slider that matches the image */}
                <div className="relative h-1 bg-gray-200 rounded-full">
                  <div 
                    className="absolute h-1 bg-gray-500 rounded-full"
                    style={{ 
                      width: `${(activeSlideIndex + 1) * (100 / exchangePairs.length)}%`,
                      maxWidth: '100%' 
                    }}
                  />
                </div>
              </div>
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
