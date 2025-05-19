import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ProfileHeader from '@/components/profile/ProfileHeader';
import { Star, Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MatchItem } from '@/types/item';
import ItemDetailsPopup from '@/components/profile/carousel/ItemDetailsPopup';
import ProfileItemsManager from '@/components/profile/ProfileItemsManager';
import ItemEditDialog from '@/components/items/ItemEditDialog';
import { toast } from 'sonner';
import CompletedTradesTab from '@/components/profile/CompletedTradesTab';
import ReviewsTab from '@/components/profile/ReviewsTab';
import FriendsTab from '@/components/profile/FriendsTab';

// Import mock data
import { mockProfileData } from '@/data/mockProfileData';
import { myAvailableItems } from '@/data/mockMyItems';
import { myCompletedTrades } from '@/data/mockMyTrades';
import { myReviews } from '@/data/mockMyReviews';
import { myFriends } from '@/data/mockMyFriends';

const ProfileDuplicate: React.FC = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState('available');
  // State for popup
  const [popupItem, setPopupItem] = useState<MatchItem | null>(null);
  // State for item editing
  const [editingItem, setEditingItem] = useState<MatchItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Convert items to MatchItem type
  const [items, setItems] = useState<MatchItem[]>(
    myAvailableItems.map(item => ({...item, liked: false}))
  );

  // Function to navigate to specific tab
  const navigateToTab = (tabValue: string) => {
    setActiveTab(tabValue);
  };
  
  // Handle item click for popup
  const handleItemClick = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      setPopupItem(item);
    }
  };
  
  // Handle popup close
  const handlePopupClose = () => {
    setPopupItem(null);
  };

  // Handle edit item
  const handleEditItem = () => {
    if (popupItem) {
      setEditingItem(popupItem);
      setIsEditDialogOpen(true);
      setPopupItem(null);
    }
  };

  // Handle save edited item
  const handleSaveItem = (updatedItem: MatchItem) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      )
    );
    toast.success("Item updated successfully");
  };

  // Handle delete item
  const handleDeleteItem = () => {
    if (popupItem) {
      setItems(prevItems => prevItems.filter(item => item.id !== popupItem.id));
      toast.success("Item deleted successfully");
      setPopupItem(null);
    }
  };

  // Handle duplicate item
  const handleDuplicateItem = () => {
    if (popupItem) {
      const newItem = {
        ...popupItem,
        id: `duplicate-${Date.now()}`,
        name: `${popupItem.name} (Copy)`,
      };
      setItems(prevItems => [...prevItems, newItem]);
      toast.success("Item duplicated successfully");
      setPopupItem(null);
    }
  };

  // Handle add new item
  const handleAddNewItem = () => {
    const newItem: MatchItem = {
      id: `new-${Date.now()}`,
      name: "New Item",
      image: "/placeholder.svg",
      description: "Add a description for your new item",
      liked: false,
      category: "",
      condition: "",
      priceRange: "",
    };
    
    setEditingItem(newItem);
    setIsEditDialogOpen(true);
  };

  // Handle save new item
  const handleSaveNewItem = (newItem: MatchItem) => {
    // Check if it's an edit or add
    const existingItemIndex = items.findIndex(item => item.id === newItem.id);
    
    if (existingItemIndex >= 0) {
      // Update existing item
      setItems(prevItems => 
        prevItems.map(item => item.id === newItem.id ? newItem : item)
      );
      toast.success("Item updated successfully");
    } else {
      // Add new item
      setItems(prevItems => [...prevItems, newItem]);
      toast.success("New item added successfully");
    }
  };

  return (
    <MainLayout>
      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        {/* Profile Header */}
        <ProfileHeader 
          profile={mockProfileData} 
          friendCount={myFriends.length}
          onReviewsClick={() => navigateToTab('reviews')}
          onFriendsClick={() => navigateToTab('friends')}
        />

        {/* Tabs with sticky header */}
        <div className="sticky top-16 bg-white z-10">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full flex rounded-none h-12 bg-white border-b justify-start">
              <TabsTrigger 
                value="available" 
                className="flex-1 md:flex-none md:min-w-[180px] data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none data-[state=active]:shadow-none"
              >
                Items For Trade
              </TabsTrigger>
              <TabsTrigger 
                value="completed" 
                className="flex-1 md:flex-none md:min-w-[180px] data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none data-[state=active]:shadow-none"
              >
                Completed Trades
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                className="flex-1 md:flex-none md:min-w-[180px] data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none data-[state=active]:shadow-none"
              >
                <Star className="mr-2 h-4 w-4" />
                Reviews
              </TabsTrigger>
              <TabsTrigger 
                value="friends" 
                className="flex-1 md:flex-none md:min-w-[180px] data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none data-[state=active]:shadow-none"
              >
                <Users className="mr-2 h-4 w-4" />
                Friends
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Available Items Tab Content */}
        <TabsContent value="available" className="p-6">
          <div className="flex justify-end mb-4">
            <Button onClick={handleAddNewItem} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Item
            </Button>
          </div>
          <ProfileItemsManager initialItems={items} onItemClick={handleItemClick} />
        </TabsContent>

        {/* Other Tabs Content */}
        <TabsContent value="completed" className="p-6">
          <CompletedTradesTab trades={myCompletedTrades} />
        </TabsContent>
        
        <TabsContent value="reviews" className="p-6">
          <ReviewsTab reviews={myReviews} />
        </TabsContent>
        
        <TabsContent value="friends" className="p-6">
          <FriendsTab friends={myFriends} />
        </TabsContent>
      </div>

      {/* Item Details Popup with edit controls */}
      {popupItem && (
        <ItemDetailsPopup 
          item={popupItem}
          isOpen={!!popupItem}
          onClose={handlePopupClose}
          onEditClick={handleEditItem}
          onDuplicateClick={handleDuplicateItem}
          onDeleteClick={handleDeleteItem}
          canEdit={true}
        />
      )}

      {/* Item Edit Dialog */}
      <ItemEditDialog
        item={editingItem}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveNewItem}
      />
    </MainLayout>
  );
};

export default ProfileDuplicate;
