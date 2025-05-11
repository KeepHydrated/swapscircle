
import React, { useState, useEffect, useRef } from 'react';
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
import useEmblaCarousel from "embla-carousel-react";

const Messages = () => {
  const [activeConversation, setActiveConversation] = useState<string | null>("1");
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [selectedPairId, setSelectedPairId] = useState<number | null>(1);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    dragFree: true,
  });

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
      item1: { name: "Smart Watch", image: "https://images.unsplash.com/photo-1551816230-ef5deaed4a26" },
      item2: { name: "Fitness Tracker", image: "/placeholder.svg" },
      partnerId: "4"
    },
    { 
      id: 5, 
      item1: { name: "Gaming Console", image: "https://images.unsplash.com/photo-1486572788966-cfd3df1f5b42" },
      item2: { name: "VR Headset", image: "/placeholder.svg" },
      partnerId: "5"
    },
    { 
      id: 6, 
      item1: { name: "Turntable", image: "https://images.unsplash.com/photo-1483058712412-4245e9b90334" },
      item2: { name: "Speakers", image: "/placeholder.svg" },
      partnerId: "3"
    },
    { 
      id: 7, 
      item1: { name: "Headphones", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e" },
      item2: { name: "Earbuds", image: "/placeholder.svg" },
      partnerId: "1"
    },
    { 
      id: 8, 
      item1: { name: "DSLR Camera", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32" },
      item2: { name: "Camera Lens", image: "/placeholder.svg" },
      partnerId: "2"
    },
    { 
      id: 9, 
      item1: { name: "Vintage Radio", image: "https://images.unsplash.com/photo-1583452924150-ea5a6fc8a6a0" },
      item2: { name: "Bluetooth Speaker", image: "/placeholder.svg" },
      partnerId: "5"
    },
    { 
      id: 10, 
      item1: { name: "Record Player", image: "https://images.unsplash.com/photo-1593078166039-c9878df5c520" },
      item2: { name: "Vinyl Records", image: "/placeholder.svg" },
      partnerId: "4"
    },
    { 
      id: 11, 
      item1: { name: "Gaming Mouse", image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7" },
      item2: { name: "Gaming Keyboard", image: "/placeholder.svg" },
      partnerId: "2"
    },
    { 
      id: 12, 
      item1: { name: "Projector", image: "https://images.unsplash.com/photo-1626337920103-ae3bccd889fb" },
      item2: { name: "Projection Screen", image: "/placeholder.svg" },
      partnerId: "3"
    }
  ];

  const handlePairSelect = (partnerId: string, pairId: number) => {
    setActiveConversation(partnerId);
    setSelectedPairId(pairId);
    toast(`Starting conversation about this item exchange`);
  };

  // Get the currently selected pair
  const selectedPair = exchangePairs.find(pair => pair.id === selectedPairId);

  // Update active slide index when carousel scrolls
  useEffect(() => {
    if (!emblaApi) return;
    
    const onScroll = () => {
      const currentIndex = emblaApi.selectedScrollSnap();
      setActiveSlideIndex(currentIndex);
    };
    
    emblaApi.on('scroll', onScroll);
    // Initial call to set the correct starting position
    onScroll();
    
    return () => {
      emblaApi.off('scroll', onScroll);
    };
  }, [emblaApi]);

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-64px)]">
        {/* Item exchange row at the top with carousel */}
        <div className="w-full py-4 border-b border-gray-200">
          <div className="w-full max-w-4xl mx-auto">
            {/* Using direct embla carousel reference for more control */}
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex cursor-grab active:cursor-grabbing">
                {exchangePairs.map((pair) => (
                  <div key={pair.id} className="min-w-0 shrink-0 grow-0 basis-1/3 md:basis-1/4 lg:basis-1/5 pl-4">
                    <div 
                      className={`flex flex-row items-center justify-center cursor-pointer px-2 py-2 rounded-md ${selectedPairId === pair.id ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                      onClick={() => handlePairSelect(pair.partnerId, pair.id)}
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
                  </div>
                ))}
              </div>
            </div>
            
            {/* Custom slider indicator */}
            <div className="flex justify-center items-center mt-4 px-4">
              <div className="w-full max-w-md mx-auto px-4">
                {/* Custom slider that matches the image */}
                <div className="relative h-1 bg-gray-200 rounded-full">
                  <div 
                    className="absolute h-1 bg-gray-500 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(activeSlideIndex + 1) * (100 / (exchangePairs.length / 3))}%`,
                      maxWidth: '100%' 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
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
          <DetailsPanel selectedPair={selectedPair} />
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages;
