import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Trash2, RefreshCw } from 'lucide-react';

const DataCleanup: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleCleanupMyData = async () => {
    if (!user) {
      toast.error('You must be logged in to clean up data');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.rpc('cleanup_user_data');
      
      if (error) {
        console.error('Error cleaning up data:', error);
        toast.error('Failed to clean up data: ' + error.message);
      } else {
        toast.success('Successfully cleaned up all your data! The page will refresh.');
        // Refresh the page to show the clean state
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error cleaning up data:', error);
      toast.error('Failed to clean up data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCleanupAllData = async () => {
    if (!user) {
      toast.error('You must be logged in to clean up data');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.rpc('cleanup_all_data');
      
      if (error) {
        console.error('Error cleaning up all data:', error);
        toast.error('Failed to clean up all data: ' + error.message);
      } else {
        toast.success('Successfully cleaned up ALL data! The page will refresh.');
        // Refresh the page to show the clean state
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error cleaning up all data:', error);
      toast.error('Failed to clean up all data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-4 text-center text-gray-500">
        You must be logged in to access data cleanup tools.
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Trash2 className="h-5 w-5 text-red-500" />
        Data Cleanup Tools
      </h2>
      
      <div className="space-y-4">
        <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
          <h3 className="font-medium text-yellow-800 mb-2">Clean Up My Data</h3>
          <p className="text-sm text-yellow-700 mb-3">
            This will delete all YOUR items, conversations, matches, friend requests, and reviews. Other users' data will remain intact.
          </p>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Cleaning...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clean My Data
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clean Up Your Data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all of your items, conversations, matches, friend requests, and reviews. 
                  This action cannot be undone. Other users' data will not be affected.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleCleanupMyData} className="bg-red-600 hover:bg-red-700">
                  Yes, Clean My Data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
          <h3 className="font-medium text-red-800 mb-2">⚠️ Clean Up ALL Data (Dangerous)</h3>
          <p className="text-sm text-red-700 mb-3">
            This will delete ALL data from EVERYONE in the database. This is a complete reset and cannot be undone.
          </p>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Cleaning...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clean ALL Data
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>⚠️ DANGER: Clean Up ALL Data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete ALL data from EVERYONE in the database including all items, 
                  conversations, matches, friend requests, and reviews from all users. 
                  This action cannot be undone and will affect everyone using the app.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleCleanupAllData} className="bg-red-600 hover:bg-red-700">
                  Yes, Delete Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default DataCleanup;