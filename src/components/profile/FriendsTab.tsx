
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Friend } from '@/types/profile';

interface FriendsTabProps {
  friends: Friend[];
}

const FriendsTab: React.FC<FriendsTabProps> = ({ friends }) => {
  const navigate = useNavigate();

  const handleViewProfile = (friendId: string) => {
    navigate(`/other-person-profile`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {friends.map(friend => (
        <Card key={friend.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div 
              className="p-5 flex flex-col items-center cursor-pointer" 
              onClick={() => handleViewProfile(friend.id)}
            >
              <Avatar className="h-20 w-20 mb-4">
                <AvatarImage src={friend.avatar} alt={friend.name} />
                <AvatarFallback>{friend.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <h3 className="font-medium text-lg mb-1">{friend.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{friend.friendCount} friends</p>
              <Button 
                variant="outline"
                className="w-full mt-2" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewProfile(friend.id);
                }}
              >
                View Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FriendsTab;
