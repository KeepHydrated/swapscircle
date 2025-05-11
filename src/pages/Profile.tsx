import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import ItemEditDialog from '@/components/items/ItemEditDialog';
import { Item } from '@/types/item';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ItemsForTradeTab from '@/components/profile/ItemsForTradeTab';
import CompletedTradesTab from '@/components/profile/CompletedTradesTab';
import { Star, Users } from 'lucide-react';

const Profile: React.FC = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState('available');
  
  // Profile data
  const profile = {
    name: "Alex Morgan",
    description: "Vintage collector and trading enthusiast based in Portland. I specialize in retro gaming items, vinyl records, and collectible figurines. Always looking for fair trades and new additions to my collection!",
    rating: 5,
    reviewCount: 127,
    location: "Portland, OR",
    memberSince: "2022"
  };

  // Items for trade
  const [availableItems, setAvailableItems] = useState<Item[]>([
    {
      id: "1",
      name: "Super Nintendo Entertainment System (SNES)",
      description: "Original SNES console in excellent condition. Includes two controllers, power adapter, and AV cable. Some minor cosmetic wear but works perfectly.",
      image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
      condition: "Excellent",
      category: "Gaming",
      priceRange: "$100-$150"
    },
    {
      id: "2",
      name: "Vintage Led Zeppelin Vinyl Collection",
      description: "Complete set of first pressing Led Zeppelin vinyl records. All sleeves in near-mint condition. A must-have for any serious collector.",
      image: "https://images.unsplash.com/photo-1487887235947-a955ef187fcc",
      condition: "Near Mint",
      category: "Music",
      priceRange: "$200-$300"
    },
    {
      id: "3",
      name: "Limited Edition Gundam Figurine",
      description: "Rare 1995 limited edition Gundam Wing Zero Custom figurine, still in original packaging. Only minor wear on the box corners.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
      condition: "Good",
      category: "Collectibles",
      priceRange: "$75-$125"
    },
    {
      id: "4",
      name: "Polaroid SX-70 Camera",
      description: "Vintage Polaroid SX-70 instant camera from the 1970s. Recently serviced and in full working condition. Includes original leather case.",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
      condition: "Good",
      category: "Photography",
      priceRange: "$120-$180"
    },
    {
      id: "5",
      name: "Antique Brass Compass",
      description: "19th century maritime brass compass with original wooden case. Beautiful patina and fully functional. A true collector's piece.",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
      condition: "Antique",
      category: "Collectibles",
      priceRange: "$250-$350"
    }
  ]);

  // Completed trades
  const completedTrades = [
    {
      id: 101,
      name: "Vintage Typewriter",
      tradedFor: "Retro Gaming Console",
      tradedWith: "Jessica L.",
      tradeDate: "March 15, 2025",
      image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7"
    },
    {
      id: 102,
      name: "1970s Record Player",
      tradedFor: "Comic Book Collection",
      tradedWith: "Marcus T.",
      tradeDate: "February 20, 2025",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
    },
    {
      id: 103,
      name: "Antique Pocket Watch",
      tradedFor: "Vintage Camera Lenses",
      tradedWith: "Sophia R.",
      tradeDate: "January 8, 2025",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
    },
    {
      id: 104,
      name: "Classic Film Camera",
      tradedFor: "Vinyl Record Collection",
      tradedWith: "Daniel M.",
      tradeDate: "December 5, 2024",
      image: "https://images.unsplash.com/photo-1487887235947-a955ef187fcc"
    }
  ];

  // State for editing items
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Function to handle clicking on an item to edit
  const handleItemClick = (item: Item) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  // Function to save edited item
  const handleSaveItem = (updatedItem: Item) => {
    setAvailableItems(items => 
      items.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      )
    );
    toast({
      title: "Item updated",
      description: `${updatedItem.name} has been updated successfully.`
    });
  };

  // Mock reviews data
  const reviews = [
    {
      id: 1,
      user: "Jessica L.",
      rating: 5,
      comment: "Excellent trader! The item was exactly as described, and shipping was fast.",
      date: "April 15, 2025"
    },
    {
      id: 2,
      user: "Marcus T.",
      rating: 5,
      comment: "Great communication and smooth transaction. Would definitely trade again!",
      date: "March 28, 2025"
    },
    {
      id: 3,
      user: "Sophia R.",
      rating: 4,
      comment: "Very satisfied with my trade. Item was in good condition as described.",
      date: "February 12, 2025"
    }
  ];

  // Mock friends data
  const friends = [
    {
      id: "friend1",
      name: "Jessica L.",
      mutualItems: 4,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
    },
    {
      id: "friend2",
      name: "Marcus T.",
      mutualItems: 2,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e"
    },
    {
      id: "friend3",
      name: "Sophia R.",
      mutualItems: 7,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
    }
  ];

  // Function to navigate to specific tab
  const navigateToTab = (tabValue: string) => {
    setActiveTab(tabValue);
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Trading Hub</h1>
      </div>
      
      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        {/* Profile Header */}
        <ProfileHeader 
          profile={profile} 
          friendCount={friends.length}
          onReviewsClick={() => navigateToTab('reviews')}
          onFriendsClick={() => navigateToTab('friends')}
        />

        {/* Tabs */}
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

          {/* Available Items Tab Content */}
          <TabsContent value="available" className="p-6">
            <ItemsForTradeTab items={availableItems} onItemClick={handleItemClick} />
          </TabsContent>

          {/* Completed Trades Tab Content */}
          <TabsContent value="completed" className="p-6">
            <CompletedTradesTab trades={completedTrades} />
          </TabsContent>
          
          {/* Reviews Tab Content */}
          <TabsContent value="reviews" className="p-6">
            <div className="space-y-6">
              {reviews.map(review => (
                <div key={review.id} className="bg-white rounded-lg border p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{review.user}</div>
                    <div className="text-sm text-muted-foreground">{review.date}</div>
                  </div>
                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                      />
                    ))}
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          </TabsContent>
          
          {/* Friends Tab Content */}
          <TabsContent value="friends" className="p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {friends.map(friend => (
                <div key={friend.id} className="bg-white rounded-lg border p-4 shadow-sm flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <img 
                      src={friend.avatar} 
                      alt={friend.name}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <div className="font-medium">{friend.name}</div>
                    <div className="text-sm text-muted-foreground">{friend.mutualItems} mutual items</div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Item Edit Dialog */}
      <ItemEditDialog
        item={editingItem}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveItem}
      />
    </MainLayout>
  );
};

export default Profile;
