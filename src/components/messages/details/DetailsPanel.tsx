
import React, { useEffect, useState } from 'react';
import { ArrowLeftRight, ChevronLeft, ChevronRight, Check, Home, Utensils, DollarSign } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import useEmblaCarousel from 'embla-carousel-react';
import ItemDetails from './ItemDetails';
import TradeDetailsTabs from './TradeDetailsTabs';

// Define the interfaces for the props
interface DetailsPanelProps {
  selectedPair?: {
    id: number;
    item1: { name: string; image: string };
    item2: { name: string; image: string };
    partnerId: string;
    partnerProfile?: {
      username: string;
      avatar_url?: string;
      created_at: string;
      location?: string;
    };
  } | null;
}

const DetailsPanel = ({ selectedPair }: DetailsPanelProps = {}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    loop: true,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<'item1' | 'item2'>('item1');
  
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
      {/* Trade Details Tabs */}
      {selectedPair && (
        <TradeDetailsTabs 
          selectedPair={selectedPair}
          selectedItem={selectedItem}
          onSelectItem={handleSelectItem}
        />
      )}
      
      {/* Image Carousel - made smaller */}
      <div className="flex-1 flex flex-col">
        {/* Image carousel */}
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
        
        {/* Replace with ItemDetails component */}
        <ItemDetails 
          name={selectedPair ? selectedPair[selectedItem].name : "Selected Item"} 
          showProfileInfo={true}
          profileData={selectedPair?.partnerProfile}
        />
      </div>
    </div>
  );
};

export default DetailsPanel;
