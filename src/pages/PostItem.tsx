import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Save, Check, Loader2, Package, Heart, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { postItem, uploadItemImage, createItem } from '@/services/authService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { isProfileComplete } from '@/utils/profileUtils';

// Import our new components
import ItemOfferingForm from '@/components/postItem/ItemOfferingForm';
import PreferencesForm, { SavedPreference } from '@/components/postItem/PreferencesForm';
import SavePreferenceDialog from '@/components/postItem/SavePreferenceDialog';
import SavedPreferencesList from '@/components/postItem/SavedPreferencesList';
import LoadPreferencesDialog from '@/components/postItem/LoadPreferencesDialog';


const PostItem: React.FC = () => {
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
  const [hasDraft, setHasDraft] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  
  // Preferences form state
  const [lookingForText, setLookingForText] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<Record<string, string[]>>({});
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  
  // Dialog state
  const [preferenceName, setPreferenceName] = useState<string>("");
  const [saveDialogOpen, setSaveDialogOpen] = useState<boolean>(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState<boolean>(false);
  const [savedPreferences, setSavedPreferences] = useState<SavedPreference[]>([]);

  // Check if profile is complete before allowing posting
  useEffect(() => {
    if (user && !isProfileComplete(user)) {
      toast.error('Please complete your profile (username and avatar) before posting items.');
      navigate('/settings');
      return;
    }
  }, [user, navigate]);

  // Load saved preferences from localStorage on component mount
  useEffect(() => {
    const savedPrefs = localStorage.getItem('tradeMatePreferences');
    if (savedPrefs) {
      setSavedPreferences(JSON.parse(savedPrefs));
    }
  }, []);

  // Auto-save draft functionality when leaving the page
  useEffect(() => {
    const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
      // Only save if there's meaningful content and user is logged in
      const hasContent = title.trim() || description.trim() || category || lookingForText.trim();
      if (hasContent && user) {
        // Save the draft before leaving
        await saveDraftToDatabase();
      }
    };

    // Save draft when navigating away from the page
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [title, description, category, subcategory, condition, priceRange, 
      lookingForText, selectedCategories, selectedSubcategories, 
      selectedPriceRanges, selectedConditions, user]);

  // Save draft to database
  const saveDraftToDatabase = async () => {
    if (!user) return;

    // Only save if there's meaningful content
    const hasContent = title.trim() || description.trim() || category || lookingForText.trim();
    if (!hasContent) return;

    try {
      const tags = subcategory ? [subcategory] : [];
      
      const draftData = {
        name: title || 'Untitled Draft',
        description,
        category,
        condition,
        tags,
        looking_for_categories: selectedCategories,
        looking_for_conditions: selectedConditions,
        looking_for_description: lookingForText,
        price_range_min: priceRange ? parseFloat(priceRange.split('-')[0]) : undefined,
        price_range_max: priceRange ? parseFloat(priceRange.split('-')[1]) : undefined,
        status: 'draft' as const
      };

      if (draftId) {
        // Update existing draft silently
        const { updateItem } = await import('@/services/authService');
        await updateItem(draftId, draftData);
      } else {
        // Create new draft silently
        const newDraftId = await createItem(draftData, true);
        if (newDraftId) {
          setDraftId(newDraftId);
          setHasDraft(true);
        }
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  // Clear draft when item is successfully posted
  const clearDraft = () => {
    setHasDraft(false);
    setDraftId(null);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setImages([]);
    setCategory("");
    setSubcategory("");
    setCondition("");
    setPriceRange("");
    clearDraft(); // Clear the saved draft when resetting
    // We're not resetting the "What You're Looking For" section by default
  };

  const clearPreferences = () => {
    setLookingForText("");
    setSelectedCategories([]);
    setSelectedSubcategories({});
    setSelectedPriceRanges([]);
    setSelectedConditions([]);
  };

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
  };

  // Delete a saved preference
  const deletePreference = (id: string) => {
    const updatedPreferences = savedPreferences.filter(pref => pref.id !== id);
    setSavedPreferences(updatedPreferences);
    localStorage.setItem('tradeMatePreferences', JSON.stringify(updatedPreferences));
    
    toast.success("Preference has been removed");
  };


  const handleSubmit = async () => {
    // Validation
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
      let imageUrl = null;
      
      // Upload the first image if available
      if (images.length > 0) {
        imageUrl = await uploadItemImage(images[0]);
      }
      
      // Create item tags from subcategory if selected
      const tags = subcategory ? [subcategory] : [];
      
      console.log('Creating item with subcategory:', subcategory, 'tags:', tags);
      
      // Post the item to Supabase with preferences
      const newItem = await postItem({
        name: title,
        description,
        image_url: imageUrl || undefined,
        category,
        condition,
        tags,
        lookingForCategories: selectedCategories,
        lookingForConditions: selectedConditions,
        lookingForDescription: lookingForText,
        priceRangeMin: priceRange ? parseFloat(priceRange.split('-')[0]) : undefined,
        priceRangeMax: priceRange ? parseFloat(priceRange.split('-')[1]) : undefined,
      });
      
      if (newItem) {
        clearDraft(); // Clear the saved draft on successful submission
        toast.success('Your item has been posted successfully!');
        // Navigate to home page after successful submission
        navigate('/');
      }
    } catch (error) {
      console.error('Error posting item:', error);
      toast.error('There was an error posting your item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <p className="text-gray-600">Tell us about the item you want to trade</p>
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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-purple-50 p-3 rounded-full mr-4">
                  <Heart className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">What You're Looking For</h2>
                  <p className="text-gray-600">Describe what you'd like to receive in return</p>
                </div>
              </div>
              
              {/* Load Saved Preferences Button - moved to top right */}
              {savedPreferences.length > 0 && (
                <Button 
                  onClick={() => setLoadDialogOpen(true)}
                  variant="outline"
                  className="bg-white shadow-sm hover:shadow-md border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  Load Saved Preferences
                </Button>
              )}
            </div>
            
            {/* Saved preferences list - removed from inline display */}
            
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
            
            {/* Save Preferences Button - moved to bottom of right column */}
            <div className="pt-6">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 px-8 py-3 text-lg font-medium shadow-sm hover:shadow-md transition-all duration-200"
                onClick={() => setSaveDialogOpen(true)}
              >
                <Save className="mr-2 h-5 w-5" />
                Save Preferences
              </Button>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-center mt-12 max-w-7xl mx-auto">
          <div className="flex flex-col items-center space-y-3">
            {hasDraft && (
              <div className="flex items-center text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                <Save className="mr-1 h-4 w-4" />
                Draft auto-saved
              </div>
            )}
            <div className="flex items-center space-x-4">
              <Button
                onClick={async () => {
                  await saveDraftToDatabase();
                  navigate('/');
                }}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 text-lg font-medium"
              >
                <Save className="mr-2 h-5 w-5" />
                Save Draft
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Your Listing...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Create Trade Listing
                  </>
                )}
              </Button>
            </div>
          </div>
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

      <LoadPreferencesDialog
        open={loadDialogOpen}
        onOpenChange={setLoadDialogOpen}
        preferences={savedPreferences}
        onApply={applyPreference}
        onDelete={deletePreference}
      />


    </div>
  );
};

export default PostItem;
