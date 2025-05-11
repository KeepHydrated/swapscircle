
import React, { useState } from 'react';
import { Heart, Check } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Types for our items
interface Item {
  id: string;
  name: string;
  image: string;
  isSelected?: boolean;
  category?: string;
}

interface MatchItem extends Item {
  liked?: boolean;
}

const Home: React.FC = () => {
  // Sample data for my items
  const myItems: Item[] = [
    { id: '1', name: 'Vintage Camera', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32', category: 'photography' },
    { id: '2', name: 'Mountain Bike', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e', category: 'sports' },
    { id: '3', name: 'Acoustic Guitar', image: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f', category: 'music' },
    { id: '4', name: 'Laptop', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853', category: 'electronics' },
  ];

  // Sample data for all possible matches
  const allMatches: MatchItem[] = [
    // Photography matches
    { id: '1', name: 'DSLR Camera', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32', liked: true, category: 'photography' },
    { id: '2', name: 'Polaroid Camera', image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f', liked: true, category: 'photography' },
    { id: '3', name: 'Photography Light', image: 'https://images.unsplash.com/photo-1587614202459-6e6aa7c5aee2', liked: true, category: 'photography' },
    { id: '4', name: 'Camera Tripod', image: 'https://images.unsplash.com/photo-1557513952-68e6c52558f3', liked: true, category: 'photography' },
    { id: '5', name: 'Camera Lens', image: 'https://images.unsplash.com/photo-1617005082094-97ea0afcd450', liked: true, category: 'photography' },
    
    // Sports matches
    { id: '6', name: 'Skateboard', image: 'https://images.unsplash.com/photo-1572506026207-3a3c2e88eb6d', liked: true, category: 'sports' },
    { id: '7', name: 'Surfboard', image: 'https://images.unsplash.com/photo-1531722569936-825d3dd91b15', liked: true, category: 'sports' },
    { id: '8', name: 'Snowboard', image: 'https://images.unsplash.com/photo-1514917595083-c60c4dd11569', liked: true, category: 'sports' },
    
    // Music matches
    { id: '9', name: 'Electric Guitar', image: 'https://images.unsplash.com/photo-1550291652-6ea9114a47b1', liked: true, category: 'music' },
    { id: '10', name: 'Synthesizer', image: 'https://images.unsplash.com/photo-1525373612132-b3e820b87cea', liked: true, category: 'music' },
    { id: '11', name: 'Drum Set', image: 'https://images.unsplash.com/photo-1543443258-92b04ad5ec4b', liked: true, category: 'music' },
    
    // Electronics matches
    { id: '12', name: 'Mechanical Keyboard', image: 'https://images.unsplash.com/photo-1595044426076-d0d745e7c5cc', liked: true, category: 'electronics' },
    { id: '13', name: 'Monitor', image: 'https://images.unsplash.com/photo-1616763355548-1b606f439f86', liked: true, category: 'electronics' },
    { id: '14', name: 'Wireless Headphones', image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b', liked: true, category: 'electronics' },
  ];

  // State for tracking the currently selected item
  const [selectedItemId, setSelectedItemId] = useState<string>('1');
  
  // Find the selected item
  const selectedItem = myItems.find(item => item.id === selectedItemId);
  
  // Filter matches based on the selected item's category
  const filteredMatches = selectedItem 
    ? allMatches.filter(match => match.category === selectedItem.category)
    : allMatches.filter(match => match.category === 'photography'); // Default to photography

  // Handle item selection
  const handleSelectItem = (id: string) => {
    setSelectedItemId(id);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Items Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4">My Items</h2>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              {myItems.map((item) => (
                <Card 
                  key={item.id} 
                  className={`overflow-hidden cursor-pointer ${selectedItemId === item.id ? 'ring-2 ring-green-500' : ''}`}
                  onClick={() => handleSelectItem(item.id)}
                >
                  <div className="relative">
                    <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                      <Avatar className="h-full w-full rounded-none">
                        <AvatarImage src={item.image} alt={item.name} className="object-cover" />
                        <AvatarFallback className="rounded-none text-gray-400 text-xs">
                          400 × 320
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    {selectedItemId === item.id && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                        <Check className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-center">{item.name}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Matches Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4">
              Matches for {selectedItem ? selectedItem.name : 'Selected Item'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredMatches.map((match) => (
                <Card key={match.id} className="overflow-hidden">
                  <div className="relative">
                    <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                      <Avatar className="h-full w-full rounded-none">
                        <AvatarImage src={match.image} alt={match.name} className="object-cover" />
                        <AvatarFallback className="rounded-none text-gray-400 text-xs">
                          400 × 320
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md">
                      <Heart className="h-5 w-5 text-red-500" fill={match.liked ? "red" : "none"} />
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-center">{match.name}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Home;
