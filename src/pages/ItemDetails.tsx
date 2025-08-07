
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { blockingService } from '@/services/blockingService';

interface ItemData {
  id: string;
  name: string;
  description: string;
  image_url: string;
  category: string;
  condition: string;
  tags: string[];
  created_at: string;
  user_id: string;
}

const ItemDetails: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { supabaseConfigured, user } = useAuth();
  const [item, setItem] = useState<ItemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      if (!itemId) {
        setError('No item ID provided');
        setLoading(false);
        return;
      }

      if (!supabaseConfigured) {
        setError('Database not configured');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .eq('id', itemId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching item:', error);
          setError('Error loading item');
          toast.error('Error loading item');
        } else if (!data) {
          setError('Item not found');
          toast.error('Item not found');
        } else {
          // Check if the item owner has blocked the current user or vice versa
          if (user && data.user_id !== user.id) {
            const isBlockedByOwner = await blockingService.isCurrentUserBlockedBy(data.user_id);
            const hasBlockedOwner = await blockingService.isUserBlocked(data.user_id);
            
            if (isBlockedByOwner || hasBlockedOwner) {
              setError('Item not accessible');
              toast.error('This item is not accessible');
              return;
            }
          }
          setItem(data);
        }
      } catch (error) {
        console.error('Error fetching item:', error);
        setError('Error loading item');
        toast.error('Error loading item');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId, supabaseConfigured, user]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </MainLayout>
    );
  }

  if (error || !item) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto p-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {error || 'Item not found'}
            </h1>
            <p className="text-gray-600 mb-6">
              The item you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/')}>
              Go to Home
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="md:flex">
            {/* Item Image */}
            <div className="md:w-1/2">
              <img
                src={item.image_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f'}
                alt={item.name}
                className="w-full h-64 md:h-96 object-cover"
              />
            </div>

            {/* Item Details */}
            <div className="md:w-1/2 p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {item.name}
              </h1>

              <div className="space-y-4 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium mr-2">Category:</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {item.category}
                  </span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium mr-2">Condition:</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                    {item.condition}
                  </span>
                </div>

                {item.tags && item.tags.length > 0 && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium mr-2">Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Posted {new Date(item.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {item.description && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              )}

              <div className="border-t pt-6">
                <Button className="w-full" onClick={() => toast.info('Trading functionality coming soon!')}>
                  Interested in Trading
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ItemDetails;
