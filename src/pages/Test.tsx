import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ItemCard from '@/components/items/ItemCard';
import ExploreItemModal from '@/components/items/ExploreItemModal';

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
    liked: false,
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
    liked: false,
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
    liked: true,
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
    liked: false,
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
    liked: false,
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
    liked: true,
  },
];

const Test: React.FC = () => {
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLike = (id: string) => {
    setLikedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleReject = (id: string) => {
    console.log('Rejected:', id);
  };

  const handleOpenModal = (id: string) => {
    setSelectedItemId(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItemId(null);
  };

  const selectedItem = mockMatches.find(m => m.id === selectedItemId);

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Your Matches</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {mockMatches.map(match => (
            <ItemCard
              key={match.id}
              id={match.id}
              name={match.name}
              image={match.image}
              image_urls={match.image_urls}
              isMatch={true}
              liked={likedItems[match.id] || match.liked}
              onSelect={handleOpenModal}
              onLike={handleLike}
              onReject={handleReject}
              priceRangeMin={match.priceRangeMin}
              priceRangeMax={match.priceRangeMax}
              condition={match.condition}
              myItemImage={match.myItemImage}
            />
          ))}
        </div>
      </div>

      {selectedItem && (
        <ExploreItemModal
          open={isModalOpen}
          onClose={handleCloseModal}
          item={{
            id: selectedItem.id,
            name: selectedItem.name,
            image: selectedItem.image,
            image_urls: selectedItem.image_urls,
            priceRangeMin: selectedItem.priceRangeMin,
            priceRangeMax: selectedItem.priceRangeMax,
            condition: selectedItem.condition,
          }}
        />
      )}
    </MainLayout>
  );
};

export default Test;
