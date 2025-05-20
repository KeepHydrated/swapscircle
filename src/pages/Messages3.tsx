
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ItemDetailsPopup from '@/components/profile/carousel/ItemDetailsPopup';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem,
  type CarouselApi
} from '@/components/ui/carousel';

// Sample match items
const matchItems = [
  { id: '1', name: 'Vintage Camera', image: '/placeholder.svg', description: 'A classic film camera from the 1970s' },
  { id: '2', name: 'Bicycle', image: '/placeholder.svg', description: 'Mountain bike in excellent condition' },
  { id: '3', name: 'Leather Jacket', image: '/placeholder.svg', description: 'Genuine leather jacket, barely worn' },
  { id: '4', name: 'Acoustic Guitar', image: '/placeholder.svg', description: 'Handcrafted acoustic guitar with case' },
  { id: '5', name: 'Vintage Watch', image: '/placeholder.svg', description: 'Collectible timepiece from 1960s' },
  { id: '6', name: 'Antique Book', image: '/placeholder.svg', description: 'Rare first edition in mint condition' },
  { id: '7', name: 'Synthesizer', image: '/placeholder.svg', description: 'Electronic music synthesizer in perfect condition' },
  { id: '8', name: 'Camera Lens', image: '/placeholder.svg', description: 'Professional camera lens, barely used' },
];

const Messages3 = () => {
  const [selectedMatch, setSelectedMatch] = useState<typeof matchItems[0] | null>(null);
  const [api, setApi] = React.useState<CarouselApi>();
  
  // Handle item selection
  const handleSelectItem = (match: typeof matchItems[0]) => {
    setSelectedMatch(match);
  };

  // Handle like action
  const handleLike = (id: string) => {
    console.log('Liked item:', id);
  };

  // Close the popup
  const handleClosePopup = () => {
    setSelectedMatch(null);
  };

  // Navigate to previous item
  const navigateToPrev = () => {
    if (!selectedMatch) return;
    const currentIndex = matchItems.findIndex(item => item.id === selectedMatch.id);
    const prevIndex = (currentIndex - 1 + matchItems.length) % matchItems.length;
    setSelectedMatch(matchItems[prevIndex]);
  };

  // Navigate to next item
  const navigateToNext = () => {
    if (!selectedMatch) return;
    const currentIndex = matchItems.findIndex(item => item.id === selectedMatch.id);
    const nextIndex = (currentIndex + 1) % matchItems.length;
    setSelectedMatch(matchItems[nextIndex]);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="mb-10">
          <h2 className="text-xl font-medium mb-6 text-gray-600">Your Match Opportunities</h2>
          
          {/* Item matches carousel */}
          <div className="relative px-12"> {/* Added padding for arrow space */}
            <Carousel
              setApi={setApi}
              className="w-full"
              opts={{
                align: 'start',
              }}
            >
              <CarouselContent>
                {matchItems.map((item) => (
                  <CarouselItem key={item.id} className="basis-1/4 md:basis-1/5 lg:basis-1/6">
                    <div 
                      className="cursor-pointer" 
                      onClick={() => handleSelectItem(item)}
                    >
                      <div className="relative aspect-square overflow-hidden rounded-lg mb-2 bg-gray-100">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <h3 className="text-sm font-medium text-center truncate">{item.name}</h3>
                      <p className="text-xs text-center text-gray-500">Matched Item</p>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              
              {/* Navigation arrows inside the container */}
              <Button
                variant="default" 
                size="icon" 
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white shadow-lg h-10 w-10 border border-gray-200"
                onClick={() => api?.scrollPrev()}
              >
                <ArrowLeft className="h-5 w-5 text-gray-800" />
                <span className="sr-only">Previous matches</span>
              </Button>
              
              <Button
                variant="default" 
                size="icon" 
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white shadow-lg h-10 w-10 border border-gray-200"
                onClick={() => api?.scrollNext()}
              >
                <ArrowRight className="h-5 w-5 text-gray-800" />
                <span className="sr-only">Next matches</span>
              </Button>
            </Carousel>
          </div>
        </div>

        {/* Match item popup with navigation */}
        {selectedMatch && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
            <div className="relative max-w-3xl w-full mx-4">
              {/* External navigation buttons */}
              <Button
                variant="default"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/90 shadow-lg hover:bg-gray-100 border border-gray-200"
                onClick={navigateToPrev}
              >
                <ArrowLeft className="h-6 w-6 text-gray-800" />
                <span className="sr-only">Previous match</span>
              </Button>
              
              <div className="bg-white rounded-lg overflow-hidden">
                <ItemDetailsPopup
                  item={selectedMatch}
                  isOpen={true}
                  onClose={handleClosePopup}
                  onLikeClick={() => handleLike(selectedMatch.id)}
                />
              </div>
              
              <Button
                variant="default"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/90 shadow-lg hover:bg-gray-100 border border-gray-200"
                onClick={navigateToNext}
              >
                <ArrowRight className="h-6 w-6 text-gray-800" />
                <span className="sr-only">Next match</span>
              </Button>

              {/* Visual indicator showing current position */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-full px-3 py-1 text-sm font-medium shadow-md z-20">
                {matchItems.findIndex(item => item.id === selectedMatch.id) + 1} / {matchItems.length}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Messages3;
