
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { UserPlus, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { createFriendRequestNotification, createFriendRequestAcceptedNotification } from '@/services/notificationService';
import { blockingService } from '@/services/blockingService';

export type FriendRequestStatus = 'none' | 'pending' | 'pending-received' | 'accepted' | 'rejected';

interface FriendRequestButtonProps {
  userId: string;
  initialStatus?: FriendRequestStatus;
  onStatusChange?: (status: FriendRequestStatus) => void;
}

const FriendRequestButton: React.FC<FriendRequestButtonProps> = ({
  userId,
  initialStatus = 'none',
  onStatusChange
}) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<FriendRequestStatus>(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [friendRequestId, setFriendRequestId] = useState<string | null>(null);
  const [otherUserName, setOtherUserName] = useState<string>('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [isBlockedBy, setIsBlockedBy] = useState(false);
  
  // Check existing friend request status on mount
  useEffect(() => {
    const checkFriendRequestStatus = async () => {
      setIsInitialLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get other user's profile for name
        const { data: otherProfile } = await supabase
          .from('profiles')
          .select('name, username')
          .eq('id', userId)
          .single();

        if (otherProfile) {
          setOtherUserName(otherProfile.name || otherProfile.username || 'this user');
        }

        // Check blocking relationships
        const [userIsBlocked, userIsBlockedBy] = await Promise.all([
          blockingService.isUserBlocked(userId),
          blockingService.isCurrentUserBlockedBy(userId)
        ]);

        setIsBlocked(userIsBlocked);
        setIsBlockedBy(userIsBlockedBy);

        // If either user is blocked, don't check friend requests
        if (userIsBlocked || userIsBlockedBy) {
          return;
        }

        const { data: friendRequests } = await supabase
          .from('friend_requests')
          .select('*')
          .or(`and(requester_id.eq.${user.id},recipient_id.eq.${userId}),and(requester_id.eq.${userId},recipient_id.eq.${user.id})`);

        if (friendRequests && friendRequests.length > 0) {
          const request = friendRequests[0];
          setFriendRequestId(request.id);
          
          if (request.status === 'accepted') {
            setStatus('accepted');
          } else if (request.status === 'pending') {
            if (request.requester_id === user.id) {
              setStatus('pending');
            } else {
              setStatus('pending-received');
            }
          } else if (request.status === 'rejected') {
            setStatus('rejected');
          }
        }
      } catch (error) {
        console.error('Error checking friend request status:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    if (userId) {
      checkFriendRequestStatus();
    }
  }, [userId]);
  
  const handleSendRequest = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Check if either user is blocked
      const [userIsBlocked, userIsBlockedBy] = await Promise.all([
        blockingService.isUserBlocked(userId),
        blockingService.isCurrentUserBlockedBy(userId)
      ]);

      if (userIsBlocked) {
        toast.error("You have blocked this user");
        return;
      }

      if (userIsBlockedBy) {
        toast.error("This user has blocked you");
        return;
      }

      // Check if there's already a friend request and handle it
      const { data: existingRequests } = await supabase
        .from('friend_requests')
        .select('*')
        .or(`and(requester_id.eq.${user.id},recipient_id.eq.${userId}),and(requester_id.eq.${userId},recipient_id.eq.${user.id})`);

      if (existingRequests && existingRequests.length > 0) {
        const existingRequest = existingRequests[0];
        
        // If there's a rejected request, delete it first
        if (existingRequest.status === 'rejected') {
          await supabase
            .from('friend_requests')
            .delete()
            .eq('id', existingRequest.id);
        } else if (existingRequest.status === 'pending') {
          // If already pending, don't send again
          toast.error("Friend request already sent");
          return;
        } else if (existingRequest.status === 'accepted') {
          toast.error("You are already friends");
          return;
        }
      }

      // Get requester profile for notification
      const { data: requesterProfile } = await supabase
        .from('profiles')
        .select('name, username')
        .eq('id', user.id)
        .single();

      const { error } = await supabase
        .from('friend_requests')
        .insert({
          requester_id: user.id,
          recipient_id: userId,
          status: 'pending'
        });

      if (error) throw error;
      
      // Create notification for recipient
      const requesterName = requesterProfile?.name || requesterProfile?.username || 'Someone';
      try {
        await createFriendRequestNotification(userId, requesterName);
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Don't fail the friend request if notification fails
      }
      
      setStatus('pending');
      if (onStatusChange) onStatusChange('pending');
      
      toast.success("Friend request sent!");
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error("Failed to send friend request");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAcceptRequest = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Get accepter profile for notification
      const { data: accepterProfile } = await supabase
        .from('profiles')
        .select('name, username')
        .eq('id', user.id)
        .single();

      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .match({ 
          requester_id: userId,
          recipient_id: user.id,
          status: 'pending'
        });

      if (error) throw error;
      
      // Create notification for original requester
      const accepterName = accepterProfile?.name || accepterProfile?.username || 'Someone';
      try {
        await createFriendRequestAcceptedNotification(userId, accepterName);
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Don't fail the friend request if notification fails
      }
      
      setStatus('accepted');
      if (onStatusChange) onStatusChange('accepted');
      
      toast.success("Friend request accepted!");
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error("Failed to accept friend request");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRejectRequest = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'rejected' })
        .match({ 
          requester_id: userId,
          recipient_id: user.id,
          status: 'pending'
        });

      if (error) throw error;
      
      setStatus('rejected');
      if (onStatusChange) onStatusChange('rejected');
      
      toast.success("Friend request rejected");
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      toast.error("Failed to reject friend request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsendRequest = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { error } = await supabase
        .from('friend_requests')
        .delete()
        .match({ 
          requester_id: user.id,
          recipient_id: userId,
          status: 'pending'
        });

      if (error) throw error;
      
      setStatus('none');
      if (onStatusChange) onStatusChange('none');
      
      toast.success("Friend request unsent");
    } catch (error) {
      console.error('Error unsending friend request:', error);
      toast.error("Failed to unsend friend request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfriend = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !friendRequestId) {
        toast.error("Cannot unfriend at this time");
        return;
      }

      const { error } = await supabase
        .from('friend_requests')
        .delete()
        .eq('id', friendRequestId);

      if (error) throw error;
      
      setStatus('none');
      setFriendRequestId(null);
      if (onStatusChange) onStatusChange('none');
      
      toast.success(`Unfriended ${otherUserName}`);
    } catch (error) {
      console.error('Error unfriending:', error);
      toast.error("Failed to unfriend");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Show loading state during initial load
  if (isInitialLoading) {
    return (
      <Button disabled variant="outline">
        Loading...
      </Button>
    );
  }

  // Don't show friend request button if user is blocked or blocking
  if (isBlocked || isBlockedBy) {
    return null;
  }
  
  // Button for sending a friend request
  if (status === 'none') {
    return (
      <Button 
        onClick={handleSendRequest}
        disabled={isLoading}
      >
        <UserPlus className="mr-2 h-4 w-4" />
        Add Friend
      </Button>
    );
  }
  
  // Button for pending friend request (from sender's perspective)
  if (status === 'pending') {
    return (
      <Button 
        variant="outline"
        onClick={handleUnsendRequest}
        disabled={isLoading}
      >
        <UserX className="mr-2 h-4 w-4" />
        Unsend Request
      </Button>
    );
  }
  
  // Button group for pending friend request (from receiver's perspective)
  if (status === 'pending-received') {
    return (
      <div className="flex space-x-2">
        <Button 
          onClick={handleAcceptRequest}
          disabled={isLoading}
          size="sm"
        >
          <UserCheck className="mr-2 h-4 w-4" />
          Accept
        </Button>
        <Button 
          variant="outline"
          onClick={handleRejectRequest}
          disabled={isLoading}
          size="sm"
        >
          <UserX className="mr-2 h-4 w-4" />
          Decline
        </Button>
      </div>
    );
  }
  
  // Button group for accepted friend request (friends with unfriend option)
  if (status === 'accepted') {
    return (
      <div className="flex space-x-2">
        <Button 
          variant="secondary"
          disabled
        >
          <UserCheck className="mr-2 h-4 w-4" />
          Friends
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline"
              size="sm"
              className="px-3"
              disabled={isLoading}
            >
              <UserX className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unfriend {otherUserName}</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to unfriend {otherUserName}? This action cannot be undone and you'll need to send a new friend request to connect again.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleUnfriend}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Unfriend
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }
  
  // Button for rejected friend request (allow to send again)
  return (
    <Button 
      variant="outline"
      onClick={handleSendRequest}
      disabled={isLoading}
    >
      <UserPlus className="mr-2 h-4 w-4" />
      Add Friend
    </Button>
  );
};

export default FriendRequestButton;
