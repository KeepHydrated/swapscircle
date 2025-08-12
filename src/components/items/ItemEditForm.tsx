
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
  lookingForCategories: string[];
  setLookingForCategories: (categories: string[]) => void;
  lookingForConditions: string[];
  setLookingForConditions: (conditions: string[]) => void;
  lookingForDescription: string;
  setLookingForDescription: (description: string) => void;
  handleImageSelect: () => void;
  categoryOptions: string[];
  conditionOptions: string[];
  priceRangeOptions: string[];
  lookingForPriceRanges: string[];
  setLookingForPriceRanges: (ranges: string[]) => void;
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
  lookingForCategories,
  setLookingForCategories,
  lookingForConditions,
  setLookingForConditions,
  lookingForDescription,
  setLookingForDescription,
  handleImageSelect,
  categoryOptions,
  conditionOptions,
  priceRangeOptions,
  lookingForPriceRanges,
  setLookingForPriceRanges,
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

      {/* What You're Looking For Section */}
      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">What You're Looking For</h3>
        
        {/* Looking For Description */}
        <div className="space-y-2 mb-4">
          <Label htmlFor="lookingForDescription" className="text-sm font-medium">
            I'm looking for... <span className="text-red-500">*</span>
          </Label>
          <Textarea 
            id="lookingForDescription" 
            value={lookingForDescription} 
            onChange={(e) => setLookingForDescription(e.target.value)}
            placeholder="Describe what you would like to trade for..." 
            className="min-h-[80px]"
          />
        </div>

        {/* Looking For Categories */}
        <div className="space-y-3 mb-4">
          <Label className="text-sm font-medium">
            Categories <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {categoryOptions.map((cat) => (
              <div key={cat} className="flex items-center space-x-2">
                <Checkbox
                  id={`looking-category-${cat}`}
                  checked={lookingForCategories.includes(cat)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setLookingForCategories([...lookingForCategories, cat]);
                    } else {
                      setLookingForCategories(lookingForCategories.filter(c => c !== cat));
                    }
                  }}
                />
                <Label htmlFor={`looking-category-${cat}`} className="text-sm">
                  {cat}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Looking For Conditions */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Condition <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {conditionOptions.map((cond) => (
              <div key={cond} className="flex items-center space-x-2">
                <Checkbox
                  id={`looking-condition-${cond}`}
                  checked={lookingForConditions.includes(cond)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setLookingForConditions([...lookingForConditions, cond]);
                    } else {
                      setLookingForConditions(lookingForConditions.filter(c => c !== cond));
                    }
                  }}
                />
                <Label htmlFor={`looking-condition-${cond}`} className="text-sm">
                  {cond}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Looking For Price Range */}
        <div className="space-y-3 mt-4">
          <Label className="text-sm font-medium">
            Price Range <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {priceRangeOptions.map((range) => (
              <div key={range} className="flex items-center space-x-2">
                <Checkbox
                  id={`looking-price-${range}`}
                  checked={lookingForPriceRanges.includes(range)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setLookingForPriceRanges([...lookingForPriceRanges, range]);
                    } else {
                      setLookingForPriceRanges(lookingForPriceRanges.filter(r => r !== range));
                    }
                  }}
                />
                <Label htmlFor={`looking-price-${range}`} className="text-sm">
                  {range}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemEditForm;
