import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Item } from '@/types/item';
import ItemsForTradeTab from '@/components/profile/ItemsForTradeTab';
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
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>(initialItems);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Function to handle clicking on an item - navigate to item details page
  const handleItemClick = (item: Item) => {
    // If onItemClick prop is provided, call it with the item id
    if (onItemClick) {
      onItemClick(item.id);
    } else {
      // Navigate to item details page (you may need to adjust this route)
      navigate(`/item/${item.id}`);
    }
  };

  // Edit button: go to edit-item/:id
  const handleEditClick = (item: Item) => {
    navigate(`/edit-item/${item.id}`);
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

  // Delete item from DB
  const confirmDelete = async () => {
    if (itemToDelete) {
      const ok = await deleteItem(itemToDelete.id);
      if (ok) {
        setItems(prevItems => prevItems.filter(item => item.id !== itemToDelete.id));
      }
      setItemToDelete(null);
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <ItemsForTradeTab 
        items={items} 
        onItemClick={handleItemClick} 
        onEditClick={handleEditClick}
        onCopyClick={handleCopyClick}
        onDeleteClick={handleDeleteClick}
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
