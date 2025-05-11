
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
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

const Messages = () => {
  const [activeConversation, setActiveConversation] = useState<string | null>("1");
  const [sliderValue, setSliderValue] = useState([33]);
  
  const activeChat = mockConversations.find(conv => conv.id === activeConversation);

  // Organize items into pairs for exchange
  const exchangePairs = [
    { 
      id: 1, 
      item1: { name: "Blender", image: "/placeholder.svg" },
      item2: { name: "Stand Mixer", image: "/placeholder.svg" },
      partnerId: "1"
    },
    { 
      id: 2, 
      item1: { name: "Coffee Machine", image: "/placeholder.svg" },
      item2: { name: "Toaster", image: "/placeholder.svg" },
      partnerId: "2"
    },
    { 
      id: 3, 
      item1: { name: "Food Processor", image: "/placeholder.svg" },
      item2: { name: "Juicer", image: "/placeholder.svg" },
      partnerId: "3"
    },
    { 
      id: 4, 
      item1: { name: "Waffle Maker", image: "/placeholder.svg" },
      item2: { name: "Air Fryer", image: "/placeholder.svg" },
      partnerId: "4"
    }
  ];

  const handlePairSelect = (partnerId: string) => {
    setActiveConversation(partnerId);
    toast(`Starting conversation about this item exchange`);
  };

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value);
    // You can use this value to control the carousel position if needed
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
            className="w-full max-w-4xl mx-auto"
          >
            <CarouselContent>
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
            <div className="flex justify-between items-center mt-4 px-4">
              <CarouselPrevious className="relative left-0 translate-y-0" />
              <div className="w-full px-4 max-w-xs mx-auto">
                <Slider
                  value={sliderValue}
                  onValueChange={handleSliderChange}
                  max={100}
                  step={1}
                  className="cursor-pointer"
                />
              </div>
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
