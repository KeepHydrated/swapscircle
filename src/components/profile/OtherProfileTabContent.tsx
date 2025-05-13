
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import CompletedTradesTab from '@/components/profile/CompletedTradesTab';
import ReviewsTab from '@/components/profile/ReviewsTab';
import FriendsTab from '@/components/profile/FriendsTab';
import { MatchItem } from '@/types/item';

// Import mock data
import { myCompletedTrades } from '@/data/mockMyTrades';
import { myReviews } from '@/data/mockMyReviews';
import { myFriends } from '@/data/mockMyFriends';

interface OtherProfileTabContentProps {
  activeTab: string;
  items: MatchItem[];
  setPopupItem: (item: MatchItem | null) => void;
}

const OtherProfileTabContent: React.FC<OtherProfileTabContentProps> = ({ 
  activeTab, 
  items,
  setPopupItem
}) => {
  // Handle item click to show popup
  const handleItemClick = (item: MatchItem) => {
    setPopupItem(item);
  };

  return (
    <>
      {/* Available Items Tab Content */}
      <TabsContent value="available" className="p-6">
        <div className="space-y-6">
          <ScrollArea className="h-[calc(100vh-320px)]">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pr-4">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => handleItemClick(item)}
                  className="cursor-pointer"
                >
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full aspect-square object-cover rounded-md"
                  />
                  <h3 className="mt-2 font-medium text-sm truncate">{item.name}</h3>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </TabsContent>

      {/* Completed Trades Tab Content */}
      <TabsContent value="completed" className="p-6">
        <CompletedTradesTab trades={myCompletedTrades} />
      </TabsContent>
      
      {/* Reviews Tab Content */}
      <TabsContent value="reviews" className="p-6">
        <ReviewsTab reviews={myReviews} />
      </TabsContent>
      
      {/* Friends Tab Content */}
      <TabsContent value="friends" className="p-6">
        <FriendsTab friends={myFriends} />
      </TabsContent>
    </>
  );
};

export default OtherProfileTabContent;
