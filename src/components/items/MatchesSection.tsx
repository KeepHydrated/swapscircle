import React from 'react';
import { Heart, X, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';

const MatchesSection = () => {
  const matches = [
    { id: 1, name: "Mountain Bike - Trek", image: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91", user: "Alex M." },
    { id: 2, name: "Digital Camera - Canon", image: "https://images.unsplash.com/photo-1526413232644-8a40f03cc03b", user: "Sarah K." },
    { id: 3, name: "Electric Guitar - Fender", image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d", user: "Mike T." },
    { id: 4, name: "Standing Desk - Adjustable", image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2", user: "Emma L." },
    { id: 5, name: "Coffee Machine - Breville", image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6", user: "James P." },
  ];

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Your Matches</h2>
        <Link to="/" className="text-sm text-primary hover:underline">View all</Link>
      </div>
      
      <div className="overflow-x-auto overflow-y-hidden pb-2">
        <div className="flex gap-3 min-w-max">
          {matches.map((item) => (
            <div key={item.id} className="flex-shrink-0 w-48 sm:w-56 md:w-64">
              <div className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all">
                <div className="relative aspect-[4/3]">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2">
                    <button className="w-8 h-8 bg-background/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:bg-background transition-colors">
                      <MoreVertical className="w-4 h-4 text-foreground" />
                    </button>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button className="w-8 h-8 bg-background/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:bg-background transition-colors">
                      <X className="w-4 h-4 text-foreground" />
                    </button>
                    <button className="w-8 h-8 bg-background/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:bg-background transition-colors">
                      <Heart className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold truncate text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.user}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MatchesSection;
