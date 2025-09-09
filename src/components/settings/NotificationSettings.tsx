
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const NotificationSettings: React.FC = () => {
  const [notifications, setNotifications] = React.useState(true);

  // Handle notification settings
  const handleNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Notification settings updated');
  };

  return (
    <form onSubmit={handleNotificationSubmit}>
      <Card>
        <CardHeader className="hidden md:block">
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Manage how you receive notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-8 md:pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Push Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Receive notifications when you get new matches.
              </p>
            </div>
            <Switch 
              checked={notifications} 
              onCheckedChange={setNotifications} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Email Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Receive email updates about your account.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Trade Confirmations</h3>
              <p className="text-sm text-muted-foreground">
                Receive notifications when a trade is confirmed.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">New Messages</h3>
              <p className="text-sm text-muted-foreground">
                Receive notifications for new messages.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Button type="submit">Save Changes</Button>
        </CardContent>
      </Card>
    </form>
  );
};

export default NotificationSettings;
