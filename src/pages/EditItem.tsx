
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Save, Loader2, Package, Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import ItemOfferingForm from '@/components/postItem/ItemOfferingForm';
import PreferencesForm, { SavedPreference } from '@/components/postItem/PreferencesForm';
import SavePreferenceDialog from '@/components/postItem/SavePreferenceDialog';
import SavedPreferencesList from '@/components/postItem/SavedPreferencesList';
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
  const [priceRange, setPriceRange] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Preferences form state
  const [lookingForText, setLookingForText] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<Record<string, string[]>>({});
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  
  // Dialog state
  const [preferenceName, setPreferenceName] = useState<string>("");
  const [saveDialogOpen, setSaveDialogOpen] = useState<boolean>(false);
  const [savedPreferences, setSavedPreferences] = useState<SavedPreference[]>([]);
  const [showSavedPreferences, setShowSavedPreferences] = useState<boolean>(false);

  // Load saved preferences from localStorage on component mount
  useEffect(() => {
    const savedPrefs = localStorage.getItem('tradeMatePreferences');
    if (savedPrefs) {
      setSavedPreferences(JSON.parse(savedPrefs));
    }
  }, []);

  // Load item data from DB on mount
  useEffect(() => {
    async function load() {
      setLoading(true);
      if (itemId) {
        const item = await fetchItemById(itemId);
        if (item) {
          console.log('Loaded item from database:', item);
          
          setTitle(item.name || '');
          setDescription(item.description || '');
          setCategory(item.category || '');
          setCondition(item.condition || '');
          setPriceRange((item as any).price_range || '');
          setSubcategory('');
          
          // Load preferences data
          console.log('Looking for description:', (item as any).looking_for_description);
          console.log('Looking for categories:', (item as any).looking_for_categories);
          console.log('Looking for conditions:', (item as any).looking_for_conditions);
          console.log('Price range min/max:', (item as any).price_range_min, (item as any).price_range_max);
          
          setLookingForText((item as any).looking_for_description || '');
          setSelectedCategories((item as any).looking_for_categories || []);
          setSelectedConditions((item as any).looking_for_conditions || []);
          
          // Convert price range for both item form and preferences
          if ((item as any).price_range_min !== null && (item as any).price_range_max !== null) {
            const min = (item as any).price_range_min;
            const max = (item as any).price_range_max;
            
            // Find all matching price ranges that fall within the min-max range
            const ranges = ["0 - 50", "50 - 100", "100 - 250", "250 - 500", "500 - 750", "750 - 1,000"];
            const matchingRanges = ranges.filter(r => {
              const [rMin, rMax] = r.split(" - ").map(Number);
              return (rMin >= min && rMin <= max) || (rMax >= min && rMax <= max) || (min >= rMin && max <= rMax);
            });
            
            console.log('Setting price range to item form:', matchingRanges[0] || "0 - 50");
            console.log('Setting selected price ranges:', matchingRanges);
            
            // For the item offering form, just use the first matching range
            setPriceRange(matchingRanges[0] || "0 - 50");
            
            // For the preferences form, use all matching ranges
            setSelectedPriceRanges(matchingRanges.length > 0 ? matchingRanges : ["0 - 50"]);
          }
        } else {
          toast.error('Item not found');
          navigate('/profile');
        }
      }
      setLoading(false);
    }
    load();
  }, [itemId, navigate]);

  // Save current preferences
  const savePreferences = () => {
    if (!preferenceName.trim()) {
      toast.error("Please enter a name for your preferences");
      return;
    }

    const newPreference: SavedPreference = {
      id: Date.now().toString(),
      name: preferenceName,
      lookingFor: lookingForText,
      selectedCategories,
      selectedSubcategories,
      selectedPriceRanges,
      selectedConditions
    };

    const updatedPreferences = [...savedPreferences, newPreference];
    setSavedPreferences(updatedPreferences);
    localStorage.setItem('tradeMatePreferences', JSON.stringify(updatedPreferences));
    
    toast.success("Your preferences have been saved");
    
    setSaveDialogOpen(false);
    setPreferenceName("");
  };

  // Apply a saved preference
  const applyPreference = (preference: SavedPreference) => {
    setLookingForText(preference.lookingFor);
    setSelectedCategories(preference.selectedCategories);
    setSelectedSubcategories(preference.selectedSubcategories);
    setSelectedPriceRanges(preference.selectedPriceRanges);
    setSelectedConditions(preference.selectedConditions);
    
    toast.success(`"${preference.name}" has been applied to your search`);
    
    setShowSavedPreferences(false);
  };

  // Delete a saved preference
  const deletePreference = (id: string) => {
    const updatedPreferences = savedPreferences.filter(pref => pref.id !== id);
    setSavedPreferences(updatedPreferences);
    localStorage.setItem('tradeMatePreferences', JSON.stringify(updatedPreferences));
    
    toast.success("Preference has been removed");
  };

  const handleSubmit = async () => {
    console.log('Update button clicked! Starting validation...');
    console.log('Current values:', { title, category, condition, priceRange });
    
    if (!title.trim()) {
      console.log('Validation failed: title is empty');
      toast.error('Please enter a title for your item');
      return;
    }
    if (!category) {
      console.log('Validation failed: category is empty');
      toast.error('Please select a category for your item');
      return;
    }
    if (!condition) {
      console.log('Validation failed: condition is empty');
      toast.error('Please select the condition of your item');
      return;
    }
    
    console.log('Validation passed, starting update...');
    setIsSubmitting(true);
    
    try {
      if (itemId) {
        console.log('Preparing updates for item:', itemId);
        const updates: any = {
          name: title,
          description,
          category,
          condition,
          looking_for_categories: selectedCategories,
          looking_for_conditions: selectedConditions,
          looking_for_description: lookingForText,
        };
        
        // Handle price ranges - we need to convert the multiple selected price ranges
        // into a single min-max range that encompasses all selections
        if (selectedPriceRanges.length > 0) {
          console.log('Selected price ranges:', selectedPriceRanges);
          
          // Find the minimum and maximum values across all selected ranges
          let minValue = Number.MAX_VALUE;
          let maxValue = 0;
          
          selectedPriceRanges.forEach(range => {
            const [min, max] = range.split(" - ").map(Number);
            if (min < minValue) minValue = min;
            if (max > maxValue) maxValue = max;
          });
          
          console.log('Combined price range:', { minValue, maxValue });
          updates.price_range_min = minValue;
          updates.price_range_max = maxValue;
        }
        
        console.log('Price range string:', priceRange);
        console.log('Updates object:', updates);
        console.log('Calling updateItem service...');
        
        const success = await updateItem(itemId, updates);
        
        console.log('Update result:', success);
        
        if (success) {
          toast.success('Your item has been updated successfully!');
          navigate('/profile');
        } else {
          toast.error('Update failed - please try again');
        }
      } else {
        console.log('No itemId found!');
        toast.error('No item ID found');
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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex-1 p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* What You're Offering Column */}
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <div className="bg-blue-50 p-3 rounded-full mr-4">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">What You're Offering</h2>
                <p className="text-gray-600">Update your item details</p>
              </div>
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
          
          {/* What You're Looking For Column */}
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <div className="bg-purple-50 p-3 rounded-full mr-4">
                <Heart className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">What You're Looking For</h2>
                <p className="text-gray-600">Update what you'd like to receive in return</p>
              </div>
            </div>
            
            {/* Saved preferences list */}
            <SavedPreferencesList
              show={showSavedPreferences && savedPreferences.length > 0}
              preferences={savedPreferences}
              onApply={applyPreference}
              onDelete={deletePreference}
            />
            
            {/* Preferences form */}
            <PreferencesForm 
              lookingForText={lookingForText}
              setLookingForText={setLookingForText}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              selectedSubcategories={selectedSubcategories}
              setSelectedSubcategories={setSelectedSubcategories}
              selectedPriceRanges={selectedPriceRanges}
              setSelectedPriceRanges={setSelectedPriceRanges}
              selectedConditions={selectedConditions}
              setSelectedConditions={setSelectedConditions}
            />
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-12 max-w-7xl mx-auto">
          <Button
            variant="outline"
            className="flex items-center bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 px-8 py-3 text-lg font-medium shadow-sm hover:shadow-md transition-all duration-200"
            onClick={() => setSaveDialogOpen(true)}
          >
            <Save className="mr-2 h-5 w-5" />
            Save Preferences
          </Button>
          
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-8 py-3 text-lg font-medium"
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Update Item
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <SavePreferenceDialog 
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        preferenceName={preferenceName}
        setPreferenceName={setPreferenceName}
        onSave={savePreferences}
      />

      {/* Button to show saved preferences */}
      {savedPreferences.length > 0 && (
        <div className="fixed bottom-6 left-6 z-50">
          <Button 
            onClick={() => setShowSavedPreferences(!showSavedPreferences)}
            variant="outline"
            className="bg-white shadow-lg hover:shadow-xl border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200"
          >
            {showSavedPreferences ? 'Hide Saved Preferences' : 'Load Saved Preferences'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EditItem;
