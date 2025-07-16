
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from "@/components/ui/checkbox";

// Define types for saved preferences
export type SavedPreference = {
  id: string;
  name: string;
  lookingFor: string;
  selectedCategories: string[];
  selectedSubcategories: Record<string, string[]>;
  selectedPriceRanges: string[];
  selectedConditions: string[];
}

interface PreferencesFormProps {
  lookingForText: string;
  setLookingForText: (value: string) => void;
  selectedCategories: string[];
  setSelectedCategories: (value: string[]) => void;
  selectedSubcategories: Record<string, string[]>;
  setSelectedSubcategories: (value: Record<string, string[]>) => void;
  selectedPriceRanges: string[];
  setSelectedPriceRanges: (value: string[]) => void;
  selectedConditions: string[];
  setSelectedConditions: (value: string[]) => void;
}

// Categories for items
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

// Price ranges updated to cap at $1,000
const priceRanges = [
  "0 - 50",
  "50 - 100",
  "100 - 250",
  "250 - 500",
  "500 - 750",
  "750 - 1,000"
];

const PreferencesForm: React.FC<PreferencesFormProps> = ({
  lookingForText,
  setLookingForText,
  selectedCategories,
  setSelectedCategories,
  selectedSubcategories,
  setSelectedSubcategories,
  selectedPriceRanges,
  setSelectedPriceRanges,
  selectedConditions,
  setSelectedConditions,
}) => {
  // Toggle category selection in "What You're Looking For"
  const toggleCategory = (categoryName: string) => {
    // Fixed TypeScript error by creating new arrays directly instead of using updater functions
    if (selectedCategories.includes(categoryName)) {
      // Remove the category and its subcategories
      const newSelected = selectedCategories.filter(cat => cat !== categoryName);
      setSelectedCategories(newSelected);
      
      // Create new subcategories object without the removed category
      const updatedSubcategories = {...selectedSubcategories};
      delete updatedSubcategories[categoryName];
      setSelectedSubcategories(updatedSubcategories);
    } else {
      // Add the category
      setSelectedCategories([...selectedCategories, categoryName]);
    }
  };

  // Toggle subcategory selection
  const toggleSubcategory = (category: string, subcategory: string) => {
    const currentSubs = selectedSubcategories[category] || [];
    const updatedSubs = currentSubs.includes(subcategory)
      ? currentSubs.filter(sub => sub !== subcategory)
      : [...currentSubs, subcategory];
    
    // Create new subcategories object with updated values
    const newSelectedSubcategories = {
      ...selectedSubcategories,
      [category]: updatedSubs
    };
    
    setSelectedSubcategories(newSelectedSubcategories);
  };

  // Toggle price range selection
  const togglePriceRange = (range: string) => {
    if (selectedPriceRanges.includes(range)) {
      setSelectedPriceRanges(selectedPriceRanges.filter(r => r !== range));
    } else {
      setSelectedPriceRanges([...selectedPriceRanges, range]);
    }
  };

  // Toggle condition selection
  const toggleCondition = (condition: string) => {
    if (selectedConditions.includes(condition)) {
      setSelectedConditions(selectedConditions.filter(c => c !== condition));
    } else {
      setSelectedConditions([...selectedConditions, condition]);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      
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
        
        {/* Categories Section */}
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
  );
};

export default PreferencesForm;
