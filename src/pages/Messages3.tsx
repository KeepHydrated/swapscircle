
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
      <div className="container mx-auto py-8">
        <div className="mb-12">
          <h1 className="text-2xl font-bold mb-6">Item Matches</h1>
          
          {/* Item matches carousel */}
          <div className="relative">
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
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              
              {/* Navigation arrows outside carousel items */}
              <Button
                variant="outline" 
                size="icon" 
                className="absolute -left-12 top-1/2 -translate-y-1/2 z-10 rounded-full"
                onClick={() => api?.scrollPrev()}
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Previous items</span>
              </Button>
              
              <Button
                variant="outline" 
                size="icon" 
                className="absolute -right-12 top-1/2 -translate-y-1/2 z-10 rounded-full"
                onClick={() => api?.scrollNext()}
              >
                <ArrowRight className="h-5 w-5" />
                <span className="sr-only">Next items</span>
              </Button>
            </Carousel>
          </div>
        </div>

        {/* Match item popup with navigation */}
        {selectedMatch && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
            <div className="relative bg-white rounded-lg max-w-3xl w-full mx-4 overflow-hidden">
              {/* Previous button - show only if not first item */}
              {matchItems.findIndex(item => item.id === selectedMatch.id) > 0 && (
                <Button
                  variant="default"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/90 shadow-lg hover:bg-gray-100 border border-gray-200"
                  onClick={navigateToPrev}
                >
                  <ArrowLeft className="h-6 w-6 text-gray-800" />
                  <span className="sr-only">Previous match</span>
                </Button>
              )}
              
              <ItemDetailsPopup
                item={selectedMatch}
                isOpen={true}
                onClose={handleClosePopup}
                onLikeClick={() => handleLike(selectedMatch.id)}
              />
              
              {/* Next button - show only if not last item */}
              {matchItems.findIndex(item => item.id === selectedMatch.id) < matchItems.length - 1 && (
                <Button
                  variant="default"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/90 shadow-lg hover:bg-gray-100 border border-gray-200"
                  onClick={navigateToNext}
                >
                  <ArrowRight className="h-6 w-6 text-gray-800" />
                  <span className="sr-only">Next match</span>
                </Button>
              )}

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
