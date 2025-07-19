
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  const [status, setStatus] = useState<FriendRequestStatus>(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  
  // Check existing friend request status on mount
  useEffect(() => {
    const checkFriendRequestStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: friendRequests } = await supabase
          .from('friend_requests')
          .select('*')
          .or(`and(requester_id.eq.${user.id},recipient_id.eq.${userId}),and(requester_id.eq.${userId},recipient_id.eq.${user.id})`);

        if (friendRequests && friendRequests.length > 0) {
          const request = friendRequests[0];
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
        toast.error("You must be logged in to send friend requests");
        return;
      }

      const { error } = await supabase
        .from('friend_requests')
        .insert({
          requester_id: user.id,
          recipient_id: userId,
          status: 'pending'
        });

      if (error) throw error;
      
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
        toast.error("You must be logged in");
        return;
      }

      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .match({ 
          requester_id: userId,
          recipient_id: user.id,
          status: 'pending'
        });

      if (error) throw error;
      
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
        toast.error("You must be logged in");
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
        variant="secondary"
        disabled={true}
      >
        <UserCheck className="mr-2 h-4 w-4" />
        Request Sent
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
  
  // Button for accepted friend request
  if (status === 'accepted') {
    return (
      <Button 
        variant="secondary"
      >
        <UserCheck className="mr-2 h-4 w-4" />
        Friends
      </Button>
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
