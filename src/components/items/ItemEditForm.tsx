
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import SelectField from '@/components/ui/select-field';
import ItemEditImage from './ItemEditImage';

interface ItemEditFormProps {
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  image: string;
  category: string;
  setCategory: (category: string) => void;
  condition: string;
  setCondition: (condition: string) => void;
  priceRange: string;
  setPriceRange: (priceRange: string) => void;
  handleImageSelect: () => void;
  categoryOptions: string[];
  conditionOptions: string[];
  priceRangeOptions: string[];
}

const ItemEditForm: React.FC<ItemEditFormProps> = ({
  name,
  setName,
  description,
  setDescription,
  image,
  category,
  setCategory,
  condition,
  setCondition,
  priceRange,
  setPriceRange,
  handleImageSelect,
  categoryOptions,
  conditionOptions,
  priceRangeOptions,
}) => {
  return (
    <div className="space-y-4">
      {/* Image Preview */}
      <ItemEditImage 
        image={image}
        name={name}
        onImageSelect={handleImageSelect}
      />
      
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
        <SelectField
          id="category"
          label="Category"
          value={category}
          onChange={setCategory}
          options={categoryOptions}
          placeholder="Select a category"
        />
        
        {/* Condition */}
        <SelectField
          id="condition"
          label="Condition"
          value={condition}
          onChange={setCondition}
          options={conditionOptions}
          placeholder="Select condition"
        />
      </div>
      
      {/* Price Range */}
      <SelectField
        id="priceRange"
        label="Price Range"
        value={priceRange}
        onChange={setPriceRange}
        options={priceRangeOptions}
        placeholder="Select price range"
      />
    </div>
  );
};

export default ItemEditForm;
