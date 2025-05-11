
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
import { Item } from '@/types/item';
import { toast } from '@/hooks/use-toast';

interface ItemEditDialogProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedItem: Item) => void;
}

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
        description: "Please provide a name and image URL for your item",
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

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter item name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter item description" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image">Image URL</Label>
            <Input 
              id="image" 
              value={image} 
              onChange={(e) => setImage(e.target.value)}
              placeholder="Enter image URL"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input 
              id="category" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Enter category"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="condition">Condition</Label>
            <Input 
              id="condition" 
              value={condition} 
              onChange={(e) => setCondition(e.target.value)}
              placeholder="Excellent, Good, Fair, etc."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="priceRange">Price Range</Label>
            <Input 
              id="priceRange" 
              value={priceRange} 
              onChange={(e) => setPriceRange(e.target.value)}
              placeholder="$50-$100"
            />
          </div>
          
          <div className="mt-4 flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ItemEditDialog;
