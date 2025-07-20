
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';
import { Friend } from '@/types/profile';
import { supabase } from '@/integrations/supabase/client';
import { UserCheck, UserX, Users, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface FriendsTabProps {
  friends: Friend[];
}

interface FriendRequest {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: string;
  created_at: string;
  profiles?: {
    id: string;
    name?: string;
    username?: string;
    avatar_url?: string;
  } | null;
}

const FriendsTab: React.FC<FriendsTabProps> = ({ friends }) => {
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [acceptedFriends, setAcceptedFriends] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriendRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch pending requests received by the current user
      const { data: pendingData, error: pendingError } = await supabase
        .from('friend_requests')
        .select('id, requester_id, recipient_id, status, created_at')
        .eq('recipient_id', user.id)
        .eq('status', 'pending');

      if (pendingError) {
        console.error('Error fetching pending requests:', pendingError);
      } else if (pendingData) {
        // Fetch profiles for pending requests
        const requestsWithProfiles = await Promise.all(
          pendingData.map(async (request) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, name, username, avatar_url')
              .eq('id', request.requester_id)
              .single();
            
            return {
              ...request,
              profiles: profile
            };
          })
        );
        setPendingRequests(requestsWithProfiles);
      }

      // Fetch accepted friends (both directions)
      const { data: friendsData, error: friendsError } = await supabase
        .from('friend_requests')
        .select('id, requester_id, recipient_id, status, created_at')
        .or(`and(requester_id.eq.${user.id},status.eq.accepted),and(recipient_id.eq.${user.id},status.eq.accepted)`);

      if (friendsError) {
        console.error('Error fetching friends:', friendsError);
      } else if (friendsData) {
        // For each friend request, get the profile of the other person
        const friendsWithProfiles = await Promise.all(
          friendsData.map(async (request) => {
            const otherUserId = request.requester_id === user.id ? request.recipient_id : request.requester_id;
            
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, name, username, avatar_url')
              .eq('id', otherUserId)
              .single();
            
            return {
              ...request,
              profiles: profile
            };
          })
        );
        
        setAcceptedFriends(friendsWithProfiles.filter(f => f.profiles));
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  const handleViewProfile = (userId: string) => {
    navigate(`/other-person-profile?userId=${userId}`);
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;
      
      toast.success("Friend request accepted!");
      fetchFriendRequests(); // Refresh the data
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error("Failed to accept friend request");
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;
      
      toast.success("Friend request rejected");
      fetchFriendRequests(); // Refresh the data
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      toast.error("Failed to reject friend request");
    }
  };

  const handleUnfriend = async (requestId: string, friendName: string) => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;
      
      toast.success(`Unfriended ${friendName}`);
      fetchFriendRequests(); // Refresh the data
    } catch (error) {
      console.error('Error unfriending:', error);
      toast.error("Failed to unfriend");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Pending Friend Requests */}
      {pendingRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <UserPlus className="mr-2 h-5 w-5" />
            Pending Friend Requests ({pendingRequests.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pendingRequests.map(request => (
              <Card key={request.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 flex flex-col items-center">
                    <Avatar className="h-16 w-16 mb-3">
                      <AvatarImage src={request.profiles?.avatar_url} alt={request.profiles?.name || request.profiles?.username} />
                      <AvatarFallback>
                        {(request.profiles?.name || request.profiles?.username || 'U').substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <h4 className="font-medium text-center mb-2">
                      {request.profiles?.name || request.profiles?.username || 'Unknown User'}
                    </h4>
                    <div className="flex space-x-2 w-full">
                      <Button 
                        onClick={() => handleAcceptRequest(request.id)}
                        size="sm"
                        className="flex-1"
                      >
                        <UserCheck className="mr-1 h-4 w-4" />
                        Accept
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleRejectRequest(request.id)}
                        size="sm"
                        className="flex-1"
                      >
                        <UserX className="mr-1 h-4 w-4" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Users className="mr-2 h-5 w-5" />
          Friends ({acceptedFriends.length})
        </h3>
        {acceptedFriends.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No friends yet. Start connecting with other users!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {acceptedFriends.map(friend => (
               <Card key={friend.id} className="overflow-hidden relative">
                 <CardContent className="p-0">
                   <div 
                     className="p-5 flex flex-col items-center cursor-pointer" 
                     onClick={() => handleViewProfile(friend.profiles?.id)}
                   >
                     <AlertDialog>
                       <AlertDialogTrigger asChild>
                         <Button 
                           variant="destructive"
                           size="sm"
                           className="absolute top-2 right-2 h-8 w-8 p-0 z-10"
                           onClick={(e) => {
                             e.stopPropagation();
                           }}
                         >
                           <UserX className="h-4 w-4" />
                         </Button>
                       </AlertDialogTrigger>
                       <AlertDialogContent>
                         <AlertDialogHeader>
                           <AlertDialogTitle>Unfriend {friend.profiles?.name || friend.profiles?.username}</AlertDialogTitle>
                           <AlertDialogDescription>
                             Are you sure you want to unfriend {friend.profiles?.name || friend.profiles?.username}? This action cannot be undone and you'll need to send a new friend request to connect again.
                           </AlertDialogDescription>
                         </AlertDialogHeader>
                         <AlertDialogFooter>
                           <AlertDialogCancel>Cancel</AlertDialogCancel>
                           <AlertDialogAction 
                             onClick={() => handleUnfriend(friend.id, friend.profiles?.name || friend.profiles?.username || 'this user')}
                             className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                           >
                             Unfriend
                           </AlertDialogAction>
                         </AlertDialogFooter>
                       </AlertDialogContent>
                     </AlertDialog>
                     <Avatar className="h-20 w-20 mb-4">
                       <AvatarImage src={friend.profiles?.avatar_url} alt={friend.profiles?.name || friend.profiles?.username} />
                       <AvatarFallback>
                         {(friend.profiles?.name || friend.profiles?.username || 'U').substring(0, 2)}
                       </AvatarFallback>
                     </Avatar>
                     <h3 className="font-medium text-lg mb-1 text-center">
                       {friend.profiles?.name || friend.profiles?.username || 'Unknown User'}
                     </h3>
                   </div>
                 </CardContent>
               </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsTab;
