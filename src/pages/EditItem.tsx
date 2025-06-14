
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import ItemOfferingForm from '@/components/postItem/ItemOfferingForm';
import { Item } from '@/types/item';
import { fetchItemById, updateItem } from '@/services/authService';

const EditItem: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Item offering form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [category, setCategory] = useState<string>("");
  const [subcategory, setSubcategory] = useState<string>("");
  const [condition, setCondition] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>(""); // UI uses camelCase
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration - in real app, this would come from the database
  const mockItems: Item[] = [
    {
      id: '1',
      name: 'Vintage Camera',
      image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a',
      category: 'Electronics',
      condition: 'Good',
      description: 'A beautiful vintage camera in excellent working condition.',
      tags: ['photography', 'vintage'],
      priceRange: '$100-$250'
    },
    {
      id: '2', 
      name: 'Gaming Headset',
      image: 'https://images.unsplash.com/photo-1599669454699-248893623440',
      category: 'Electronics',
      condition: 'Like New',
      description: 'High-quality gaming headset with surround sound.',
      tags: ['gaming', 'audio'],
      priceRange: '$50-$100'
    }
  ];

  // Load item data from DB on mount
  useEffect(() => {
    async function load() {
      setLoading(true);
      if (itemId) {
        const item = await fetchItemById(itemId);
        if (item) {
          setTitle(item.name || '');
          setDescription(item.description || '');
          setCategory(item.category || '');
          setCondition(item.condition || '');
          // Explicitly grab price_range from returned DB object
          setPriceRange((item as any).price_range || '');
          setSubcategory('');
          // images field is not handled from DB yet
        } else {
          toast.error('Item not found');
          navigate('/profile');
        }
      }
      setLoading(false);
    }
    load();
  }, [itemId, navigate]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title for your item');
      return;
    }
    if (!category) {
      toast.error('Please select a category for your item');
      return;
    }
    if (!condition) {
      toast.error('Please select the condition of your item');
      return;
    }
    setIsSubmitting(true);
    try {
      if (itemId) {
        const updates: any = {
          name: title,
          description,
          category,
          condition,
          price_range: priceRange, // Map camelCase UI state to snake_case DB column
          // tags/subcategory can be added here if needed
        };
        const success = await updateItem(itemId, updates);
        if (success) {
          toast.success('Your item has been updated successfully!');
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('There was an error updating your item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Edit Item</h1>
            <p className="text-gray-600">Update your item details below.</p>
          </div>

          <ItemOfferingForm
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            images={images}
            setImages={setImages}
            category={category}
            setCategory={setCategory}
            subcategory={subcategory}
            setSubcategory={setSubcategory}
            condition={condition}
            setCondition={setCondition}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
          />
        </div>
        
        {/* Submit and Cancel Buttons */}
        <div className="flex justify-end mt-8 max-w-2xl mx-auto space-x-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-trademate-dark hover:bg-trademate-blue text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Item
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditItem;
