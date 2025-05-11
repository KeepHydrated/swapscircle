
import React from 'react';

interface Friend {
  id: string;
  name: string;
  mutualItems: number;
  avatar: string;
}

interface FriendsTabProps {
  friends: Friend[];
}

const FriendsTab: React.FC<FriendsTabProps> = ({ friends }) => {
  return (
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
  );
};

export default FriendsTab;
