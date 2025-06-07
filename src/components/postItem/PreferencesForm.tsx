
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

// Reuse the categories from ItemOfferingForm
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

// Conditions
const conditions = [
  "Brand New", 
  "Like New", 
  "Very Good", 
  "Good", 
  "Acceptable",
  "Fair",
  "Poor"
];

// Price ranges
const priceRanges = [
  "$0 - $50",
  "$50 - $100",
  "$100 - $250",
  "$250 - $500",
  "$500 - $750",
  "$750 - $1,000"
];

export interface SavedPreference {
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
  setSelectedConditions
}) => {
  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      // Using direct array instead of updater function to avoid TypeScript errors
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
      
      // Also remove any selected subcategories for this category
      const newSelectedSubcategories = { ...selectedSubcategories };
      delete newSelectedSubcategories[category];
      // Direct object assignment to avoid TypeScript errors
      setSelectedSubcategories(newSelectedSubcategories);
    }
  };
  
  const handleSubcategoryChange = (category: string, subcategory: string, checked: boolean) => {
    const currentSubcats = selectedSubcategories[category] || [];
    let newSubcategoriesForCategory: string[];
    
    if (checked) {
      newSubcategoriesForCategory = [...currentSubcats, subcategory];
    } else {
      newSubcategoriesForCategory = currentSubcats.filter(sc => sc !== subcategory);
    }
    
    // Direct object assignment to avoid TypeScript errors
    setSelectedSubcategories({
      ...selectedSubcategories,
      [category]: newSubcategoriesForCategory
    });
  };
  
  const handlePriceRangeChange = (range: string, checked: boolean) => {
    if (checked) {
      // Using direct array instead of updater function to avoid TypeScript errors
      setSelectedPriceRanges([...selectedPriceRanges, range]);
    } else {
      setSelectedPriceRanges(selectedPriceRanges.filter(r => r !== range));
    }
  };
  
  const handleConditionChange = (condition: string, checked: boolean) => {
    if (checked) {
      // Using direct array instead of updater function to avoid TypeScript errors
      setSelectedConditions([...selectedConditions, condition]);
    } else {
      setSelectedConditions(selectedConditions.filter(c => c !== condition));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-trademate-blue">What You're Looking For</h2>
      
      <div className="space-y-6">
        {/* Looking for text */}
        <div className="space-y-2">
          <Label htmlFor="looking-for">Looking For</Label>
          <Textarea 
            id="looking-for" 
            placeholder="Describe what you're looking for..." 
            rows={3}
            value={lookingForText}
            onChange={(e) => setLookingForText(e.target.value)}
          />
        </div>
        
        {/* Categories */}
        <div className="space-y-2">
          <Label>Categories</Label>
          <ScrollArea className="h-44 border rounded-md p-4">
            <div className="space-y-2">
              {Object.keys(categories).map((category) => (
                <div key={category} className="flex items-start space-x-2">
                  <Checkbox 
                    id={`category-${category}`}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={(checked) => handleCategoryChange(category, checked === true)}
                  />
                  <div className="space-y-1 flex-1">
                    <Label 
                      htmlFor={`category-${category}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {category}
                    </Label>
                    
                    {/* Show subcategories if category is selected */}
                    {selectedCategories.includes(category) && (
                      <div className="ml-6 space-y-1 mt-2">
                        {categories[category as keyof typeof categories].map((subcategory) => (
                          <div key={subcategory} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`subcategory-${category}-${subcategory}`}
                              checked={(selectedSubcategories[category] || []).includes(subcategory)}
                              onCheckedChange={(checked) => 
                                handleSubcategoryChange(category, subcategory, checked === true)
                              }
                            />
                            <Label 
                              htmlFor={`subcategory-${category}-${subcategory}`}
                              className="text-xs cursor-pointer"
                            >
                              {subcategory}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        
        {/* Price Range */}
        <div className="space-y-2">
          <Label>Price Range</Label>
          <div className="flex flex-wrap gap-2">
            {priceRanges.map((range) => (
              <div key={range} className="flex items-center space-x-2">
                <Checkbox 
                  id={`price-${range}`}
                  checked={selectedPriceRanges.includes(range)}
                  onCheckedChange={(checked) => handlePriceRangeChange(range, checked === true)}
                />
                <Label 
                  htmlFor={`price-${range}`}
                  className="text-sm cursor-pointer"
                >
                  {range}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Condition */}
        <div className="space-y-2">
          <Label>Condition</Label>
          <div className="flex flex-wrap gap-2">
            {conditions.map((condition) => (
              <div key={condition} className="flex items-center space-x-2">
                <Checkbox 
                  id={`condition-${condition}`}
                  checked={selectedConditions.includes(condition)}
                  onCheckedChange={(checked) => handleConditionChange(condition, checked === true)}
                />
                <Label 
                  htmlFor={`condition-${condition}`}
                  className="text-sm cursor-pointer"
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
