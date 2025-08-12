import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useParams, Link } from 'react-router-dom';
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
  const { itemId } = useParams<{ itemId: string }>();
  
  // Determine if we're editing or creating
  const isEditing = !!itemId;
  
  // Loading and existing data state
  const [loading, setLoading] = useState(isEditing);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  
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
    lookingForSubcategories: {} as Record<string, string[]>,
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

  // Load existing item data if editing
  useEffect(() => {
    const loadItemData = async () => {
      if (!isEditing || !itemId) return;
      
      setLoading(true);
      try {
        console.log('📝 Loading item for editing:', itemId);
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .eq('id', itemId)
          .eq('user_id', user!.id) // Ensure user owns this item
          .single();
        
        if (error) {
          console.error('❌ Failed to load item:', error);
          toast.error('Failed to load item data');
          navigate('/home');
          return;
        }
        
        console.log('✅ Loaded item data:', data);
        console.log('🔍 Looking for categories:', data.looking_for_categories);
        console.log('🔍 Looking for conditions:', data.looking_for_conditions);
        console.log('🔍 Looking for price ranges:', data.looking_for_price_ranges);
        console.log('🔍 Looking for description:', data.looking_for_description);
        
        // Parse subcategories from stored tags
        const storedTags = data.tags || [];
        const lookingForCategories = data.looking_for_categories || [];
        const parsedSubcategories: Record<string, string[]> = {};
        
        // For each "looking for" category, find which stored tags are subcategories of that category
        lookingForCategories.forEach(category => {
          if (categories[category as keyof typeof categories]) {
            const categorySubcategories = categories[category as keyof typeof categories];
            const matchingSubcategories = storedTags.filter(tag => 
              categorySubcategories.includes(tag)
            );
            if (matchingSubcategories.length > 0) {
              parsedSubcategories[category] = matchingSubcategories;
            }
          }
        });

        // Populate form with existing data
        setFormData({
          title: data.name || '',
          description: data.description || '',
          category: data.category || '',
          subcategory: data.tags?.[0] || '', // First tag as subcategory
          condition: data.condition || '',
          priceRange: `${data.price_range_min}-${data.price_range_max}`,
          lookingForDescription: data.looking_for_description || '',
          lookingForCategories: lookingForCategories,
          lookingForSubcategories: parsedSubcategories,
          lookingForConditions: data.looking_for_conditions || [],
          lookingForPriceRanges: data.looking_for_price_ranges || []
        });
        
        setExistingImageUrls(data.image_urls || []);
        
      } catch (error) {
        console.error('❌ Error loading item:', error);
        toast.error('Failed to load item data');
        navigate('/home');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      loadItemData();
    }
  }, [isEditing, itemId, user, navigate]);

  const handleInputChange = (field: string, value: string) => {
    console.log(`🔍 Field ${field} changed to:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset subcategory if category changes
    if (field === 'category') {
      setFormData(prev => ({ ...prev, subcategory: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📸 File input triggered');
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files);
      console.log('📸 Files selected:', newImages.length, newImages.map(f => f.name));
      setImages(prev => {
        const updated = [...prev, ...newImages];
        console.log('📸 Total images after upload:', updated.length);
        return updated;
      });
    } else {
      console.log('❌ No files selected');
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
    console.log('🗑️ Image removed at index:', indexToRemove);
  };

  const handleImageClick = () => {
    console.log('🖱️ Upload area clicked');
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
      console.log('🖱️ File input triggered');
    } else {
      console.error('❌ File input not found');
    }
  };

  const handleArrayToggle = (field: string, value: string) => {
    setFormData(prev => {
      const currentArray = prev[field as keyof typeof prev] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      // If removing a category, also remove its subcategories
      if (field === 'lookingForCategories' && currentArray.includes(value)) {
        const newSubcategories = { ...prev.lookingForSubcategories };
        delete newSubcategories[value];
        return { ...prev, [field]: newArray, lookingForSubcategories: newSubcategories };
      }
      
      return { ...prev, [field]: newArray };
    });
    console.log(`🔍 Array field ${field} toggled:`, value);
  };

  const handleSubcategoryToggle = (category: string, subcategory: string) => {
    setFormData(prev => {
      const currentSubs = prev.lookingForSubcategories[category] || [];
      const newSubs = currentSubs.includes(subcategory)
        ? currentSubs.filter(sub => sub !== subcategory)
        : [...currentSubs, subcategory];
      
      return {
        ...prev,
        lookingForSubcategories: {
          ...prev.lookingForSubcategories,
          [category]: newSubs
        }
      };
    });
    console.log(`🔍 Subcategory ${subcategory} toggled for ${category}`);
  };

  const removeExistingImage = (urlToRemove: string) => {
    setExistingImageUrls(prev => prev.filter(url => url !== urlToRemove));
    console.log('🗑️ Existing image removed:', urlToRemove);
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadPromises = images.map(async (image, index) => {
      const fileExt = image.name.split('.').pop();
      const fileName = `${user!.id}/${Date.now()}_${index}.${fileExt}`;
      
      console.log('📸 Uploading image:', fileName);
      const { data, error } = await supabase.storage
        .from('item-images')
        .upload(fileName, image);
      
      if (error) {
        console.error('❌ Upload error:', error);
        throw new Error(`Failed to upload ${image.name}: ${error.message}`);
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('item-images')
        .getPublicUrl(fileName);
      
      console.log('✅ Image uploaded:', urlData.publicUrl);
      return urlData.publicUrl;
    });
    
    return Promise.all(uploadPromises);
  };

  const handleSubmit = async () => {
    console.log(isEditing ? '✏️ EDIT CLICKED!' : '🚀 SUBMIT CLICKED!');
    console.log('📋 Form Data:', formData);
    console.log('📸 New Images:', images.length);
    console.log('🖼️ Existing Images:', existingImageUrls.length);
    
    // Validation
    const requiredFields = ['title', 'description', 'category', 'condition', 'priceRange'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      console.log('❌ Missing fields:', missingFields);
      toast.error(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }
    
    // For editing, images are optional if there are existing ones
    if (!isEditing && images.length === 0) {
      console.log('❌ No images');
      toast.error('Please add at least one image');
      return;
    }
    
    if (isEditing && images.length === 0 && existingImageUrls.length === 0) {
      console.log('❌ No images in edit mode');
      toast.error('Please add at least one image');
      return;
    }

    // Note: Looking for categories and description are now optional

    console.log('✅ Validation passed, submitting...');
    setIsSubmitting(true);
    
    try {
      // Upload new images if any
      let newImageUrls: string[] = [];
      if (images.length > 0) {
        console.log('📸 Uploading new images...');
        newImageUrls = await uploadImages();
        console.log('✅ New images uploaded:', newImageUrls);
      }
      
      // Combine existing and new image URLs
      const allImageUrls = [...existingImageUrls, ...newImageUrls];
      
      // Parse price range
      const [minPrice, maxPrice] = formData.priceRange.split('-').map(p => parseFloat(p.trim()));
      
      // Flatten subcategories for tags
      const subcategoryTags = Object.values(formData.lookingForSubcategories).flat();
      const allTags = formData.subcategory ? [formData.subcategory, ...subcategoryTags] : subcategoryTags;
      
      
      console.log('💾 SUBMISSION DEBUG: Form data before save:');
      console.log('🔍 lookingForDescription:', formData.lookingForDescription);
      console.log('🔍 lookingForCategories:', formData.lookingForCategories);
      console.log('🔍 lookingForConditions:', formData.lookingForConditions);
      console.log('🔍 lookingForPriceRanges:', formData.lookingForPriceRanges);
      console.log('🔍 lookingForSubcategories:', formData.lookingForSubcategories);
      const lookingForPriceRanges = formData.lookingForPriceRanges.map(range => range.replace('$', ''));
      
      // Prepare item data
      const itemData = {
        user_id: user!.id,
        name: formData.title,
        description: formData.description,
        image_urls: allImageUrls,
        category: formData.category,
        condition: formData.condition,
        tags: allTags,
        price_range_min: minPrice,
        price_range_max: maxPrice,
        looking_for_description: formData.lookingForDescription,
        looking_for_categories: formData.lookingForCategories,
        looking_for_conditions: formData.lookingForConditions,
        looking_for_price_ranges: lookingForPriceRanges,
        status: 'published',
        is_available: true,
        is_hidden: false,
        updated_at: new Date().toISOString()
      };
      
      console.log('💾 Saving to database:', itemData);
      
      if (isEditing) {
        // Update existing item
        const { data, error } = await supabase
          .from('items')
          .update(itemData)
          .eq('id', itemId)
          .eq('user_id', user!.id)
          .select()
          .single();
        
        if (error) {
          console.error('❌ Update error:', error);
          throw new Error(`Failed to update item: ${error.message}`);
        }
        
        console.log('✅ Item updated successfully:', data);
        toast.success('Item updated successfully!');
      } else {
        // Insert new item
        const { data, error } = await supabase
          .from('items')
          .insert(itemData)
          .select()
          .single();
        
        if (error) {
          console.error('❌ Insert error:', error);
          throw new Error(`Failed to save item: ${error.message}`);
        }
        
        console.log('✅ Item created successfully:', data);
        toast.success('Item posted successfully!');
      }
      navigate('/home');
      
    } catch (error) {
      console.error('❌ Submission error:', error);
      toast.error(error instanceof Error ? error.message : `Failed to ${isEditing ? 'update' : 'post'} item. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return <div>Please log in to {isEditing ? 'edit' : 'post'} an item.</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading item data...</p>
        </div>
      </div>
    );
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
              {isEditing ? 'Edit Your Item' : 'What You\'re Offering'}
            </CardTitle>
            <p className="text-muted-foreground mt-2">{isEditing ? 'Update your item details' : 'Tell us about the item you want to trade'}</p>
            <div className="text-xs text-muted-foreground mt-1">
              Please review our <Link to="/posting-rules" className="underline underline-offset-2">Posting Rules</Link> before posting.
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Images */}
            <div className="space-y-2">
              <Label>Images * ({images.length} uploaded)</Label>
              <div 
                className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 cursor-pointer transition-colors"
                onClick={handleImageClick}
              >
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <div className="text-sm text-muted-foreground hover:text-foreground">
                  Click to upload images or drag and drop
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, GIF up to 10MB each
                </div>
              </div>
              
              {/* Existing Images Display */}
              {existingImageUrls.length > 0 && (
                <div className="space-y-2">
                  <Label>Current Images ({existingImageUrls.length})</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {existingImageUrls.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={url}
                          alt={`Current ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(url)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* New Images Display */}
              {images.length > 0 && (
                <div className="space-y-2">
                  <Label>New Images ({images.length})</Label>
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
              <Label htmlFor="description">Description * (include what you want in trade)</Label>
              <Textarea
                id="description"
                placeholder="Describe your item, its condition, and what you're looking to trade for."
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

              {/* Looking For Categories */}
              <div className="space-y-2">
                <Label>Categories you're interested in</Label>
                <div className="space-y-3">
                  {Object.keys(categories).map((cat) => (
                    <div key={cat} className="space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.lookingForCategories.includes(cat)}
                          onChange={() => handleArrayToggle('lookingForCategories', cat)}
                          className="rounded"
                        />
                        <span className="text-sm font-medium">{cat}</span>
                      </label>
                      
                      {/* Subcategories - Show when category is selected */}
                      {formData.lookingForCategories.includes(cat) && (
                        <div className="ml-6 grid grid-cols-1 gap-1 bg-muted/30 p-3 rounded-lg">
                          {categories[cat as keyof typeof categories].map((subcat) => (
                            <label key={subcat} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.lookingForSubcategories[cat]?.includes(subcat) || false}
                                onChange={() => handleSubcategoryToggle(cat, subcat)}
                                className="rounded text-xs"
                              />
                              <span className="text-xs text-muted-foreground">{subcat}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
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
            {isSubmitting ? (isEditing ? 'Updating...' : 'Posting...') : (isEditing ? 'Update Item' : 'Post Item')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PostItemNew;