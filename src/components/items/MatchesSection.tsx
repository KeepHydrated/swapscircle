import React from 'react';
import { Heart, X, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';

const MatchesSection = () => {
  const matches = [
    { id: 1, name: "Mountain Bike - Trek", image: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91", user: "Alex M.", myItemImage: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7", priceRangeMin: 300, priceRangeMax: 400, condition: "Good" },
    { id: 2, name: "Digital Camera - Canon", image: "https://images.unsplash.com/photo-1526413232644-8a40f03cc03b", user: "Sarah K.", myItemImage: "https://images.unsplash.com/photo-1580894894513-541e068a3e2b", priceRangeMin: 450, priceRangeMax: 600, condition: "Excellent" },
    { id: 3, name: "Electric Guitar - Fender", image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d", user: "Mike T.", myItemImage: "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c", priceRangeMin: 500, priceRangeMax: 700, condition: "Good" },
    { id: 4, name: "Standing Desk - Adjustable", image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2", user: "Emma L.", myItemImage: "https://images.unsplash.com/photo-1487147264018-f937fba0c817", priceRangeMin: 200, priceRangeMax: 350, condition: "Like New" },
    { id: 5, name: "Coffee Machine - Breville", image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6", user: "James P.", myItemImage: "https://images.unsplash.com/photo-1585399000684-d2f72660f092", priceRangeMin: 150, priceRangeMax: 250, condition: "Good" },
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
                  {/* My Item Thumbnail in Bottom Right */}
                  <div className="absolute bottom-2 right-2">
                    <div className="w-12 h-12 rounded-full border-2 border-background shadow-lg overflow-hidden bg-background">
                      <img src={item.myItemImage} alt="Your item" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-base font-semibold text-foreground mb-1 truncate">{item.name}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      ${item.priceRangeMin} - ${item.priceRangeMax}
                    </p>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                      {item.condition}
                    </span>
                  </div>
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
