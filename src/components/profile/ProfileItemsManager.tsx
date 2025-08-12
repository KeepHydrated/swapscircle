
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Item } from '@/types/item';
import ItemsForTradeTab from '@/components/profile/ItemsForTradeTab';
import ExploreItemModal from '@/components/items/ExploreItemModal';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
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
  userProfile?: {
    id: string;
    name: string;
    avatar_url: string;
    bio: string;
    location: string;
    created_at: string;
  };
}

const ProfileItemsManager: React.FC<ProfileItemsManagerProps> = ({ initialItems, onItemClick, userProfile }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [items, setItems] = useState<Item[]>(initialItems);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  // Update items when initialItems changes
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  // Function to handle clicking on an item - open modal instead of navigation
  const handleItemClick = (item: Item) => {
    // Disable popup on mobile
    if (isMobile) {
      return;
    }
    
    // If onItemClick prop is provided, call it with the item id
    if (onItemClick) {
      onItemClick(item.id);
    } else {
      // Find the index of the clicked item
      const itemIndex = items.findIndex(i => i.id === item.id);
      setCurrentItemIndex(itemIndex);
      setSelectedItem(item);
      setIsItemModalOpen(true);
    }
  };

  // Navigation functions
  const handleNavigatePrev = () => {
    if (currentItemIndex > 0) {
      const newIndex = currentItemIndex - 1;
      setCurrentItemIndex(newIndex);
      setSelectedItem(items[newIndex]);
    }
  };

  const handleNavigateNext = () => {
    if (currentItemIndex < items.length - 1) {
      const newIndex = currentItemIndex + 1;
      setCurrentItemIndex(newIndex);
      setSelectedItem(items[newIndex]);
    }
  };

  // Edit button: go to edit-item/:id
  const handleEditClick = (item: Item) => {
    navigate(`/edit-item/${item.id}`);
  };

  // Function to handle copy icon click
  const handleCopyClick = async (item: Item) => {
    try {
      console.log('🔄 ORIGINAL ITEM DATA FOR DUPLICATION:', item);
      console.log('🔄 FULL ORIGINAL ITEM JSON:', JSON.stringify(item, null, 2));
      console.log('🔄 ALL ORIGINAL ITEM FIELDS:', Object.keys(item));
      console.log('🔄 FIELD CHECK - looking_for_categories:', item.looking_for_categories);
      console.log('🔄 FIELD CHECK - lookingForCategories:', item.lookingForCategories);
      console.log('🔄 FIELD CHECK - looking_for_conditions:', item.looking_for_conditions);
      console.log('🔄 FIELD CHECK - lookingForConditions:', item.lookingForConditions);
      console.log('🔄 FIELD CHECK - looking_for_description:', item.looking_for_description);
      console.log('🔄 FIELD CHECK - lookingForDescription:', item.lookingForDescription);
      
      // Check if the original item has any "looking for" data at all
      const hasLookingForData = Boolean(
        (item.looking_for_categories && item.looking_for_categories.length > 0) ||
        (item.looking_for_conditions && item.looking_for_conditions.length > 0) ||
        (item.looking_for_description && item.looking_for_description.trim().length > 0) ||
        (item.lookingForCategories && item.lookingForCategories.length > 0) ||
        (item.lookingForConditions && item.lookingForConditions.length > 0) ||
        (item.lookingForDescription && item.lookingForDescription.trim().length > 0)
      );
      console.log('🔄 ORIGINAL HAS LOOKING FOR DATA:', hasLookingForData);
      // Create the duplicated item data
      console.log('🔄 CREATING DUPLICATE WITH DATA:', {
        looking_for_categories: item.looking_for_categories,
        looking_for_conditions: item.looking_for_conditions,
        looking_for_description: item.looking_for_description
      });
      const duplicatedItemData = {
        name: `${item.name} (Copy)`,
        description: item.description || '',
        image_url: item.image || item.image_url,
        image_urls: item.image_urls || (item.image ? [item.image] : []),
        category: item.category || '',
        condition: item.condition || '',
        tags: (item as any).tags || [],
        looking_for_categories: item.lookingForCategories || item.looking_for_categories || [],
        looking_for_conditions: item.lookingForConditions || item.looking_for_conditions || [],
        looking_for_description: item.lookingForDescription || item.looking_for_description || '',
        looking_for_price_ranges: item.lookingForPriceRanges || item.looking_for_price_ranges || [],
        price_range_min: item.priceRangeMin || (item as any).price_range_min,
        price_range_max: item.priceRangeMax || (item as any).price_range_max,
      };

      // Import createItem function dynamically
      const { createItem } = await import('@/services/authService');
      
      console.log('🔄 DUPLICATING ITEM:', { duplicatedItemData, isDraft: true });
      // Save the duplicated item to the database as a draft
      const newItemId = await createItem(duplicatedItemData, true); // true = isDraft
      console.log('🔄 DUPLICATION RESULT:', { newItemId });
      
      if (newItemId) {
        // Create the local item object for immediate UI update
        const newItem = {
          ...item,
          id: newItemId,
          name: `${item.name} (Copy)`,
          status: 'draft' as const,
          has_been_edited: false,
          // Include the "What You're Looking For" fields that were sent to the database
          looking_for_categories: duplicatedItemData.looking_for_categories,
          looking_for_conditions: duplicatedItemData.looking_for_conditions,
          looking_for_description: duplicatedItemData.looking_for_description,
          looking_for_price_ranges: duplicatedItemData.looking_for_price_ranges,
          lookingForCategories: duplicatedItemData.looking_for_categories,
          lookingForConditions: duplicatedItemData.looking_for_conditions,
          lookingForDescription: duplicatedItemData.looking_for_description,
          lookingForPriceRanges: duplicatedItemData.looking_for_price_ranges,
        };
        
        console.log('🔄 ADDING DUPLICATED ITEM TO LOCAL STATE:', newItem);
        setItems(prevItems => [newItem, ...prevItems]);
        toast.success(`${item.name} has been duplicated as a draft. Edit it to publish.`);
      } else {
        toast.error("You've reached your draft limit");
      }
    } catch (error) {
      console.error('Error duplicating item:', error);
      toast.error("You've reached your draft limit");
    }
  };

  // Function to handle publishing a draft item
  const handlePublishClick = async (item: Item) => {
    // Check if this is a draft item that hasn't been edited
    if (item.status === 'draft' && !(item as any).has_been_edited) {
      toast.error('You must edit this item before publishing it.');
      return;
    }

    try {
      // Import updateItem function dynamically
      const { updateItem } = await import('@/services/authService');
      
      // Only update the status, don't mark as edited since this is just a publish action
      const result = await updateItem(item.id, { status: 'published' });
      
      if (result) {
        // Update the local state
        setItems(prevItems => 
          prevItems.map(i => 
            i.id === item.id 
              ? { ...i, status: 'published' as const }
              : i
          )
        );
        toast.success(`${item.name} has been published!`);
      } else {
        toast.error('Failed to publish item');
      }
    } catch (error) {
      console.error('Error publishing item:', error);
      toast.error('Failed to publish item');
    }
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
          onPublishClick={handlePublishClick}
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
          onNavigatePrev={handleNavigatePrev}
          onNavigateNext={handleNavigateNext}
          currentIndex={currentItemIndex}
          totalItems={items.length}
          disableActions={true} // Show buttons but disable them for own items
          userProfile={userProfile ? {
            name: userProfile.name,
            avatar_url: userProfile.avatar_url,
            username: userProfile.name,
            created_at: userProfile.created_at
          } : undefined}
        />
      )}
    </>
  );
};

export default ProfileItemsManager;
