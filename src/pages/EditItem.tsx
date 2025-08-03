
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
import { fetchItemById, updateItem, uploadItemImage } from '@/services/authService';

const EditItem: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Item offering form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [category, setCategory] = useState<string>("");
  const [subcategory, setSubcategory] = useState<string>("");
  const [condition, setCondition] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [itemStatus, setItemStatus] = useState<string>('published');
  const [hasBeenEdited, setHasBeenEdited] = useState<boolean>(true);
  const [originalItemData, setOriginalItemData] = useState<any>(null);
  const [autoSaving, setAutoSaving] = useState(false);
  
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
          
          setItemStatus((item as any).status || 'published');
          setHasBeenEdited((item as any).has_been_edited !== false); // Default to true if undefined
          
          // Store original data to compare against for changes
          setOriginalItemData({
            name: item.name || '',
            description: item.description || '',
            category: item.category || '',
            condition: item.condition || '',
            subcategory: (item as any).tags?.[0] || '',
            priceRange: '', // Will be set below
            lookingForText: (item as any).looking_for_description || '',
            selectedCategories: (item as any).looking_for_categories || [],
            selectedConditions: (item as any).looking_for_conditions || [],
            selectedPriceRanges: []
          });
          
          setTitle(item.name || '');
          setDescription(item.description || '');
          
          // Handle both old single image_url and new image_urls array
          if ((item as any).image_urls && Array.isArray((item as any).image_urls)) {
            setExistingImageUrls((item as any).image_urls);
          } else if ((item as any).image_url) {
            setExistingImageUrls([(item as any).image_url]);
          } else {
            setExistingImageUrls([]);
          }
          
          setCategory(item.category || '');
          setCondition(item.condition || '');
          
          // Reconstruct price range from min/max values
          const priceMin = (item as any).price_range_min;
          const priceMax = (item as any).price_range_max;
          if (priceMin !== null && priceMax !== null) {
            // Find the matching price range string
            const ranges = ["0 - 50", "50 - 100", "100 - 250", "250 - 500", "500 - 750", "750 - 1,000"];
            const matchingRange = ranges.find(range => {
              const [rangeMin, rangeMax] = range.split(" - ").map(Number);
              return rangeMin === priceMin && rangeMax === priceMax;
            });
            setPriceRange(matchingRange || `${priceMin} - ${priceMax}`);
            console.log('Set price range from min/max:', matchingRange || `${priceMin} - ${priceMax}`);
          } else {
            setPriceRange('');
            console.log('No price range min/max found');
          }
          const tags = (item as any).tags;
          if (tags && Array.isArray(tags) && tags.length > 0) {
            console.log('Found tags in item:', tags);
            setSubcategory(tags[0]);
          } else {
            console.log('No tags found in item');
            setSubcategory('');
          }
          
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
            
            // Check if we have looking_for_price_ranges stored
            if ((item as any).looking_for_price_ranges && (item as any).looking_for_price_ranges.length > 0) {
              console.log('Found stored price ranges:', (item as any).looking_for_price_ranges);
              setSelectedPriceRanges((item as any).looking_for_price_ranges);
              
              // For the item form, use the first price range or a formatted min-max
              const storedRanges = (item as any).looking_for_price_ranges;
              setPriceRange(storedRanges[0] || `${min} - ${max}`);
              
              // Update original data with stored ranges
              setOriginalItemData(prev => ({
                ...prev,
                priceRange: storedRanges[0] || `${min} - ${max}`,
                selectedPriceRanges: storedRanges
              }));
            } else {
              // Fallback to the old min-max logic
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
              
              // Update original data with the price range
              setOriginalItemData(prev => ({
                ...prev,
                priceRange: matchingRanges[0] || "0 - 50",
                selectedPriceRanges: matchingRanges.length > 0 ? matchingRanges : ["0 - 50"]
              }));
            }
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

  // Function to check if current values are different from original
  const hasActualChanges = () => {
    if (!originalItemData) return true; // If no original data, allow publishing
    
    const currentValues = {
      title,
      description,
      category,
      condition,
      subcategory,
      priceRange,
      lookingForText,
      selectedCategories: JSON.stringify(selectedCategories),
      selectedConditions: JSON.stringify(selectedConditions),
      selectedPriceRanges: JSON.stringify(selectedPriceRanges),
      hasNewImages: images.length > 0
    };
    
    const originalValues = {
      title: originalItemData.name,
      description: originalItemData.description,
      category: originalItemData.category,
      condition: originalItemData.condition,
      subcategory: originalItemData.subcategory,
      priceRange: originalItemData.priceRange,
      lookingForText: originalItemData.lookingForText,
      selectedCategories: JSON.stringify(originalItemData.selectedCategories),
      selectedConditions: JSON.stringify(originalItemData.selectedConditions),
      selectedPriceRanges: JSON.stringify(originalItemData.selectedPriceRanges),
      hasNewImages: false
    };
    
    const hasChanges = JSON.stringify(currentValues) !== JSON.stringify(originalValues);
    
    console.log('🔍 CHECKING FOR CHANGES:', {
      hasChanges,
      currentValues,
      originalValues,
      itemStatus,
      hasBeenEdited
    });
    
    return hasChanges;
  };

  // Auto-save function for draft changes
  const autoSaveDraft = async () => {
    if (!itemId || itemStatus !== 'draft' || !hasActualChanges() || autoSaving) {
      return;
    }

    setAutoSaving(true);
    try {
      const { updateItem } = await import('@/services/authService');
      
      const updates: any = {
        name: title,
        description,
        category,
        condition,
        tags: subcategory ? [subcategory] : [],
        lookingForCategories: selectedCategories,
        lookingForConditions: selectedConditions,
        lookingForDescription: lookingForText,
        // Don't change status - keep as draft
      };

      // Handle price range logic (simplified version of main handleSubmit)
      if (selectedPriceRanges && selectedPriceRanges.length > 0) {
        let minValue = Number.MAX_VALUE;
        let maxValue = 0;
        
        selectedPriceRanges.forEach(range => {
          const parts = range.split(" - ");
          const min = parseFloat(parts[0]);
          const max = parseFloat(parts[1].replace(/,/g, ''));
          
          if (min < minValue) minValue = min;
          if (max > maxValue) maxValue = max;
        });
        
        updates.priceRangeMin = minValue;
        updates.priceRangeMax = maxValue;
      }

      await updateItem(itemId, updates);
      console.log('✅ Auto-saved draft changes');
    } catch (error) {
      console.error('Error auto-saving draft:', error);
    } finally {
      setAutoSaving(false);
    }
  };

  // Auto-save draft changes when form values change (debounced)
  useEffect(() => {
    if (originalItemData && itemStatus === 'draft' && hasActualChanges()) {
      const timeoutId = setTimeout(() => {
        autoSaveDraft();
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [title, description, category, condition, subcategory, lookingForText, selectedCategories, selectedConditions, selectedPriceRanges, originalItemData, itemStatus]);

  // Check for changes whenever form values change - update hasBeenEdited based on actual changes
  useEffect(() => {
    if (originalItemData && itemStatus === 'draft') {
      const actualChanges = hasActualChanges();
      console.log('📝 UPDATING hasBeenEdited:', { actualChanges, currentHasBeenEdited: hasBeenEdited });
      // For draft items, only mark as edited if there are actual changes from original
      setHasBeenEdited(actualChanges);
    }
  }, [title, description, category, condition, subcategory, priceRange, lookingForText, selectedCategories, selectedConditions, selectedPriceRanges, images, originalItemData, itemStatus]);

  // Load saved preferences from localStorage on component mount

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
    
    // Check if this is a draft item that hasn't been edited
    console.log('🚀 PUBLISH CHECK:', { itemStatus, hasBeenEdited, actualChanges: hasActualChanges() });
    if (itemStatus === 'draft' && !hasBeenEdited) {
      toast.error('You must make changes to this item before publishing it.');
      return;
    }
    
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
          tags: subcategory ? [subcategory] : [], // Save subcategory as tags array
          looking_for_categories: selectedCategories,
          looking_for_conditions: selectedConditions,
          looking_for_description: lookingForText,
          status: 'published', // Publish the item when updated
        };
        
        // Handle new image uploads first
        let newImageUrls: string[] = [];
        if (images.length > 0) {
          toast.info('Uploading new images...');
          for (const image of images) {
            const imageUrl = await uploadItemImage(image);
            if (imageUrl) {
              newImageUrls.push(imageUrl);
            }
          }
        }
        
        // Combine existing and new image URLs
        const allImageUrls = [...existingImageUrls, ...newImageUrls];
        
        // Update image fields
        if (allImageUrls.length > 0) {
          updates.image_url = allImageUrls[0]; // Keep compatibility with single image
          updates.imageUrls = allImageUrls; // Store all images in array
        }
        
         // Handle price range - prioritize multiple selections if they exist
         if (selectedPriceRanges && selectedPriceRanges.length > 0) {
           console.log('Using preferences price ranges:', selectedPriceRanges);
           
           // Find the minimum and maximum values across all selected ranges
           let minValue = Number.MAX_VALUE;
           let maxValue = 0;
           
           selectedPriceRanges.forEach(range => {
             console.log('Processing range:', range);
             const parts = range.split(" - ");
             console.log('Split parts:', parts);
             
             const min = parseFloat(parts[0]);
             const max = parseFloat(parts[1].replace(/,/g, '')); // Remove commas
             
             console.log('Parsed min/max:', min, max);
             if (min < minValue) minValue = min;
             if (max > maxValue) maxValue = max;
           });
           
           console.log('Combined price range from preferences:', { minValue, maxValue });
           
            updates.priceRangeMin = minValue;
            updates.priceRangeMax = maxValue;
            updates.looking_for_price_ranges = selectedPriceRanges; // Store the original selections
         } else if (priceRange) {
           console.log('Using item form price range as fallback:', priceRange);
           const parts = priceRange.split(" - ");
           const min = parseFloat(parts[0]);
           const max = parseFloat(parts[1].replace(/,/g, ''));
           
            updates.priceRangeMin = min;
            updates.priceRangeMax = max;
           console.log('Set price range min/max from item form:', min, max);
         } else {
           console.log('Using preferences price ranges:', selectedPriceRanges);
           
           // Find the minimum and maximum values across all selected ranges
           let minValue = Number.MAX_VALUE;
           let maxValue = 0;
           
           selectedPriceRanges.forEach(range => {
             console.log('Processing range:', range);
             const parts = range.split(" - ");
             console.log('Split parts:', parts);
             
             const min = parseFloat(parts[0]);
             const max = parseFloat(parts[1].replace(/,/g, '')); // Remove commas
             
             console.log('Parsed min/max:', min, max);
             if (min < minValue) minValue = min;
             if (max > maxValue) maxValue = max;
           });
           
           console.log('Combined price range:', { minValue, maxValue });
           
            updates.priceRangeMin = minValue;
            updates.priceRangeMax = maxValue;
         }
        
        console.log('Price range string:', priceRange);
        console.log('Updates object:', updates);
        console.log('Calling updateItem service...');
        
        const result = await updateItem(itemId, updates);
        
        console.log('🚨 UPDATE RESULT DETAILED:');
        console.log('- result:', result);
        console.log('- type:', typeof result);
        console.log('- truthyValue:', !!result);
        console.log('- isNull:', result === null);
        console.log('- isUndefined:', result === undefined);
        console.log('- hasData:', result && typeof result === 'object' && 'id' in result);
        
        // Check if the price range was actually updated in the returned data
        if (result && typeof result === 'object' && 'price_range_min' in result) {
          console.log('🚨 PRICE RANGE CHECK:');
          console.log('- Sent updates.price_range_min:', updates.price_range_min);
          console.log('- Sent updates.price_range_max:', updates.price_range_max); 
          console.log('- Returned price_range_min:', result.price_range_min);
          console.log('- Returned price_range_max:', result.price_range_max);
        }
        
        if (result) {
          // Clear new images and update existing images after successful save
          setImages([]);
          setExistingImageUrls(allImageUrls);
          toast.success('Your item has been updated and published successfully!');
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
              existingImageUrls={existingImageUrls}
              setExistingImageUrls={setExistingImageUrls}
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 relative"
          >
            {autoSaving && !isSubmitting && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">
                Auto-saving...
              </div>
            )}
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {itemStatus === 'draft' ? 'Publishing...' : 'Updating...'}
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                {itemStatus === 'draft' ? 'Publish Item' : 'Update Item'}
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
