import React, { useEffect, useState } from 'react';
import { ArrowLeftRight, ChevronLeft, ChevronRight, Check, Home, Utensils, DollarSign } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import useEmblaCarousel from 'embla-carousel-react';

// Define the interface for the props
interface DetailsPanelProps {
  selectedPair?: {
    id: number;
    item1: { name: string; image: string };
    item2: { name: string; image: string };
  } | null;
}

const DetailsPanel = ({ selectedPair }: DetailsPanelProps = {}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    loop: true,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
  // Sample image placeholders for the carousel
  useEffect(() => {
    // Use selected pair images and add some placeholder images
    const urls = [
      // Add real item images if available
      selectedPair?.item1.image || "/placeholder.svg",
      selectedPair?.item2.image || "/placeholder.svg",
      "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
      "https://images.unsplash.com/photo-1487887235947-a955ef187fcc",
    ];
    setImageUrls(urls);
  }, [selectedPair]);
  
  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    
    emblaApi.on('select', onSelect);
    onSelect();
    
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);
  
  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();
  
  return (
    <div className="hidden lg:flex lg:flex-col w-80 border-l border-gray-200 bg-gray-50">
      {/* Item connection display at the top of the right panel */}
      {selectedPair && (
        <div className="p-4 border-b border-gray-200">
          <div className={`flex flex-row items-center justify-center bg-gray-200 px-2 py-3 rounded-md mb-4`}>
            {/* First item */}
            <div className="flex flex-col items-center">
              <Avatar className="h-12 w-12 bg-gray-100">
                <AvatarImage src={selectedPair.item1.image} alt={selectedPair.item1.name} />
                <AvatarFallback>{selectedPair.item1.name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-xs mt-1 text-gray-700">{selectedPair.item1.name}</span>
            </div>
            
            {/* Exchange icon */}
            <div className="flex items-center justify-center h-8 w-8 mx-3 rounded-full bg-blue-100">
              <ArrowLeftRight className="h-4 w-4 text-blue-600" />
            </div>
            
            {/* Second item */}
            <div className="flex flex-col items-center">
              <Avatar className="h-12 w-12 bg-gray-100">
                <AvatarImage src={selectedPair.item2.image} alt={selectedPair.item2.name} />
                <AvatarFallback>{selectedPair.item2.name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-xs mt-1 text-gray-700">{selectedPair.item2.name}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Image Carousel - made smaller */}
      <div className="flex-1 flex flex-col">
        {/* Main image container with navigation buttons - reduced height */}
        <div className="relative h-56 bg-gray-100 overflow-hidden">
          <div className="overflow-hidden w-full h-full" ref={emblaRef}>
            <div className="flex h-full">
              {imageUrls.map((url, index) => (
                <div key={index} className="flex-[0_0_100%] h-full min-w-0">
                  <div 
                    className="w-full h-full bg-center bg-cover bg-no-repeat flex items-center justify-center text-gray-400"
                    style={{ backgroundImage: `url(${url})` }}
                  >
                    {!url && <span>Image {index + 1}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation buttons */}
          <button 
            onClick={scrollPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <button 
            onClick={scrollNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
          
          {/* Image counter */}
          <div className="absolute bottom-2 right-2 bg-gray-800 bg-opacity-70 text-white text-sm rounded-full px-2 py-0.5">
            {selectedIndex + 1}/{imageUrls.length}
          </div>
        </div>
        
        {/* Thumbnail strip */}
        <div className="p-2 flex overflow-x-auto bg-white border-t border-gray-100">
          {imageUrls.map((url, index) => (
            <div 
              key={index}
              onClick={() => emblaApi?.scrollTo(index)} 
              className={`flex-shrink-0 w-16 h-16 mx-1 cursor-pointer ${selectedIndex === index ? 'border-2 border-blue-500' : 'border border-gray-200'}`}
            >
              <div 
                className="w-full h-full bg-center bg-cover flex items-center justify-center text-gray-400"
                style={{ backgroundImage: `url(${url})` }}
              >
                {!url && <span>Image {index + 1}</span>}
              </div>
            </div>
          ))}
        </div>
        
        {/* Product details section - added based on reference image */}
        <div className="p-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {selectedPair?.item1.name || "Stand Mixer"}
          </h2>
          
          <p className="text-gray-700 mb-6">
            Like new condition. This item has been gently used and well maintained. Perfect for anyone looking for a high-quality stand mixer at a great value.
          </p>
          
          <hr className="mb-4" />
          
          <ul className="space-y-4">
            <li className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-gray-800 font-medium">Brand New</span>
            </li>
            
            <li className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <Home className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-gray-800 font-medium">Home & Garden</span>
            </li>
            
            <li className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                <Utensils className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-gray-800 font-medium">Kitchen Appliances</span>
            </li>
            
            <li className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-gray-800 font-medium">$100 - $250</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DetailsPanel;
