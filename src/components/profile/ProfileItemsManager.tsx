
import React, { useState } from 'react';
import { Item } from '@/types/item';
import ItemsForTradeTab from '@/components/profile/ItemsForTradeTab';
import ItemEditDialog from '@/components/items/ItemEditDialog';
import { toast } from '@/hooks/use-toast';

interface ProfileItemsManagerProps {
  initialItems: Item[];
}

const ProfileItemsManager: React.FC<ProfileItemsManagerProps> = ({ initialItems }) => {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Function to handle clicking on an item to edit
  const handleItemClick = (item: Item) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  // Function to save edited item
  const handleSaveItem = (updatedItem: Item) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      )
    );
    toast({
      title: "Item updated",
      description: `${updatedItem.name} has been updated successfully.`
    });
  };

  return (
    <>
      <ItemsForTradeTab items={items} onItemClick={handleItemClick} />
      
      {/* Item Edit Dialog */}
      <ItemEditDialog
        item={editingItem}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveItem}
      />
    </>
  );
};

export default ProfileItemsManager;
