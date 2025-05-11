
import React from 'react';
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
}

interface MatchItem extends Item {
  liked?: boolean;
}

const Home: React.FC = () => {
  // Sample data for my items
  const myItems: Item[] = [
    { id: '1', name: 'Vintage Camera', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32', isSelected: true },
    { id: '2', name: 'Mountain Bike', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e' },
    { id: '3', name: 'Acoustic Guitar', image: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f' },
    { id: '4', name: 'Laptop', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853' },
  ];

  // Sample data for matches
  const matches: MatchItem[] = [
    { id: '1', name: 'DSLR Camera', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32', liked: true },
    { id: '2', name: 'Polaroid Camera', image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f', liked: true },
    { id: '3', name: 'Photography Light', image: 'https://images.unsplash.com/photo-1587614202459-6e6aa7c5aee2', liked: true },
    { id: '4', name: 'Camera Tripod', image: 'https://images.unsplash.com/photo-1557513952-68e6c52558f3', liked: true },
    { id: '5', name: 'Camera Lens', image: 'https://images.unsplash.com/photo-1617005082094-97ea0afcd450', liked: true },
    { id: '6', name: 'Camera Bag', image: 'https://images.unsplash.com/photo-1522204605090-c9a2ae146cb3', liked: true },
    { id: '7', name: 'Flash Light', image: 'https://images.unsplash.com/photo-1564676486339-4c2ba789d9c0', liked: true },
    { id: '8', name: 'Filters', image: 'https://images.unsplash.com/photo-1570741066052-817c6de995c8', liked: true },
    { id: '9', name: 'Memory Card', image: 'https://images.unsplash.com/photo-1499018658500-b21c72d7172b', liked: true },
  ];

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
                <Card key={item.id} className={`overflow-hidden ${item.isSelected ? 'ring-2 ring-green-500' : ''}`}>
                  <div className="relative">
                    <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                      <Avatar className="h-full w-full rounded-none">
                        <AvatarImage src={item.image} alt={item.name} className="object-cover" />
                        <AvatarFallback className="rounded-none text-gray-400 text-xs">
                          400 × 320
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    {item.isSelected && (
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
            <h2 className="text-2xl font-bold mb-4">Matches</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {matches.map((match) => (
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
