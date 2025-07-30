import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

const AccountSettings: React.FC = () => {
  const { user, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [accountData, setAccountData] = useState({
    created_at: '',
    last_sign_in: '',
    email_verified: false
  });

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      // Get additional account info
      const fetchAccountData = async () => {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          setAccountData({
            created_at: authUser.created_at || '',
            last_sign_in: authUser.last_sign_in_at || '',
            email_verified: authUser.email_confirmed_at ? true : false
          });
        }
      };
      fetchAccountData();
    }
  }, [user]);

  const handleEmailUpdate = async () => {
    if (!email || email === user?.email) {
      toast.error('Please enter a new email address');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Email update initiated. Please check your new email for confirmation.');
      }
    } catch (error) {
      toast.error('Failed to update email');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) {
      toast.error('No email associated with this account');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth`
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Password reset email sent');
      }
    } catch (error) {
      toast.error('Failed to send password reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) {
      toast.error('No user found');
      return;
    }

    setIsLoading(true);
    try {
      // Call the database function to delete user account data
      const { error } = await supabase.rpc('delete_user_account');
      
      if (error) {
        console.error('Error deleting account:', error);
        toast.error('Failed to delete account: ' + error.message);
        return;
      }

      toast.success('Account deleted successfully');
      
      // Sign out the user
      await signOut();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Account Information</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account details and security settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Account Created</Label>
              <p className="text-sm">{formatDate(accountData.created_at)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Last Sign In</Label>
              <p className="text-sm">{formatDate(accountData.last_sign_in)}</p>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Email Verification Status</Label>
            <p className={`text-sm ${accountData.email_verified ? 'text-green-600' : 'text-orange-600'}`}>
              {accountData.email_verified ? 'Verified' : 'Not Verified'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter new email address"
              />
              <Button 
                onClick={handleEmailUpdate} 
                disabled={isLoading || email === user?.email}
                variant="outline"
              >
                {isLoading ? 'Updating...' : 'Update Email'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Changing your email will require verification of the new address.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Password</Label>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Reset your password to maintain account security.
              </p>
              <Button 
                onClick={handlePasswordReset} 
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? 'Sending...' : 'Reset Password'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Delete Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isLoading}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account,
                      remove all your data from our servers, and cancel any active subscriptions.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isLoading ? 'Deleting...' : 'Delete Account'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSettings;