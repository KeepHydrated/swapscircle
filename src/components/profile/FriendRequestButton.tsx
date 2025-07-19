
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { createFriendRequestNotification, createFriendRequestAcceptedNotification } from '@/services/notificationService';

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
        toast.error("You must be logged in");
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

  const handleUnsendRequest = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in");
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
