
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
import { ChevronDown, Image, Pencil } from 'lucide-react';

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
  const [image, setImage] = useState(item?.image || '');
  const [category, setCategory] = useState(item?.category || '');
  const [condition, setCondition] = useState(item?.condition || '');
  const [priceRange, setPriceRange] = useState(item?.priceRange || '');

  // Reset form when item changes
  React.useEffect(() => {
    if (item) {
      setName(item.name);
      setDescription(item.description || '');
      setImage(item.image);
      setCategory(item.category || '');
      setCondition(item.condition || '');
      setPriceRange(item.priceRange || '');
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !image.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a name and an image for your item",
        variant: "destructive",
      });
      return;
    }

    if (!item) return;
    
    const updatedItem: Item = {
      ...item,
      name,
      description,
      image,
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Item</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Preview */}
          <div className="relative rounded-md overflow-hidden aspect-square bg-gray-100">
            <img 
              src={image} 
              alt={name} 
              className="w-full h-full object-cover"
            />
            <Button 
              type="button" 
              variant="secondary" 
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 bg-white/80 hover:bg-white"
              onClick={handleImageSelect}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Item name"
              className="w-full"
              required
            />
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your item..." 
              className="min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">Category</Label>
              <div className="relative">
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm appearance-none pr-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select a category</option>
                  {categoryOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            {/* Condition */}
            <div className="space-y-2">
              <Label htmlFor="condition" className="text-sm font-medium">Condition</Label>
              <div className="relative">
                <select
                  id="condition"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm appearance-none pr-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select condition</option>
                  {conditionOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
          
          {/* Price Range */}
          <div className="space-y-2">
            <Label htmlFor="priceRange" className="text-sm font-medium">Price Range</Label>
            <div className="relative">
              <select
                id="priceRange"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm appearance-none pr-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select price range</option>
                {priceRangeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
