import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Save, Check, Loader2, Package, Heart, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { postItem, uploadItemImage } from '@/services/authService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Import our new components
import ItemOfferingForm from '@/components/postItem/ItemOfferingForm';
import PreferencesForm, { SavedPreference } from '@/components/postItem/PreferencesForm';
import SavePreferenceDialog from '@/components/postItem/SavePreferenceDialog';
import SavedPreferencesList from '@/components/postItem/SavedPreferencesList';
import SuccessDialog from '@/components/postItem/SuccessDialog';

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
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [selectedPreferenceOption, setSelectedPreferenceOption] = useState<string>("clear");
  const [showPreferenceOptions, setShowPreferenceOptions] = useState(false);
  const [selectedSavedPreferenceId, setSelectedSavedPreferenceId] = useState<string>("");

  // Load saved preferences from localStorage on component mount
  useEffect(() => {
    const savedPrefs = localStorage.getItem('tradeMatePreferences');
    if (savedPrefs) {
      setSavedPreferences(JSON.parse(savedPrefs));
    }
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setImages([]);
    setCategory("");
    setSubcategory("");
    setCondition("");
    setPriceRange("");
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
    
    setShowSavedPreferences(false);
  };

  // Delete a saved preference
  const deletePreference = (id: string) => {
    const updatedPreferences = savedPreferences.filter(pref => pref.id !== id);
    setSavedPreferences(updatedPreferences);
    localStorage.setItem('tradeMatePreferences', JSON.stringify(updatedPreferences));
    
    toast.success("Preference has been removed");
  };

  const addNewItem = () => {
    resetForm();
    
    if (selectedPreferenceOption === "clear") {
      clearPreferences();
    } else if (selectedPreferenceOption === "load" && selectedSavedPreferenceId) {
      const pref = savedPreferences.find(p => p.id === selectedSavedPreferenceId);
      if (pref) {
        applyPreference(pref);
      }
    }
    
    setShowSuccessDialog(false);
    setShowPreferenceOptions(false); // Reset for next time
    setSelectedSavedPreferenceId(""); // Reset selected preference
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
        // Show success dialog
        setShowSuccessDialog(true);
        setShowPreferenceOptions(true);
        setSelectedPreferenceOption("clear");
        toast.success('Your item has been posted successfully!');
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
            <div className="flex items-center mb-6">
              <div className="bg-purple-50 p-3 rounded-full mr-4">
                <Heart className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">What You're Looking For</h2>
                <p className="text-gray-600">Describe what you'd like to receive in return</p>
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
        
        {/* Progress Indicator */}
        <div className="mt-8 max-w-md mx-auto">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <div className={`w-3 h-3 rounded-full ${title ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span>Item Details</span>
            <div className="w-6 h-0.5 bg-gray-300"></div>
            <div className={`w-3 h-3 rounded-full ${lookingForText || selectedCategories.length ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span>Preferences</span>
            <div className="w-6 h-0.5 bg-gray-300"></div>
            <div className={`w-3 h-3 rounded-full ${isSubmitting ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></div>
            <span>Submit</span>
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

      <SuccessDialog 
        open={showSuccessDialog}
        onOpenChange={(open) => {
          setShowSuccessDialog(open);
          if (!open) {
            // Navigate to homepage when dialog is closed (Done button)
            navigate('/');
          }
        }}
        selectedPreferenceOption={selectedPreferenceOption}
        setSelectedPreferenceOption={setSelectedPreferenceOption}
        showPreferenceOptions={showPreferenceOptions}
        savedPreferences={savedPreferences}
        selectedSavedPreferenceId={selectedSavedPreferenceId}
        setSelectedSavedPreferenceId={setSelectedSavedPreferenceId}
        onAddNewItem={addNewItem}
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

export default PostItem;
