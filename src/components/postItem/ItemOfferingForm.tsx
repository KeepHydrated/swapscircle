
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ImagePlus } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface ItemOfferingFormProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  images: File[];
  setImages: (value: File[]) => void;
  category: string;
  setCategory: (value: string) => void;
  subcategory: string;
  setSubcategory: (value: string) => void;
  condition: string;
  setCondition: (value: string) => void;
  priceRange: string;
  setPriceRange: (value: string) => void;
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

// Conditions for items
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

const ItemOfferingForm: React.FC<ItemOfferingFormProps> = ({
  title,
  setTitle,
  description,
  setDescription,
  images,
  setImages,
  category,
  setCategory,
  subcategory,
  setSubcategory,
  condition,
  setCondition,
  priceRange,
  setPriceRange
}) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files);
      // Fixed the TypeScript error by creating a new array instead of using updater function
      setImages([...images, ...newImages]);
    }
  };

  // Get subcategories based on selected category
  const getSubcategories = () => {
    if (!category) return [];
    return categories[category as keyof typeof categories] || [];
  };

  return (
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
          <Input 
            id="title" 
            placeholder="What are you offering for trade?" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        
        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description" 
            placeholder="Describe your trade item in detail..." 
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        
        {/* Condition */}
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
        
        {/* Price Range */}
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
  );
};

export default ItemOfferingForm;
