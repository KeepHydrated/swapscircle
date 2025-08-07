import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { UserX } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);

  // Check if user is already blocked on component mount
  useEffect(() => {
    const checkBlockStatus = async () => {
      setIsInitialLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('blocked_users')
          .select('id')
          .eq('blocker_id', user.id)
          .eq('blocked_id', userId)
          .maybeSingle();

        if (!error && data) {
          setIsBlocked(true);
        }
      } catch (error) {
        console.error('Error checking block status:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    if (userId) {
      checkBlockStatus();
    }
  }, [userId]);

  const handleBlock = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to block users');
        return;
      }

      const { error } = await supabase
        .from('blocked_users')
        .insert({
          blocker_id: user.id,
          blocked_id: userId
        });

      if (error) {
        throw error;
      }
      
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

  const handleUnblock = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to unblock users');
        return;
      }

      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', userId);

      if (error) {
        throw error;
      }
      
      setIsBlocked(false);
      toast.success(`${username} has been unblocked`);
      onBlockSuccess?.();
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast.error('Failed to unblock user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state during initial load
  if (isInitialLoading) {
    return (
      <Button 
        variant="outline" 
        size="sm"
        disabled
        className="w-10 h-10 p-0"
      >
        <UserX className="w-4 h-4" />
      </Button>
    );
  }

  if (isBlocked) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="text-red-600 border-red-200 w-10 h-10 p-0"
            title="Unblock User"
          >
            <UserX className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unblock {username}?</AlertDialogTitle>
            <AlertDialogDescription>
              This user will be able to:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Send you friend requests again</li>
                <li>See your items and profile</li>
                <li>Contact you through the app</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleUnblock}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Unblocking...' : 'Unblock User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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