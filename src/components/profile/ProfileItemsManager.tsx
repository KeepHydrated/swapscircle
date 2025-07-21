
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Item } from '@/types/item';
import ItemsForTradeTab from '@/components/profile/ItemsForTradeTab';
import ExploreItemModal from '@/components/items/ExploreItemModal';
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
import { deleteItem, hideItem, unhideItem } from '@/services/authService';

interface ProfileItemsManagerProps {
  initialItems: Item[];
  onItemClick?: (itemId: string) => void;
}

const ProfileItemsManager: React.FC<ProfileItemsManagerProps> = ({ initialItems, onItemClick }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>(initialItems);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  // Update items when initialItems changes
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  // Function to handle clicking on an item - open modal instead of navigation
  const handleItemClick = (item: Item) => {
    // If onItemClick prop is provided, call it with the item id
    if (onItemClick) {
      onItemClick(item.id);
    } else {
      // Open the item modal
      setSelectedItem(item);
      setIsItemModalOpen(true);
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
    
    setItems(prevItems => [newItem, ...prevItems]);
    
    toast.success(`${item.name} has been duplicated`);
  };

  // Function to handle delete icon click
  const handleDeleteClick = (item: Item) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  // Function to handle hide/unhide toggle
  const handleHideClick = async (item: Item) => {
    const isHidden = (item as any).is_hidden;
    const success = isHidden ? await unhideItem(item.id) : await hideItem(item.id);
    
    if (success) {
      // Update the item in the list with the new hidden state
      setItems(prevItems => prevItems.map(prevItem => 
        prevItem.id === item.id 
          ? { ...prevItem, is_hidden: !isHidden } as Item
          : prevItem
      ));
    }
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
        onHideClick={handleHideClick}
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

      {/* Item Details Modal */}
      {selectedItem && (
        <ExploreItemModal
          open={isItemModalOpen}
          item={selectedItem}
          onClose={() => {
            setIsItemModalOpen(false);
            setSelectedItem(null);
          }}
          hideActions={true} // Hide X and heart buttons for own items
        />
      )}
    </>
  );
};

export default ProfileItemsManager;
