import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { UserX } from 'lucide-react';
import { toast } from 'sonner';

interface BlockUserButtonProps {
  userId: string;
  username: string;
  onBlockSuccess?: () => void;
}

const BlockUserButton: React.FC<BlockUserButtonProps> = ({ 
  userId, 
  username, 
  onBlockSuccess 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const handleBlock = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement actual blocking functionality with Supabase
      // For now, just simulate the action
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsBlocked(true);
      toast.success(`${username} has been blocked`);
      onBlockSuccess?.();
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.error('Failed to block user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isBlocked) {
    return (
      <Button 
        variant="outline" 
        size="sm"
        disabled
        className="text-red-600 border-red-200 w-10 h-10 p-0"
        title="Blocked"
      >
        <UserX className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="text-red-600 border-red-200 hover:bg-red-50 w-10 h-10 p-0"
          title="Block User"
        >
          <UserX className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Block {username}?</AlertDialogTitle>
          <AlertDialogDescription>
            This user will no longer be able to:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Send you friend requests</li>
              <li>See your items or profile</li>
              <li>Contact you through the app</li>
            </ul>
            <div className="mt-3 text-sm text-gray-600">
              You can unblock them later from your settings.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleBlock}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? 'Blocking...' : 'Block User'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default BlockUserButton;