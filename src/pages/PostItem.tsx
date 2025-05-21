
import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Save, Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { postItem, uploadItemImage } from '@/services/authService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Import our components
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
      
      // Post the item to Supabase
      const newItem = await postItem({
        name: title,
        description,
        image_url: imageUrl || undefined,
        category,
        condition,
        tags,
        priceRange, // Add priceRange to item
      });
      
      if (newItem) {
        // Show success dialog
        setShowSuccessDialog(true);
        setShowPreferenceOptions(true);
        setSelectedPreferenceOption("clear");
        toast.success('Your item has been posted successfully!');
        
        // Redirect to profile page after 2 seconds
        setTimeout(() => {
          if (!showSuccessDialog) { // Only redirect if success dialog is closed
            navigate('/profile');
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Error posting item:', error);
      toast.error('There was an error posting your item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If not logged in, redirect to auth page
  useEffect(() => {
    if (!user) {
      toast.error('You must be logged in to post an item');
      navigate('/auth');
    }
  }, [user, navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* What You're Offering Column */}
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
          
          {/* What You're Looking For Column */}
          <div>
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
        
        {/* Submit and Save Preferences Buttons */}
        <div className="flex justify-end mt-8 max-w-6xl mx-auto">
          <Button
            variant="outline"
            className="mr-4 flex items-center bg-green-600 hover:bg-green-700 text-white"
            onClick={() => setSaveDialogOpen(true)}
          >
            <Save className="mr-2 h-4 w-4" /> Save Preferences
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-trademate-dark hover:bg-trademate-blue text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" /> Submit Item
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

      <SuccessDialog 
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
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
        <div className="fixed bottom-4 left-4">
          <Button 
            onClick={() => setShowSavedPreferences(!showSavedPreferences)}
            variant="outline"
            className="bg-white shadow"
          >
            {showSavedPreferences ? 'Hide Saved' : 'Load Saved'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PostItem;
