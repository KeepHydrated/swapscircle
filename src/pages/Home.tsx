
import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import FriendItemsCarousel from '@/components/profile/FriendItemsCarousel';
import HomeWithLocationFilter from '@/components/home/HomeWithLocationFilter';
import { useDbItems } from '@/hooks/useDbItems';
import ItemCard from '@/components/items/ItemCard';
import ExploreItemModal from '@/components/items/ExploreItemModal';

const Home: React.FC = () => {
  // Friend/fake items remain only for the top carousel demo
  const [friendItems, setFriendItems] = useState([
    {
      id: "f1",
      name: "Vintage Camera Collection",
      image: "https://images.unsplash.com/photo-1452780212940-6f5c0d14d848",
      liked: false,
      category: "photography"
    },
    {
      id: "f2",
      name: "Handcrafted Leather Journal",
      image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f",
      liked: true,
      category: "crafts"
    },
    {
      id: "f3",
      name: "Mid-Century Modern Lamp",
      image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15",
      liked: false,
      category: "home"
    },
    {
      id: "f4",
      name: "Vintage Wristwatch",
      image: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade",
      liked: false,
      category: "accessories"
    },
    {
      id: "f5",
      name: "Antique Typewriter",
      image: "https://images.unsplash.com/photo-1558522195-e1201b090344",
      liked: false,
      category: "collectibles"
    },
    {
      id: "f6",
      name: "Rare Comic Book Collection",
      image: "https://images.unsplash.com/photo-1608889825205-eebdb9fc5806",
      liked: true,
      category: "collectibles"
    },
    {
      id: "f7",
      name: "Vintage Record Player",
      image: "https://images.unsplash.com/photo-1461360228754-6e81c478b882",
      liked: false,
      category: "music"
    }
  ]);

  // Fetch all items from DB to show in Explore section
  const { items: dbItems, loading: dbItemsLoading, error: dbItemsError } = useDbItems();

  // Friend items like/unlike (demo)
  const handleLikeFriendItem = (itemId: string) => {
    setFriendItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, liked: !item.liked } : item
      )
    );
  };

  // Modal state for Explore Items
  const [modalOpen, setModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState(null);

  const handleOpenModal = (item: any) => {
    setModalItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalItem(null);
    setModalOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <HomeWithLocationFilter>
        <div className="flex-1 p-4 md:p-6 flex flex-col h-full">
          <div className="mb-8 h-96">
            <FriendItemsCarousel 
              items={friendItems} 
              onLikeItem={handleLikeFriendItem} 
            />
          </div>
          <div className="flex-1 min-h-0">
            <h2 className="text-2xl font-bold mb-4">Explore Items</h2>
            {dbItemsLoading ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : dbItemsError ? (
              <div className="text-red-600 text-center">{dbItemsError}</div>
            ) : (
              <>
                <div className="grid gap-7 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                  {dbItems.map(item => (
                    <div key={item.id} className="flex">
                      <ItemCard
                        id={item.id}
                        name={item.name}
                        image={item.image}
                        isSelected={false}
                        isMatch={false}
                        onSelect={() => handleOpenModal(item)}
                      />
                    </div>
                  ))}
                </div>
                <ExploreItemModal
                  open={modalOpen}
                  item={modalItem}
                  onClose={handleCloseModal}
                  images={modalItem?.images}
                />
              </>
            )}
          </div>
        </div>
      </HomeWithLocationFilter>
    </div>
  );
};

export default Home;
