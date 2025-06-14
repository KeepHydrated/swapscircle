
import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { MatchItem } from '@/types/item';
import { useAuth } from '@/context/AuthContext';
import { fetchLikedItems, unlikeItem } from '@/services/authService';
import { toast } from 'sonner';

const Liked: React.FC = () => {
  const { user, supabaseConfigured } = useAuth();
  const [likedItems, setLikedItems] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLikedItems = async () => {
      if (!user || !supabaseConfigured) {
        // Use mock data when not configured
        setLikedItems([
          {
            id: "mock-1",
            name: "Vintage Camera",
            image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a",
            category: "Electronics",
            condition: "Good",
            description: "A beautiful vintage camera in working condition",
            liked: true
          },
          {
            id: "mock-2", 
            name: "Board Game Collection",
            image: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5",
            category: "Games",
            condition: "Excellent",
            description: "Collection of classic board games",
            liked: true
          }
        ]);
        setLoading(false);
        return;
      }

      try {
        const data = await fetchLikedItems();
        
        // Transform the data to match MatchItem format
        const formattedItems: MatchItem[] = data.map((likedItem: any) => ({
          id: likedItem.items.id,
          name: likedItem.items.name,
          image: likedItem.items.image_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f',
          category: likedItem.items.category,
          condition: likedItem.items.condition,
          description: likedItem.items.description,
          tags: likedItem.items.tags,
          liked: true
        }));

        setLikedItems(formattedItems);
      } catch (error) {
        console.error('Error fetching liked items:', error);
        toast.error('Error loading liked items');
      } finally {
        setLoading(false);
      }
    };

    loadLikedItems();
  }, [user, supabaseConfigured]);

  const handleUnlike = async (itemId: string) => {
    if (!user || !supabaseConfigured) {
      // For mock data, just remove from the list
      setLikedItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Item removed from liked');
      return;
    }

    try {
      const success = await unlikeItem(itemId);
      if (success) {
        setLikedItems(prev => prev.filter(item => item.id !== itemId));
      }
    } catch (error) {
      console.error('Error unliking item:', error);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-8 w-8 text-red-500 fill-red-500" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Liked Items
          </h1>
        </div>

        {likedItems.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              No liked items yet
            </h2>
            <p className="text-gray-500">
              Items you like will appear here. Start exploring to find items you love!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {likedItems.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => handleUnlike(item.id)}
                    className="absolute top-3 right-3 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-shadow"
                  >
                    <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {item.name}
                  </h3>
                  {item.category && (
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-2">
                      {item.category}
                    </span>
                  )}
                  {item.condition && (
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mb-2 ml-2">
                      {item.condition}
                    </span>
                  )}
                  {item.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Liked;
