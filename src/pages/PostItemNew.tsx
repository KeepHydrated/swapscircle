import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Package, X } from 'lucide-react';

const PostItemNew: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Simple form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    condition: '',
    priceRange: '',
    lookingForDescription: '',
    lookingForCategories: [] as string[],
    lookingForConditions: [] as string[],
    lookingForPriceRanges: [] as string[]
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Categories
  const categories = {
    "Electronics": ["Cameras", "Computers", "Audio Equipment", "TVs", "Gaming Consoles", "Mobile Devices", "Other Electronics"],
    "Home & Garden": ["Power Tools", "Furniture", "Party Supplies", "Kitchen Appliances", "Gardening Equipment", "Home Decor", "Other Home Items"],
    "Sports & Outdoors": ["Camping Gear", "Bikes", "Winter Sports", "Water Sports", "Fitness Equipment", "Team Sports", "Other Sports Gear"],
    "Clothing": ["Formal Wear", "Costumes", "Accessories", "Designer Items", "Special Occasion", "Casual Wear", "Other Clothing"],
    "Business": ["Office Equipment", "Event Spaces", "Projectors", "Conference Equipment", "Office Furniture", "Business Services", "Other Business Items"],
    "Entertainment": ["Musical Instruments", "Party Equipment", "Board Games", "Video Games", "Movies & Music", "Books", "Other Entertainment Items"],
    "Collectibles": ["Trading Cards", "Toys", "Vintage Items", "Memorabilia", "Comics", "Stamps", "Coins", "Vinyl Records", "Antiques", "Other Collectibles"],
    "Books & Media": ["Books", "Movies", "Music", "Magazines", "E-books", "Audiobooks", "Other Media"],
    "Tools & Equipment": ["Power Tools", "Hand Tools", "Construction Equipment", "Workshop Tools", "Measuring Tools", "Safety Equipment", "Other Tools"]
  };

  const conditions = ["New", "Like New", "Good", "Fair", "Poor"];
  const priceRanges = ["0-50", "50-100", "100-250", "250-500", "500+"];

  const handleInputChange = (field: string, value: string) => {
    console.log(`🔍 Field ${field} changed to:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset subcategory if category changes
    if (field === 'category') {
      setFormData(prev => ({ ...prev, subcategory: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages(prev => [...prev, ...newImages]);
      console.log('📸 Images uploaded:', newImages.length);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
    console.log('🗑️ Image removed at index:', indexToRemove);
  };

  const handleArrayToggle = (field: string, value: string) => {
    setFormData(prev => {
      const currentArray = prev[field as keyof typeof prev] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
    console.log(`🔍 Array field ${field} toggled:`, value);
  };

  const handleSubmit = async () => {
    console.log('🚀 SUBMIT CLICKED!');
    console.log('📋 Form Data:', formData);
    console.log('📸 Images:', images.length);
    
    // Validation
    const requiredFields = ['title', 'description', 'category', 'condition', 'priceRange'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      console.log('❌ Missing fields:', missingFields);
      toast.error(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }
    
    if (images.length === 0) {
      console.log('❌ No images');
      toast.error('Please add at least one image');
      return;
    }

    console.log('✅ Validation passed, submitting...');
    setIsSubmitting(true);
    
    try {
      // TODO: Implement actual submission logic here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      console.log('✅ Item posted successfully!');
      toast.success('Item posted successfully!');
      navigate('/home');
    } catch (error) {
      console.error('❌ Submission error:', error);
      toast.error('Failed to post item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return <div>Please log in to post an item.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - What You're Offering */}
          <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-6 w-6" />
              What You're Offering
            </CardTitle>
            <p className="text-muted-foreground mt-2">Tell us about the item you want to trade</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Images */}
            <div className="space-y-2">
              <Label>Images * ({images.length} uploaded)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                >
                  Click to upload images or drag and drop
                </label>
              </div>
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={URL.createObjectURL(img)}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-lg truncate">
                        {img.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter item title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your item"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(categories).map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subcategory */}
            {formData.category && (
              <div className="space-y-2">
                <Label>Subcategory</Label>
                <Select value={formData.subcategory} onValueChange={(value) => handleInputChange('subcategory', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories[formData.category as keyof typeof categories]?.map((subcat) => (
                      <SelectItem key={subcat} value={subcat}>{subcat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Condition */}
            <div className="space-y-2">
              <Label>Condition *</Label>
              <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map((condition) => (
                    <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <Label>Price Range *</Label>
              <Select value={formData.priceRange} onValueChange={(value) => handleInputChange('priceRange', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select price range" />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map((range) => (
                    <SelectItem key={range} value={range}>${range}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            </CardContent>
          </Card>

          {/* Right Column - What You're Looking For */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-6 w-6" />
                What You're Looking For
              </CardTitle>
              <p className="text-muted-foreground mt-2">Describe what you'd like to receive in return</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Looking For Description */}
              <div className="space-y-2">
                <Label htmlFor="lookingForDescription">What are you hoping to get? *</Label>
                <Textarea
                  id="lookingForDescription"
                  placeholder="Describe what you'd like to trade for..."
                  value={formData.lookingForDescription}
                  onChange={(e) => handleInputChange('lookingForDescription', e.target.value)}
                  rows={4}
                />
              </div>

              {/* Looking For Categories */}
              <div className="space-y-2">
                <Label>Categories you're interested in</Label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {Object.keys(categories).map((cat) => (
                    <label key={cat} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.lookingForCategories.includes(cat)}
                        onChange={() => handleArrayToggle('lookingForCategories', cat)}
                        className="rounded"
                      />
                      <span className="text-sm">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Looking For Conditions */}
              <div className="space-y-2">
                <Label>Acceptable conditions</Label>
                <div className="grid grid-cols-2 gap-2">
                  {conditions.map((condition) => (
                    <label key={condition} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.lookingForConditions.includes(condition)}
                        onChange={() => handleArrayToggle('lookingForConditions', condition)}
                        className="rounded"
                      />
                      <span className="text-sm">{condition}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Looking For Price Ranges */}
              <div className="space-y-2">
                <Label>Price ranges you're interested in</Label>
                <div className="grid grid-cols-2 gap-2">
                  {priceRanges.map((range) => (
                    <label key={range} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.lookingForPriceRanges.includes(range)}
                        onChange={() => handleArrayToggle('lookingForPriceRanges', range)}
                        className="rounded"
                      />
                      <span className="text-sm">${range}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Button - Full Width Below Both Columns */}
        <div className="mt-8">
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? 'Posting...' : 'Post Item'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PostItemNew;