
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const NotificationSettings: React.FC = () => {
  const [notifications, setNotifications] = React.useState(true);
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [tradeConfirmations, setTradeConfirmations] = React.useState(true);
  const [newMessages, setNewMessages] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false);

  // Handle notification settings
  const handleNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Notification settings updated');
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <form onSubmit={handleNotificationSubmit}>
      <Card>
        <CardHeader className="hidden md:flex md:flex-row md:items-start md:justify-between md:space-y-0">
          <div>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Manage how you receive notifications.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </>
            ) : (
              <Button type="button" onClick={handleEdit}>Edit</Button>
            )}
          </div>
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
              disabled={!isEditing}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Email Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Receive email updates about your account.
              </p>
            </div>
            <Switch 
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
              disabled={!isEditing}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Trade Confirmations</h3>
              <p className="text-sm text-muted-foreground">
                Receive notifications when a trade is confirmed.
              </p>
            </div>
            <Switch 
              checked={tradeConfirmations}
              onCheckedChange={setTradeConfirmations}
              disabled={!isEditing}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">New Messages</h3>
              <p className="text-sm text-muted-foreground">
                Receive notifications for new messages.
              </p>
            </div>
            <Switch 
              checked={newMessages}
              onCheckedChange={setNewMessages}
              disabled={!isEditing}
            />
          </div>
          <div className="flex gap-2 md:hidden">
            {isEditing ? (
              <>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </>
            ) : (
              <Button type="button" onClick={handleEdit}>Edit</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default NotificationSettings;
