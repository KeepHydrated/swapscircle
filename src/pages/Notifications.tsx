
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';

// Mock friend requests data
const initialFriendRequests = [
  {
    id: "req1",
    userId: "user2",
    name: "Marcus Thompson",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    timeAgo: "2 days ago"
  },
  {
    id: "req2",
    userId: "user3",
    name: "Sarah Johnson",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    timeAgo: "3 hours ago"
  }
];

const Notifications: React.FC = () => {
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
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground mt-1">View your alerts and updates</p>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-2">Friend Requests</h2>
        
        {friendRequests.length > 0 ? (
          <div className="space-y-4">
            {friendRequests.map(request => (
              <Card key={request.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={request.avatar} />
                      <AvatarFallback>{request.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{request.name}</h3>
                      <p className="text-sm text-muted-foreground">{request.timeAgo}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleAcceptRequest(request.id)}
                    >
                      <UserCheck className="mr-2 h-4 w-4" />
                      Accept
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleRejectRequest(request.id)}
                    >
                      <UserX className="mr-2 h-4 w-4" />
                      Decline
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-lg shadow-sm p-12 flex flex-col items-center justify-center">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium text-muted-foreground">No notifications yet</h2>
            <p className="text-muted-foreground mt-2">You'll see your market alerts and updates here</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Notifications;
