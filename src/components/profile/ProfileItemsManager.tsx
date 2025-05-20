import React, { useState } from 'react';
import { Item } from '@/types/item';
import ItemsForTradeTab from '@/components/profile/ItemsForTradeTab';
import ItemEditDialog from '@/components/items/ItemEditDialog';
import { toast } from 'sonner';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface ProfileItemsManagerProps {
  initialItems: Item[];
  onItemClick?: (itemId: string) => void;
}

const ProfileItemsManager: React.FC<ProfileItemsManagerProps> = ({ initialItems, onItemClick }) => {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Function to handle clicking on an item to edit
  const handleItemClick = (item: Item) => {
    // If onItemClick prop is provided, call it with the item id
    if (onItemClick) {
      onItemClick(item.id);
    } else {
      // Otherwise, use the original behavior
      setEditingItem(item);
      setIsEditDialogOpen(true);
    }
  };

  // Function to handle edit icon click
  const handleEditClick = (item: Item) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  // Function to handle copy icon click
  const handleCopyClick = (item: Item) => {
    const newItem = {
      ...item,
      id: `copy-${Date.now()}-${item.id}`,
      name: `${item.name} (Copy)`
    };
    
    setItems(prevItems => [...prevItems, newItem]);
    
    toast.success(`${item.name} has been duplicated`);
  };

  // Function to handle delete icon click
  const handleDeleteClick = (item: Item) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  // Function to confirm deletion
  const confirmDelete = () => {
    if (itemToDelete) {
      setItems(prevItems => 
        prevItems.filter(item => item.id !== itemToDelete.id)
      );
      toast.success(`${itemToDelete.name} has been deleted`);
      setItemToDelete(null);
    }
    setIsDeleteDialogOpen(false);
  };

  // Function to save edited item
  const handleSaveItem = (updatedItem: Item) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      )
    );
    toast.success(`${updatedItem.name} has been updated successfully.`);
  };

  // Custom version of ItemsForTradeTab that catches action clicks
  const customItemClick = (item: Item) => {
    handleItemClick(item);
  };

  return (
    <>
      <ItemsForTradeTab 
        items={items} 
        onItemClick={customItemClick} 
        onEditClick={handleEditClick}
        onCopyClick={handleCopyClick}
        onDeleteClick={handleDeleteClick}
      />
      
      {/* Item Edit Dialog */}
      <ItemEditDialog
        item={editingItem}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveItem}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your item
              {itemToDelete && <strong> "{itemToDelete.name}"</strong>}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProfileItemsManager;
