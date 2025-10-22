
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ImagePlus, Upload, X, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  existingImageUrls?: string[];
  setExistingImageUrls?: (urls: string[]) => void;
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
  "Food": ["Beverages", "Snacks", "Specialty Foods", "Baking Supplies", "Condiments", "Health Foods", "International Foods", "Other Food Items"],
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
  existingImageUrls = [],
  setExistingImageUrls,
  category,
  setCategory,
  subcategory,
  setSubcategory,
  condition,
  setCondition,
  priceRange,
  setPriceRange
}) => {
  const totalImages = existingImageUrls.length + images.length;
  const MAX_IMAGES = 5;
  const [isCheckingImage, setIsCheckingImage] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [warningMessage, setWarningMessage] = useState('');
  
  const checkImageOriginality = async (file: File) => {
    try {
      console.log('🔍 Starting image originality check for:', file.name);
      
      // Upload image temporarily to check it
      const fileExt = file.name.split('.').pop();
      const fileName = `temp-check-${Math.random()}.${fileExt}`;
      const filePath = `temp/${fileName}`;

      console.log('📤 Uploading to storage:', filePath);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('items')
        .upload(filePath, file);

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        toast.error('Failed to check image. Please try again.');
        return { isOriginal: true }; // Fail open
      }

      console.log('✅ Upload successful, getting public URL');
      const { data: urlData } = supabase.storage
        .from('items')
        .getPublicUrl(filePath);

      console.log('🔗 Public URL:', urlData.publicUrl);

      // Call edge function to check image
      console.log('🚀 Calling edge function to check image');
      const { data, error } = await supabase.functions.invoke('check-image-originality', {
        body: { imageUrl: urlData.publicUrl }
      });

      // Clean up temp file
      console.log('🧹 Cleaning up temp file');
      await supabase.storage.from('items').remove([filePath]);

      if (error) {
        console.error('❌ Edge function error:', error);
        toast.error('Failed to verify image. Proceeding anyway.');
        return { isOriginal: true }; // Fail open
      }

      console.log('✅ Image check result:', data);
      return data;
    } catch (error) {
      console.error('❌ Error checking image:', error);
      toast.error('Image check failed. Please try again.');
      return { isOriginal: true }; // Fail open
    }
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files);
      const remainingSlots = MAX_IMAGES - totalImages;
      const imagesToAdd = newImages.slice(0, remainingSlots);
      
      // Check first image for originality
      if (imagesToAdd.length > 0) {
        setIsCheckingImage(true);
        toast.info('Checking image originality...');
        
        const checkResult = await checkImageOriginality(imagesToAdd[0]);
        setIsCheckingImage(false);
        
        if (!checkResult.isOriginal) {
          setPendingImages(imagesToAdd);
          setWarningMessage(checkResult.warning || 'This image appears on multiple websites. Please ensure you own the rights to this photo.');
          setShowWarningDialog(true);
        } else {
          setImages([...images, ...imagesToAdd]);
          toast.success('Images added successfully');
        }
      }
    }
  };
  
  const handleProceedWithImages = () => {
    setImages([...images, ...pendingImages]);
    setPendingImages([]);
    setShowWarningDialog(false);
    toast.info('Please ensure you have the rights to use these images');
  };
  
  const handleCancelImages = () => {
    setPendingImages([]);
    setShowWarningDialog(false);
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
  };
  
  const removeExistingImage = (index: number) => {
    if (setExistingImageUrls) {
      const updatedUrls = existingImageUrls.filter((_, i) => i !== index);
      setExistingImageUrls(updatedUrls);
    }
  };

  // Get subcategories based on selected category
  const getSubcategories = () => {
    if (!category) return [];
    const subcats = categories[category as keyof typeof categories] || [];
    console.log('🏷️ getSubcategories DEBUG:', {
      category,
      subcats,
      currentSubcategory: subcategory,
      isSubcategoryInList: subcats.includes(subcategory)
    });
    return subcats;
  };

  return (
    <>
      <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Possible Non-Original Image Detected
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p className="text-base">{warningMessage}</p>
              <p className="text-sm text-muted-foreground">
                Using images you don't own may violate our terms of service and could result in your item being removed.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelImages}>
              Choose Different Image
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleProceedWithImages}>
              I Own This Image
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
        <div className="space-y-6">
        {/* Image Upload */}
        <div>
          <Label htmlFor="images" className="text-lg font-semibold text-gray-900 mb-3 block">Add Images <span className="text-red-500">*</span></Label>
          <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
            <Upload className="h-10 w-10 text-gray-400 mb-3" />
            <p className="text-base font-medium text-gray-700 mb-1">Upload your item photos</p>
            <p className="text-sm text-gray-500 mb-4">Add up to 5 high-quality images ({totalImages}/5 used)</p>
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
              disabled={totalImages >= MAX_IMAGES || isCheckingImage}
            >
              <ImagePlus className="mr-2 h-4 w-4" />
              {isCheckingImage ? 'Checking Image...' : totalImages >= MAX_IMAGES ? 'Maximum Images Reached' : 'Choose Images'}
            </Button>
            
            {/* Show existing images if available */}
            {existingImageUrls.length > 0 && (
              <div className="mt-6 w-full">
                <p className="text-sm text-gray-600 mb-2">Current images:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {existingImageUrls.map((imageUrl, index) => (
                    <div key={`existing-${index}`} className="relative group">
                      <div className="relative h-24 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={`Current item ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {images.length > 0 && (
              <div className="mt-6 w-full">
                <p className="text-sm text-gray-600 mb-2">New images to upload:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div key={`new-${index}`} className="relative group">
                      <div className="relative h-24 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
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
              </div>
            )}
          </div>
        </div>
        
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-lg font-semibold text-gray-900">Item Title <span className="text-red-500">*</span></Label>
          <Input 
            id="title" 
            placeholder="Give your item a catchy title..." 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        
        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-lg font-semibold text-gray-900">Description <span className="text-red-500">*</span></Label>
          <Textarea 
            id="description" 
            placeholder="Tell potential traders about your item's condition, history, and any special features..." 
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        
        {/* Category and Subcategory stacked vertically */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category" className="text-lg font-semibold text-gray-900">Category <span className="text-red-500">*</span></Label>
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
            <div className="space-y-2">
              <Label htmlFor="subcategory" className="text-lg font-semibold text-gray-900">Subcategory <span className="text-red-500">*</span></Label>
               <Select 
                value={subcategory} 
                onValueChange={(value) => {
                  console.log('🏷️ SUBCATEGORY SELECT DEBUG:', {
                    selectedValue: value,
                    currentSubcategory: subcategory,
                    category: category,
                    availableSubcategories: getSubcategories()
                  });
                  setSubcategory(value);
                }}
               >
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
        
        {/* Condition */}
        <div className="space-y-2">
          <Label htmlFor="condition" className="text-lg font-semibold text-gray-900">Condition <span className="text-red-500">*</span></Label>
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
        
        {/* Estimated Value */}
        <div className="space-y-2">
          <Label htmlFor="price-range" className="text-lg font-semibold text-gray-900">Price Range <span className="text-red-500">*</span></Label>
          <Select 
            value={priceRange} 
            onValueChange={(value) => {
              console.log('Price range selected:', value);
              setPriceRange(value);
            }}
          >
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
      </div>
      </div>
    </>
  );
};

export default ItemOfferingForm;
