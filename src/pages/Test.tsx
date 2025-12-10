import React, { useState } from 'react';
import { Heart, Check } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import ExploreItemModal from '@/components/items/ExploreItemModal';
import { Item } from '@/types/item';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Mock matches data
const mockMatches = [
  {
    id: '1',
    name: 'Mountain Bike - Trek',
    image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800',
    image_urls: [
      'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800',
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800',
      'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800',
    ],
    priceRangeMin: 300,
    priceRangeMax: 400,
    condition: 'Good',
    myItemImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200',
    category: 'Sports & Outdoors',
    description: 'Reliable mountain bike perfect for trails.',
    user_id: 'demo-user-1',
    isDemo: true,
  },
  {
    id: '2',
    name: 'Digital Camera - Canon',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
    image_urls: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800',
    ],
    priceRangeMin: 450,
    priceRangeMax: 600,
    condition: 'Excellent',
    myItemImage: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200',
    category: 'Electronics',
    description: 'Professional DSLR camera with multiple lenses.',
    user_id: 'demo-user-2',
    isDemo: true,
  },
  {
    id: '3',
    name: 'Electric Guitar - Fender',
    image: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=800',
    image_urls: [
      'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=800',
      'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800',
      'https://images.unsplash.com/photo-1550985616-10810253b84d?w=800',
    ],
    priceRangeMin: 500,
    priceRangeMax: 700,
    condition: 'Like New',
    myItemImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200',
    category: 'Entertainment',
    description: 'Classic Fender electric guitar with rich tone.',
    user_id: 'demo-user-3',
    isDemo: true,
  },
  {
    id: '4',
    name: 'Vintage Watch - Rolex',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
    image_urls: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
    ],
    priceRangeMin: 800,
    priceRangeMax: 1200,
    condition: 'Good',
    myItemImage: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=200',
    category: 'Accessories',
    description: 'Collectible vintage Rolex watch.',
    user_id: 'demo-user-4',
    isDemo: true,
  },
  {
    id: '5',
    name: 'Gaming Console - PS5',
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800',
    image_urls: [
      'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800',
      'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800',
    ],
    priceRangeMin: 400,
    priceRangeMax: 500,
    condition: 'Excellent',
    myItemImage: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=200',
    category: 'Electronics',
    description: 'PlayStation 5 with controller.',
    user_id: 'demo-user-5',
    isDemo: true,
  },
  {
    id: '6',
    name: 'Leather Jacket',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
    image_urls: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
      'https://images.unsplash.com/photo-1559551409-dadc959f76b8?w=800',
      'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=800',
    ],
    priceRangeMin: 150,
    priceRangeMax: 250,
    condition: 'Good',
    myItemImage: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=200',
    category: 'Clothing',
    description: 'Genuine leather jacket in great condition.',
    user_id: 'demo-user-6',
    isDemo: true,
  },
];

const Test: React.FC = () => {
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/auth');
      return;
    }
    setLikedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleRequestTrade = (item: typeof mockMatches[0], e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/auth');
      return;
    }
    // For demo, navigate to messages with demo trade data
    navigate('/messages', { 
      state: { 
        demoTrade: true,
        demoData: {
          theirItem: {
            name: item.name,
            image: item.image,
            image_url: item.image,
            image_urls: item.image_urls,
            description: item.description,
            category: item.category,
            condition: item.condition,
            price_range_min: item.priceRangeMin,
            price_range_max: item.priceRangeMax
          },
          myItem: {
            name: 'Your Item',
            image: item.myItemImage,
            image_url: item.myItemImage,
            image_urls: [item.myItemImage],
            description: 'Your item for trade',
            category: 'Your Items',
            condition: 'Good'
          },
          partnerProfile: {
            id: item.user_id,
            username: 'Demo User',
            avatar_url: null,
            created_at: '2023-06-15T10:30:00Z'
          }
        }
      } 
    });
  };

  const handleCardClick = (item: typeof mockMatches[0]) => {
    setSelectedItem({
      id: item.id,
      name: item.name,
      image: item.image,
      image_urls: item.image_urls,
      category: item.category,
      condition: item.condition,
      description: item.description,
      priceRangeMin: item.priceRangeMin,
      priceRangeMax: item.priceRangeMax,
      user_id: item.user_id,
    });
    setIsModalOpen(true);
  };

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-foreground">Your Matches</h1>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {mockMatches.map((item) => (
            <div key={item.id}>
              <div 
                className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                onClick={() => handleCardClick(item)}
              >
                <div className="relative aspect-[4/3]">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  
                  {/* Action buttons */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button 
                      className="w-10 h-10 bg-green-500 hover:bg-green-600 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
                      onClick={(e) => handleRequestTrade(item, e)}
                      title="Request Trade"
                    >
                      <Check className="w-5 h-5 text-white" />
                    </button>
                    <button 
                      className="w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
                      onClick={(e) => handleLike(item.id, e)}
                      title={likedItems.has(item.id) ? "Unlike item" : "Like item"}
                    >
                      <Heart 
                        className={`w-5 h-5 transition-colors ${
                          likedItems.has(item.id) 
                            ? 'text-red-500 fill-red-500' 
                            : 'text-muted-foreground hover:text-red-500'
                        }`} 
                      />
                    </button>
                  </div>

                  {/* My Item Thumbnail */}
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

      <ExploreItemModal
        open={isModalOpen}
        item={selectedItem}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
        }}
      />
    </MainLayout>
  );
};

export default Test;
