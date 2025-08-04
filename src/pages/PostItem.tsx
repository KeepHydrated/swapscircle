import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Save, Check, Loader2, Package, Heart, Sparkles, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { postItem, uploadItemImage, createItem } from '@/services/authService';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { isProfileComplete } from '@/utils/profileUtils';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';

// Import our new components
import ItemOfferingForm from '@/components/postItem/ItemOfferingForm';
import PreferencesForm, { SavedPreference } from '@/components/postItem/PreferencesForm';
import SavePreferenceDialog from '@/components/postItem/SavePreferenceDialog';
import SavedPreferencesList from '@/components/postItem/SavedPreferencesList';
import LoadPreferencesDialog from '@/components/postItem/LoadPreferencesDialog';

// PostItem component with navigation confirmation


const PostItem: React.FC = () => {
  console.log('🔥🔥🔥 PostItem CACHE BUSTER v3.0 - NO useBlocker - BUILD TIME:', new Date().toISOString());
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
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
  const isUnmountingRef = useRef(false);
  const formDataRef = useRef({ title: '', description: '', category: '', lookingForText: '', user: null });
  
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
  const [showExitConfirmation, setShowExitConfirmation] = useState<boolean>(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

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

  // Check if user has unsaved content
  const hasUnsavedContent = useCallback(() => {
    return title.trim() || description.trim() || category || lookingForText.trim() || 
           selectedCategories.length > 0 || selectedConditions.length > 0 || 
           Object.keys(selectedSubcategories).length > 0 || selectedPriceRanges.length > 0;
  }, [title, description, category, lookingForText, selectedCategories, selectedConditions, selectedSubcategories, selectedPriceRanges]);

  // Custom navigation interception for Link clicks and programmatic navigation
  useEffect(() => {
    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && hasUnsavedContent()) {
        // Check if it's an internal navigation link (not external)
        const href = link.getAttribute('href');
        if (href && href.startsWith('/') && !href.startsWith('//')) {
          event.preventDefault();
          setShowExitConfirmation(true);
          setPendingNavigation(() => () => {
            navigate(href);
          });
        }
      }
    };

    // Also handle back button navigation
    const handlePopState = (event: PopStateEvent) => {
      if (hasUnsavedContent()) {
        event.preventDefault();
        setShowExitConfirmation(true);
        setPendingNavigation(() => () => {
          window.history.back();
        });
        // Push current state back to prevent navigation
        window.history.pushState(null, '', window.location.href);
      }
    };

    document.addEventListener('click', handleLinkClick);
    window.addEventListener('popstate', handlePopState);
    
    // Push state to catch back button
    window.history.pushState(null, '', window.location.href);

    return () => {
      document.removeEventListener('click', handleLinkClick);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedContent, navigate]);

  // Auto-save draft functionality when leaving the page (browser close/refresh)
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedContent() && user) {
        event.preventDefault();
        event.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        saveDraftToDatabase();
        return event.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedContent, user]);

  // Update form data ref whenever values change
  useEffect(() => {
    formDataRef.current = { title, description, category, lookingForText, user };
  }, [title, description, category, lookingForText, user]);

  // Save draft when navigating away (component unmount) - no dependencies!
  useEffect(() => {
    return () => {
      // Use ref values to avoid stale closure
      const { title: currentTitle, description: currentDescription, category: currentCategory, lookingForText: currentLookingForText, user: currentUser } = formDataRef.current;
      const hasContent = currentTitle.trim() || currentDescription.trim() || currentCategory || currentLookingForText.trim();
      if (hasContent && currentUser) {
        saveDraftToDatabase();
        // Use setTimeout to ensure the toast shows on the destination page
        setTimeout(() => {
          toast.success('Draft saved successfully!');
        }, 100);
      }
    };
  }, []); // No dependencies - only runs on actual unmount


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

  // Handle exit confirmation dialog
  const handleExitWithoutSaving = () => {
    setShowExitConfirmation(false);
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
  };

  const handleSaveAndExit = async () => {
    setShowExitConfirmation(false);
    try {
      await saveDraftToDatabase();
      toast.success('Draft saved successfully!');
      if (pendingNavigation) {
        pendingNavigation();
        setPendingNavigation(null);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Error saving draft');
    }
  };

  const handleCancelExit = () => {
    setShowExitConfirmation(false);
    setPendingNavigation(null);
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
    // Validation - all fields are now mandatory
    if (!title.trim()) {
      toast.error('Please enter a title for your item');
      return;
    }

    if (!description.trim()) {
      toast.error('Please enter a description for your item');
      return;
    }

    if (images.length === 0) {
      toast.error('Please add at least one image of your item');
      return;
    }

    if (!category) {
      toast.error('Please select a category for your item');
      return;
    }

    if (!subcategory) {
      toast.error('Please select a subcategory for your item');
      return;
    }

    if (!condition) {
      toast.error('Please select the condition of your item');
      return;
    }

    if (!priceRange) {
      toast.error('Please select a price range for your item');
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
                  if (draftId) {
                    // Update existing draft without showing "Item updated successfully" toast
                    const { supabase } = await import('@/integrations/supabase/client');
                    
                    const draftData = {
                      name: title || 'Untitled Draft',
                      description,
                      category,
                      condition,
                      tags: subcategory ? [subcategory] : [],
                      looking_for_categories: selectedCategories,
                      looking_for_conditions: selectedConditions,
                      looking_for_description: lookingForText,
                      price_range_min: priceRange ? parseFloat(priceRange.split('-')[0]) : undefined,
                      price_range_max: priceRange ? parseFloat(priceRange.split('-')[1]) : undefined,
                      status: 'draft' as const,
                      updated_at: new Date().toISOString()
                    };
                    
                    const { error } = await supabase
                      .from('items')
                      .update(draftData)
                      .eq('id', draftId)
                      .eq('user_id', user?.id);
                    
                    if (error) {
                      toast.error('Error saving draft');
                    } else {
                      toast.success('Draft saved successfully!');
                    }
                  } else {
                    // Create new draft
                    await saveDraftToDatabase();
                    toast.success('Draft saved successfully!');
                  }
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

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitConfirmation} onOpenChange={setShowExitConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
              Unsaved Changes
            </AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes to your item listing. What would you like to do?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={handleCancelExit} className="w-full sm:w-auto">
              Stay Here
            </AlertDialogCancel>
            <Button 
              onClick={handleExitWithoutSaving}
              variant="outline"
              className="w-full sm:w-auto border-red-300 text-red-600 hover:bg-red-50"
            >
              Leave Without Saving
            </Button>
            <AlertDialogAction 
              onClick={handleSaveAndExit}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            >
              <Save className="mr-2 h-4 w-4" />
              Save & Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default PostItem;
