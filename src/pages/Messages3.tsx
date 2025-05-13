
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useState } from 'react';
import ItemCard from '@/components/items/ItemCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselPrevious, 
  CarouselNext 
} from "@/components/ui/carousel";
import ItemDetailsPopup from '@/components/profile/carousel/ItemDetailsPopup';

// Sample match items
const matchItems = [
  { id: '1', name: 'Vintage Camera', image: '/placeholder.svg', description: 'A classic film camera from the 1970s' },
  { id: '2', name: 'Bicycle', image: '/placeholder.svg', description: 'Mountain bike in excellent condition' },
  { id: '3', name: 'Leather Jacket', image: '/placeholder.svg', description: 'Genuine leather jacket, barely worn' },
  { id: '4', name: 'Acoustic Guitar', image: '/placeholder.svg', description: 'Handcrafted acoustic guitar with case' },
  { id: '5', name: 'Vintage Watch', image: '/placeholder.svg', description: 'Collectible timepiece from 1960s' },
  { id: '6', name: 'Antique Book', image: '/placeholder.svg', description: 'Rare first edition in mint condition' },
];

const Messages3 = () => {
  const [selectedMatch, setSelectedMatch] = useState<typeof matchItems[0] | null>(null);

  // Handle item selection
  const handleSelectItem = (id: string) => {
    const match = matchItems.find(item => item.id === id);
    if (match) {
      setSelectedMatch(match);
    }
  };

  // Handle like action
  const handleLike = (id: string) => {
    console.log('Liked item:', id);
  };

  // Close the popup
  const handleClosePopup = () => {
    setSelectedMatch(null);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Browse Matches</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {matchItems.map(item => (
            <ItemCard
              key={item.id}
              id={item.id}
              name={item.name}
              image={item.image}
              isMatch={true}
              onSelect={handleSelectItem}
              onLike={handleLike}
            />
          ))}
        </div>

        {/* Match item popup with navigation */}
        {selectedMatch && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="relative bg-white rounded-lg max-w-3xl w-full mx-4 overflow-hidden">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 ml-2 z-20">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-white shadow-md hover:bg-gray-100"
                  onClick={() => {
                    const currentIndex = matchItems.findIndex(item => item.id === selectedMatch.id);
                    const prevIndex = (currentIndex - 1 + matchItems.length) % matchItems.length;
                    setSelectedMatch(matchItems[prevIndex]);
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Previous match</span>
                </Button>
              </div>
              
              <ItemDetailsPopup
                item={selectedMatch}
                isOpen={true}
                onClose={handleClosePopup}
                onLikeClick={() => handleLike(selectedMatch.id)}
              />
              
              <div className="absolute right-0 top-1/2 -translate-y-1/2 mr-2 z-20">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-white shadow-md hover:bg-gray-100"
                  onClick={() => {
                    const currentIndex = matchItems.findIndex(item => item.id === selectedMatch.id);
                    const nextIndex = (currentIndex + 1) % matchItems.length;
                    setSelectedMatch(matchItems[nextIndex]);
                  }}
                >
                  <ArrowRight className="h-4 w-4" />
                  <span className="sr-only">Next match</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Messages3;
