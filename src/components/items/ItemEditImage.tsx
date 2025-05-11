
import React from 'react';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';

interface ItemEditImageProps {
  image: string;
  name: string;
  onImageSelect: () => void;
  className?: string;
}

const ItemEditImage: React.FC<ItemEditImageProps> = ({ 
  image, 
  name,
  onImageSelect,
  className = ""
}) => {
  return (
    <div className={`relative rounded-md overflow-hidden aspect-square bg-gray-100 ${className}`}>
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
        onClick={onImageSelect}
      >
        <Pencil className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ItemEditImage;
