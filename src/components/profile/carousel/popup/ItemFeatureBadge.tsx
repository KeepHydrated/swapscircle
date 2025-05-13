
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ItemFeatureBadgeProps {
  icon: LucideIcon;
  text: string;
  bgColor: string;
  iconColor: string;
}

const ItemFeatureBadge: React.FC<ItemFeatureBadgeProps> = ({ 
  icon: Icon, 
  text, 
  bgColor, 
  iconColor 
}) => {
  return (
    <div className="flex items-center">
      <div className={`w-5 h-5 rounded-full ${bgColor} flex items-center justify-center mr-1.5`}>
        <Icon className={`w-2.5 h-2.5 ${iconColor}`} />
      </div>
      <span className="text-gray-800 text-xs">{text}</span>
    </div>
  );
};

export default ItemFeatureBadge;
