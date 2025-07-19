
import React, { useEffect, useState } from 'react';
import { ArrowLeftRight, ChevronLeft, ChevronRight, Check, Home, Utensils, DollarSign } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import useEmblaCarousel from 'embla-carousel-react';

// Define the interfaces for the props
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
  const [selectedItem, setSelectedItem] = useState<'item1' | 'item2'>('item2');
  
  // Sample image placeholders for the carousel
  useEffect(() => {
    if (!selectedPair) return;
    
    // Use selected item images and add some placeholder images
    const selectedItemImage = selectedPair[selectedItem].image || "/placeholder.svg";
    const urls = [
      selectedItemImage,
      "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
      "https://images.unsplash.com/photo-1487887235947-a955ef187fcc",
    ];
    setImageUrls(urls);
  }, [selectedPair, selectedItem]);
  
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

  const handleSelectItem = (item: 'item1' | 'item2') => {
    setSelectedItem(item);
    // Reset carousel to first slide when switching items
    if (emblaApi) {
      emblaApi.scrollTo(0);
    }
  };
  
  return (
    <div className="hidden lg:flex lg:flex-col w-80 border-l border-gray-200 bg-gray-50">
      {/* Item connection display at the top of the right panel */}
      {selectedPair && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col bg-gray-200 px-3 py-3 rounded-md mb-4">
            {/* Your Item section */}
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Your Item</h4>
              <div 
                className={`flex items-center cursor-pointer transition-all p-2 rounded ${selectedItem === 'item1' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-100'}`}
                onClick={() => handleSelectItem('item1')}
              >
                <Avatar className="h-12 w-12 bg-gray-100 mr-3 flex-shrink-0">
                  <AvatarImage src={selectedPair.item1.image} alt={selectedPair.item1.name} />
                  <AvatarFallback>{selectedPair.item1.name[0]}</AvatarFallback>
                </Avatar>
                <span className={`text-sm flex-1 ${selectedItem === 'item1' ? 'font-bold text-blue-700' : 'text-gray-700'}`}>
                  {selectedPair.item1.name}
                </span>
              </div>
            </div>
            
            {/* Exchange icon */}
            <div className="flex items-center justify-center mb-3">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100">
                <ArrowLeftRight className="h-3 w-3 text-blue-600" />
              </div>
            </div>
            
            {/* Their Item section */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Their Item</h4>
              <div 
                className={`flex items-center cursor-pointer transition-all p-2 rounded ${selectedItem === 'item2' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-100'}`}
                onClick={() => handleSelectItem('item2')}
              >
                <Avatar className="h-12 w-12 bg-gray-100 mr-3 flex-shrink-0">
                  <AvatarImage src={selectedPair.item2.image} alt={selectedPair.item2.name} />
                  <AvatarFallback>{selectedPair.item2.name[0]}</AvatarFallback>
                </Avatar>
                <span className={`text-sm flex-1 ${selectedItem === 'item2' ? 'font-bold text-blue-700' : 'text-gray-700'}`}>
                  {selectedPair.item2.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Image Carousel - made smaller */}
      <div className="flex-1 flex flex-col">
        {/* Main image container with navigation buttons - reduced height */}
        <div className="relative h-72 bg-gray-100 overflow-hidden">
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
        
        {/* Product details section */}
        <div className="p-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {selectedPair ? selectedPair[selectedItem].name : "Selected Item"}
          </h2>
          
          <p className="text-gray-700 mb-6">
            Like new condition. This item has been gently used and well maintained. Perfect for anyone looking for a high-quality {selectedPair ? selectedPair[selectedItem].name.toLowerCase() : "item"} at a great value.
          </p>
          
          <hr className="mb-4" />
          
          <ul className="flex flex-wrap gap-3">
            <li className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-gray-800 text-sm">Brand New</span>
            </li>
            
            <li className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                <Home className="w-3 h-3 text-blue-600" />
              </div>
              <span className="text-gray-800 text-sm">Home & Garden</span>
            </li>
            
            <li className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                <Utensils className="w-3 h-3 text-purple-600" />
              </div>
              <span className="text-gray-800 text-sm">Kitchen Appliances</span>
            </li>
            
            <li className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                <DollarSign className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-gray-800 text-sm">100 - 250</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DetailsPanel;
