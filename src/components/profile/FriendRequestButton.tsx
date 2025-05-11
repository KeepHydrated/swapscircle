
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';

export type FriendRequestStatus = 'none' | 'pending' | 'accepted' | 'rejected';

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
  
  const handleSendRequest = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      // Update status
      setStatus('pending');
      if (onStatusChange) onStatusChange('pending');
      
      toast.success("Friend request sent!");
    } catch (error) {
      toast.error("Failed to send friend request");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAcceptRequest = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      // Update status
      setStatus('accepted');
      if (onStatusChange) onStatusChange('accepted');
      
      toast.success("Friend request accepted!");
    } catch (error) {
      toast.error("Failed to accept friend request");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRejectRequest = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      // Update status
      setStatus('rejected');
      if (onStatusChange) onStatusChange('rejected');
      
      toast.success("Friend request rejected");
    } catch (error) {
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
