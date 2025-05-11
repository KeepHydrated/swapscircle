import React, { useState } from 'react';
import Header from '@/components/layout/Header';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PostItem: React.FC = () => {
  const [images, setImages] = useState<File[]>([]);
  const [category, setCategory] = useState<string>("");
  const [subcategory, setSubcategory] = useState<string>("");
  const [condition, setCondition] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("");

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
    "Entertainment": ["Musical Instruments", "Party Equipment", "Board Games", "Video Games", "Other Entertainment Items"]
  };

  // Conditions for rental items
  const conditions = [
    "Brand New", 
    "Like New", 
    "Very Good", 
    "Good", 
    "Acceptable"
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
            <h2 className="text-xl font-semibold mb-4 text-trademate-blue">What You're Looking For</h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="lookingFor">I'm looking for...</Label>
                <Textarea 
                  id="lookingFor" 
                  placeholder="Describe what you would like to trade for..." 
                  rows={6}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostItem;
