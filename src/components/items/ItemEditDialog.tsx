
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Item } from '@/types/item';
import { toast } from '@/hooks/use-toast';
import ItemEditForm from './ItemEditForm';

interface ItemEditDialogProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedItem: Item) => void;
}

const conditionOptions = ["New", "Excellent", "Good", "Fair", "Poor", "For parts"];
const categoryOptions = ["Electronics", "Clothing", "Sports", "Gaming", "Music", "Books", "Collectibles", "Photography", "Art", "Vehicles", "Other"];
const priceRangeOptions = ["0-25", "25-50", "50-100", "100-200", "200-500", "500+"];

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
          <ItemEditForm
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            image={image}
            category={category}
            setCategory={setCategory}
            condition={condition}
            setCondition={setCondition}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            handleImageSelect={handleImageSelect}
            categoryOptions={categoryOptions}
            conditionOptions={conditionOptions}
            priceRangeOptions={priceRangeOptions}
          />
          
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
