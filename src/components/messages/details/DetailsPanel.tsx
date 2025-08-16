
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
    item1: { 
      name: string; 
      image: string;
      image_url?: string;
      image_urls?: string[];
      price_range_min?: number;
      price_range_max?: number;
      condition?: string;
      category?: string;
    };
    item2: { 
      name: string; 
      image: string;
      image_url?: string;
      image_urls?: string[];
      price_range_min?: number;
      price_range_max?: number;
      condition?: string;
      category?: string;
    };
    partnerId: string;
    partnerProfile?: {
      id: string;
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
  const [selectedItem, setSelectedItem] = useState<'item1' | 'item2'>('item2');
  
  // Use all available item images
  useEffect(() => {
    if (!selectedPair) return;
    
    // Get all images for the selected item (handle both single image and multiple images)
    const selectedItemData = selectedPair[selectedItem];
    let urls: string[] = [];
    
    if (selectedItemData.image_urls && selectedItemData.image_urls.length > 0) {
      urls = selectedItemData.image_urls;
    } else if (selectedItemData.image_url) {
      urls = [selectedItemData.image_url];
    } else if (selectedItemData.image) {
      urls = [selectedItemData.image];
    }
    
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
    <div className="flex flex-col h-full bg-gray-50">{/* Ensure proper height containment */}
      {/* Trade Details Tabs */}
      {selectedPair && (
        <TradeDetailsTabs 
          selectedPair={selectedPair}
          selectedItem={selectedItem}
          onSelectItem={handleSelectItem}
        />
      )}
      
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Image carousel - made much smaller */}
        <div className="relative h-40 bg-gray-100 overflow-hidden">{/* Reduced from h-56 to h-40 */}
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
        
        {/* Thumbnail strip - made smaller */}
        <div className="p-2 flex overflow-x-auto bg-white border-t border-gray-100">
          {imageUrls.map((url, index) => (
            <div 
              key={index}
              onClick={() => emblaApi?.scrollTo(index)} 
              className={`flex-shrink-0 w-12 h-12 mx-1 cursor-pointer ${selectedIndex === index ? 'border-2 border-blue-500' : 'border border-gray-200'}`}
            >{/* Reduced thumbnail size from w-16 h-16 to w-12 h-12 */}
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
          itemData={selectedPair ? selectedPair[selectedItem] : undefined}
        />
      </div>
    </div>
  );
};

export default DetailsPanel;
