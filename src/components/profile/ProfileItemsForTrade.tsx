
import React from 'react';
import { Card } from '@/components/ui/card';
import ItemDetails from '@/components/messages/details/ItemDetails';
import { Item } from '@/types/item';

interface ProfileItemsForTradeProps {
  items: Item[];
  onItemClick: (item: Item) => void;
  selectedItem: Item | null;
}

const ProfileItemsForTrade: React.FC<ProfileItemsForTradeProps> = ({ 
  items, 
  onItemClick, 
  selectedItem 
}) => {
  // Function to get the index of the selected item
  const getSelectedItemIndex = () => {
    if (!selectedItem) return -1;
    return items.findIndex(item => item.id === selectedItem.id);
  };
  
  // Find the column and row for the selected item
  const selectedItemIndex = getSelectedItemIndex();
  
  // Calculate columns based on screen size (this should match the grid-cols in the container)
  const getColumnCount = () => {
    // Check if window is available (for SSR compatibility)
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width >= 1280) return 4; // xl:grid-cols-4
      if (width >= 1024) return 3; // lg:grid-cols-3
      if (width >= 640) return 2;  // sm:grid-cols-2
      return 1; // default for mobile
    }
    return 2; // Default fallback
  };
  
  const columnCount = getColumnCount();
  
  // Calculate the row and column of the selected item
  const getRowAndColumn = (index: number) => {
    const row = Math.floor(index / columnCount);
    const col = index % columnCount;
    return { row, col };
  };
  
  // Get position of selected item
  const selectedPosition = selectedItemIndex >= 0 ? getRowAndColumn(selectedItemIndex) : null;
  
  // Determine items that should be rendered with details dropdown
  const renderItems = () => {
    return items.map((item, index) => {
      const { row, col } = getRowAndColumn(index);
      const isSelected = selectedItem?.id === item.id;
      
      // Determine if this item should have dropdown below it
      const showDropdown = isSelected;

      // Calculate if this is an odd or even item (0-indexed, so item 1 is actually index 0)
      // For even indices (0, 2, 4...), dropdown aligns with item
      // For odd indices (1, 3, 5...), dropdown appears to the left
      const isEvenItem = index % 2 === 0;
      
      return (
        <React.Fragment key={item.id}>
          <div className="flex flex-col">
            <Card 
              className={`overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${
                isSelected ? 'ring-2 ring-primary shadow-md' : ''
              }`}
              onClick={() => onItemClick(item)}
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-800">{item.name}</h3>
              </div>
            </Card>
          </div>
          
          {/* Insert dropdown after the item */}
          {showDropdown && (
            <div 
              className="col-span-2 mt-2 mb-4 z-10"
              style={{
                gridColumn: !isEvenItem 
                  ? `${col - 1 >= 0 ? col - 1 + 1 : col + 1} / span 2` 
                  : `${col + 1} / span 2`
              }}
            >
              <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <ItemDetails name={selectedItem.name} showProfileInfo={false} />
              </div>
            </div>
          )}
        </React.Fragment>
      );
    });
  };
  
  return (
    <div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      style={{ 
        gridAutoFlow: 'dense' // Ensures items flow naturally around the dropdown
      }}
    >
      {renderItems()}
    </div>
  );
};

export default ProfileItemsForTrade;
