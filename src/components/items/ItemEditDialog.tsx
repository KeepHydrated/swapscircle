
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Item } from '@/types/item';
import { toast } from '@/hooks/use-toast';
import { ChevronDown } from 'lucide-react';

interface ItemEditDialogProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedItem: Item) => void;
}

const conditionOptions = ["New", "Excellent", "Good", "Fair", "Poor", "For parts"];
const categoryOptions = ["Electronics", "Clothing", "Sports", "Gaming", "Music", "Books", "Collectibles", "Photography", "Art", "Vehicles", "Other"];
const priceRangeOptions = ["$0-$25", "$25-$50", "$50-$100", "$100-$200", "$200-$500", "$500+"];

const ItemEditDialog: React.FC<ItemEditDialogProps> = ({
  item,
  isOpen,
  onClose,
  onSave
}) => {
  const [name, setName] = useState(item?.name || '');
  const [description, setDescription] = useState(item?.description || '');
  const [images, setImages] = useState<string[]>([item?.image || '']);
  const [category, setCategory] = useState(item?.category || '');
  const [condition, setCondition] = useState(item?.condition || '');
  const [priceRange, setPriceRange] = useState(item?.priceRange || '');

  // Reset form when item changes
  React.useEffect(() => {
    if (item) {
      setName(item.name);
      setDescription(item.description || '');
      setImages([item.image]);
      setCategory(item.category || '');
      setCondition(item.condition || '');
      setPriceRange(item.priceRange || '');
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || images.length === 0 || !images[0].trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a name and at least one image for your item",
        variant: "destructive",
      });
      return;
    }

    if (!item) return;
    
    const updatedItem: Item = {
      ...item,
      name,
      description,
      image: images[0], // Currently only supporting one image
      category,
      condition,
      priceRange,
    };
    
    onSave(updatedItem);
    toast({
      title: "Success!",
      description: "Your item has been updated",
    });
    onClose();
  };

  // Placeholder for image upload functionality
  const handleImageSelect = () => {
    // In a real app, this would open a file picker
    console.log('Image select clicked');
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Item</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images Section */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Add Images</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="flex justify-center mb-2">
                <img 
                  src="/lovable-uploads/6de02767-04e3-4b51-93af-053033a1c111.png" 
                  alt="Upload icon" 
                  className="w-16 h-16 opacity-50" 
                />
              </div>
              <p className="text-gray-500 mb-2">Upload up to 5 images</p>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleImageSelect}
                className="w-full sm:w-auto"
              >
                Select Images
              </Button>
            </div>
          </div>
          
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-medium">Title</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="What are you offering for rent?"
              className="w-full"
              required
            />
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-medium">Description</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your rental item in detail..." 
              className="min-h-[120px]"
            />
          </div>
          
          {/* Condition */}
          <div className="space-y-2">
            <Label htmlFor="condition" className="text-base font-medium">Condition</Label>
            <div className="relative">
              <select
                id="condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-base appearance-none pr-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
              >
                <option value="">Select condition</option>
                {conditionOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-base font-medium">Category</Label>
            <div className="relative">
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-base appearance-none pr-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
              >
                <option value="">Select a category</option>
                {categoryOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          {/* Price Range */}
          <div className="space-y-2">
            <Label htmlFor="priceRange" className="text-base font-medium">Price Range</Label>
            <div className="relative">
              <select
                id="priceRange"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-base appearance-none pr-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
              >
                <option value="">Select price range</option>
                {priceRangeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          {/* Dialog Footer */}
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} className="mr-2">
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ItemEditDialog;
