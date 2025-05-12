
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Users, UserPlus, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Friend } from '@/types/profile';

interface FriendRequest {
  id: string;
  name: string;
  avatar: string;
  userId: string;
}

// Mock friend requests data - in a real app, this would come from an API
const initialFriendRequests: FriendRequest[] = [
  {
    id: "req1",
    userId: "user2",
    name: "Marcus Thompson",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e"
  },
  {
    id: "req2",
    userId: "user3",
    name: "Sarah Johnson",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80"
  }
];

interface FriendsTabProps {
  friends: Friend[];
}

const FriendsTab: React.FC<FriendsTabProps> = ({ friends }) => {
  const [friendRequests, setFriendRequests] = useState(initialFriendRequests);
  
  const handleAcceptRequest = (requestId: string) => {
    // In a real app, this would call an API
    setFriendRequests(prev => prev.filter(req => req.id !== requestId));
    toast.success("Friend request accepted!");
  };
  
  const handleRejectRequest = (requestId: string) => {
    // In a real app, this would call an API
    setFriendRequests(prev => prev.filter(req => req.id !== requestId));
    toast.success("Friend request rejected");
  };

  return (
    <div className="space-y-8">
      {/* Friend Requests Section */}
      {friendRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <UserPlus className="h-5 w-5 mr-2" />
            Friend Requests ({friendRequests.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {friendRequests.map(request => (
              <Card key={request.id} className="overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                      <img 
                        src={request.avatar} 
                        alt={request.name}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <div className="font-medium">{request.name}</div>
                      <div className="text-sm text-muted-foreground">Wants to connect</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleAcceptRequest(request.id)}
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleRejectRequest(request.id)}
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Friends List Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Friends ({friends.length})
        </h2>
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
      </div>
    </div>
  );
};

export default FriendsTab;
