
import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ImagePlus, Save, Check } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Define types for saved preferences
type SavedPreference = {
  id: string;
  name: string;
  lookingFor: string;
  selectedCategories: string[];
  selectedSubcategories: Record<string, string[]>;
  selectedPriceRanges: string[];
  selectedConditions: string[];
}

const PostItem: React.FC = () => {
  const { toast } = useToast();
  const [images, setImages] = useState<File[]>([]);
  const [category, setCategory] = useState<string>("");
  const [subcategory, setSubcategory] = useState<string>("");
  const [condition, setCondition] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("");
  
  // For "What You're Looking For" section
  const [lookingForText, setLookingForText] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<Record<string, string[]>>({});
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files);
      setImages(prev => [...prev, ...newImages]);
    }
  };

  // Define categories and their subcategories for rental items
  const categories = {
    "Electronics": ["Cameras", "Computers", "Audio Equipment", "TVs", "Gaming Consoles", "Other Electronics"],
    "Home & Garden": ["Power Tools", "Furniture", "Party Supplies", "Kitchen Appliances", "Gardening Equipment", "Other Home Items"],
    "Sports & Outdoors": ["Camping Gear", "Bikes", "Winter Sports", "Water Sports", "Fitness Equipment", "Other Sports Gear"],
    "Clothing": ["Formal Wear", "Costumes", "Accessories", "Designer Items", "Special Occasion", "Other Clothing"],
    "Business": ["Office Equipment", "Event Spaces", "Projectors", "Conference Equipment", "Other Business Items"],
    "Entertainment": ["Musical Instruments", "Party Equipment", "Board Games", "Video Games", "Other Entertainment Items"],
    "Collectibles": ["Trading Cards", "Toys", "Vintage Items", "Memorabilia", "Comics", "Stamps", "Coins", "Vinyl Records", "Antiques", "Other Collectibles"],
    "Books & Media": ["Books", "Movies", "Music", "Magazines", "Other Media"],
    "Tools & Equipment": ["Power Tools", "Hand Tools", "Construction Equipment", "Workshop Tools", "Other Tools"],
    "Vehicles": ["Cars", "Motorcycles", "Bicycles", "Scooters", "Other Vehicles"],
    "Furniture": ["Living Room", "Bedroom", "Dining Room", "Office", "Outdoor", "Other Furniture"],
    "Other": ["Miscellaneous"]
  };

  // Conditions for rental items
  const conditions = [
    "Brand New", 
    "Like New", 
    "Very Good", 
    "Good", 
    "Acceptable",
    "Fair",
    "Poor"
  ];
  
  // Price ranges as shown in the image
  const priceRanges = [
    "$0 - $50",
    "$50 - $100",
    "$100 - $250",
    "$250 - $500",
    "$500 - $1,000",
    "$1,000 - $2,500",
    "$2,500 - $5,000",
    "$5,000+"
  ];

  // Subcategories based on selected category
  const getSubcategories = () => {
    if (!category) return [];
    return categories[category as keyof typeof categories] || [];
  };

  // Toggle category selection in "What You're Looking For"
  const toggleCategory = (categoryName: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryName)) {
        // Remove the category and its subcategories
        const newSelected = prev.filter(cat => cat !== categoryName);
        setSelectedSubcategories(prev => {
          const updated = {...prev};
          delete updated[categoryName];
          return updated;
        });
        return newSelected;
      } else {
        // Add the category
        return [...prev, categoryName];
      }
    });
  };

  // Toggle subcategory selection
  const toggleSubcategory = (category: string, subcategory: string) => {
    setSelectedSubcategories(prev => {
      const currentSubs = prev[category] || [];
      const updatedSubs = currentSubs.includes(subcategory)
        ? currentSubs.filter(sub => sub !== subcategory)
        : [...currentSubs, subcategory];
      
      return {
        ...prev,
        [category]: updatedSubs
      };
    });
  };

  // Toggle price range selection
  const togglePriceRange = (range: string) => {
    setSelectedPriceRanges(prev => 
      prev.includes(range) 
        ? prev.filter(r => r !== range) 
        : [...prev, range]
    );
  };

  // Toggle condition selection
  const toggleCondition = (condition: string) => {
    setSelectedConditions(prev => 
      prev.includes(condition) 
        ? prev.filter(c => c !== condition) 
        : [...prev, condition]
    );
  };

  // Save current preferences
  const savePreferences = () => {
    if (!preferenceName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for your preferences",
        variant: "destructive",
      });
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
    
    toast({
      title: "Success",
      description: "Your preferences have been saved",
    });
    
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
    
    toast({
      title: "Preferences Applied",
      description: `"${preference.name}" has been applied to your search`,
    });
    
    setShowSavedPreferences(false);
  };

  // Delete a saved preference
  const deletePreference = (id: string) => {
    const updatedPreferences = savedPreferences.filter(pref => pref.id !== id);
    setSavedPreferences(updatedPreferences);
    localStorage.setItem('tradeMatePreferences', JSON.stringify(updatedPreferences));
    
    toast({
      title: "Deleted",
      description: "Preference has been removed",
    });
  };

  const handleSubmit = () => {
    toast({
      title: "Item Posted",
      description: "Your item has been successfully posted for trade.",
    });
    // Here you would normally handle the form submission
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* What You're Offering Column */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-trademate-blue">What You're Offering</h2>
            
            <div className="space-y-6">
              {/* Image Upload */}
              <div>
                <Label htmlFor="images">Add Images</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
                  <ImagePlus className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Upload up to 5 images</p>
                  <input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => document.getElementById('images')?.click()}
                  >
                    Select Images
                  </Button>
                  
                  {images.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-2 w-full">
                      {images.map((image, index) => (
                        <div key={index} className="relative h-20 bg-gray-100 rounded-md overflow-hidden">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="What are you offering for rent?" />
              </div>
              
              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe your rental item in detail..." 
                  rows={4}
                />
              </div>
              
              {/* Condition - Moved up as requested */}
              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger id="condition" className="w-full">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((cond) => (
                      <SelectItem key={cond} value={cond}>{cond}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={category} 
                  onValueChange={(value) => {
                    setCategory(value);
                    setSubcategory(""); // Reset subcategory when category changes
                  }}
                >
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(categories).map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Subcategory - only show if category is selected */}
              {category && (
                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Select value={subcategory} onValueChange={setSubcategory}>
                    <SelectTrigger id="subcategory" className="w-full">
                      <SelectValue placeholder="Select a subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {getSubcategories().map((subcat) => (
                        <SelectItem key={subcat} value={subcat}>{subcat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Price Range - Moved to the bottom as requested */}
              <div className="space-y-2">
                <Label htmlFor="price-range">Price Range</Label>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger id="price-range" className="w-full">
                    <SelectValue placeholder="Select price range" />
                  </SelectTrigger>
                  <SelectContent>
                    {priceRanges.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* What You're Looking For Column */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-trademate-blue">What You're Looking For</h2>
            </div>
            
            {/* Display saved preferences if active */}
            {showSavedPreferences && savedPreferences.length > 0 && (
              <div className="mb-6 bg-gray-50 p-4 rounded-lg border">
                <h3 className="font-medium mb-3">Saved Preferences</h3>
                <div className="space-y-2">
                  {savedPreferences.map((pref) => (
                    <div key={pref.id} className="flex items-center justify-between bg-white p-2 rounded border">
                      <span className="font-medium">{pref.name}</span>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          onClick={() => applyPreference(pref)}
                        >
                          Apply
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => deletePreference(pref.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="lookingFor">I'm looking for...</Label>
                <Textarea 
                  id="lookingFor" 
                  placeholder="Describe what you would like to trade for..." 
                  rows={4}
                  value={lookingForText}
                  onChange={(e) => setLookingForText(e.target.value)}
                />
              </div>
              
              {/* Categories Section - Updated to match the image */}
              <div className="space-y-4">
                <h3 className="text-xl font-medium">Categories (Select all that apply)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.keys(categories).map((categoryName) => (
                    <div key={categoryName} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`category-${categoryName}`} 
                        checked={selectedCategories.includes(categoryName)}
                        onCheckedChange={() => toggleCategory(categoryName)}
                      />
                      <Label 
                        htmlFor={`category-${categoryName}`}
                        className="text-base font-normal cursor-pointer"
                      >
                        {categoryName}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Subcategories Section - Only shown when categories are selected */}
              {selectedCategories.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-medium">Subcategories (Select all that apply)</h3>
                  {selectedCategories.map((categoryName) => (
                    <div key={`subcats-${categoryName}`} className="space-y-2">
                      {categories[categoryName as keyof typeof categories].map((subcat) => (
                        <div key={`${categoryName}-${subcat}`} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`subcategory-${categoryName}-${subcat}`} 
                            checked={(selectedSubcategories[categoryName] || []).includes(subcat)}
                            onCheckedChange={() => toggleSubcategory(categoryName, subcat)}
                          />
                          <Label 
                            htmlFor={`subcategory-${categoryName}-${subcat}`}
                            className="text-base font-normal cursor-pointer flex items-center"
                          >
                            {subcat} <span className="text-gray-500 ml-2">({categoryName})</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Price Range Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-medium">Price Range (Select all that apply)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {priceRanges.map((range) => (
                    <div key={range} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`price-range-${range}`}
                        checked={selectedPriceRanges.includes(range)}
                        onCheckedChange={() => togglePriceRange(range)}
                      />
                      <Label 
                        htmlFor={`price-range-${range}`}
                        className="text-base font-normal cursor-pointer"
                      >
                        {range}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Condition Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-medium">Condition (Select all that apply)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {conditions.map((condition) => (
                    <div key={condition} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`condition-${condition}`}
                        checked={selectedConditions.includes(condition)}
                        onCheckedChange={() => toggleCondition(condition)}
                      />
                      <Label 
                        htmlFor={`condition-${condition}`}
                        className="text-base font-normal cursor-pointer"
                      >
                        {condition}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
            className="bg-trademate-dark hover:bg-trademate-blue text-white"
          >
            <Check className="mr-2 h-4 w-4" /> Submit Item
          </Button>
        </div>
      </div>

      {/* Dialog for saving preferences */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save Your Preferences</DialogTitle>
            <DialogDescription>
              Give your preferences a name so you can easily use them again later.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="preference-name" className="col-span-4">
                Name
              </Label>
              <Input
                id="preference-name"
                placeholder="e.g., Photography Equipment"
                className="col-span-4"
                value={preferenceName}
                onChange={(e) => setPreferenceName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={savePreferences}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
