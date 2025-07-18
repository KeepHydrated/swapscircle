
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ImagePlus, Upload, X } from 'lucide-react';
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
  "0 - 50",
  "50 - 100",
  "100 - 250",
  "250 - 500",
  "500 - 750",
  "750 - 1,000"
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

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
  };

  // Get subcategories based on selected category
  const getSubcategories = () => {
    if (!category) return [];
    return categories[category as keyof typeof categories] || [];
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
      <div className="space-y-6">
        {/* Image Upload */}
        <div>
          <Label htmlFor="images" className="text-lg font-semibold text-gray-900 mb-3 block">Add Images</Label>
          <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
            <Upload className="h-10 w-10 text-gray-400 mb-3" />
            <p className="text-base font-medium text-gray-700 mb-1">Upload your item photos</p>
            <p className="text-sm text-gray-500 mb-4">Add up to 5 high-quality images</p>
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
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2"
              onClick={() => document.getElementById('images')?.click()}
            >
              <ImagePlus className="mr-2 h-4 w-4" />
              Choose Images
            </Button>
            
            {images.length > 0 && (
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="relative h-24 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-lg font-semibold text-gray-900">Item Title</Label>
          <Input 
            id="title" 
            placeholder="Give your item a catchy title..." 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-lg font-semibold text-gray-900">Description</Label>
          <Textarea 
            id="description" 
            placeholder="Tell potential traders about your item's condition, history, and any special features..." 
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        {/* Category and Subcategory in same row */}
        <div className="flex gap-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="category" className="text-lg font-semibold text-gray-900">Category</Label>
            <Select 
              value={category} 
              onValueChange={(value) => {
                setCategory(value);
                setSubcategory(""); // Reset subcategory when category changes
              }}
            >
              <SelectTrigger id="category" className="h-12 text-base border-gray-300 focus:border-blue-500">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(categories).map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-base py-2">{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Subcategory - only show if category is selected */}
          {category && (
            <div className="flex-1 space-y-2">
              <Label htmlFor="subcategory" className="text-lg font-semibold text-gray-900">Subcategory</Label>
              <Select value={subcategory} onValueChange={setSubcategory}>
                <SelectTrigger id="subcategory" className="h-12 text-base border-gray-300 focus:border-blue-500">
                  <SelectValue placeholder="Select a subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {getSubcategories().map((subcat) => (
                    <SelectItem key={subcat} value={subcat} className="text-base py-2">{subcat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        {/* Estimated Value */}
        <div className="space-y-2">
          <Label htmlFor="price-range" className="text-lg font-semibold text-gray-900">Price Range</Label>
          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger id="price-range" className="h-12 text-base border-gray-300 focus:border-blue-500">
              <SelectValue placeholder="Select value range" />
            </SelectTrigger>
            <SelectContent>
              {priceRanges.map((range) => (
                <SelectItem key={range} value={range} className="text-base py-2">
                  {range}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Condition */}
        <div className="space-y-2">
          <Label htmlFor="condition" className="text-lg font-semibold text-gray-900">Condition</Label>
          <Select value={condition} onValueChange={setCondition}>
            <SelectTrigger id="condition" className="h-12 text-base border-gray-300 focus:border-blue-500">
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              {conditions.map((cond) => (
                <SelectItem key={cond} value={cond} className="text-base py-2">{cond}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ItemOfferingForm;
