
import React from 'react';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { Friend } from '@/types/profile';

interface FriendsTabProps {
  friends: Friend[];
}

const FriendsTab: React.FC<FriendsTabProps> = ({ friends }) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {friends.map(friend => (
        <Card key={friend.id} className="overflow-hidden">
          <div className="p-4">
            <Link to={`/profile-duplicate`} className="flex items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                <img 
                  src={friend.avatar} 
                  alt={friend.name}
                  className="w-full h-full object-cover" 
                />
              </div>
              <div>
                <div className="font-medium hover:underline">{friend.name}</div>
                <div className="text-sm text-muted-foreground flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{friend.friendCount} friends</span>
                </div>
              </div>
            </Link>
          </div>
          
          {friend.items.length > 0 && (
            <div className="p-4 pt-0">
              <p className="text-sm font-medium mb-2">Items for trade</p>
              <div className="grid grid-cols-3 gap-2">
                {friend.items.slice(0, 3).map(item => (
                  <div key={item.id} className="aspect-square rounded overflow-hidden bg-gray-100">
                    <img 
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default FriendsTab;
