
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const PrivacySettings: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Privacy Settings</CardTitle>
        <CardDescription>
          Control your privacy and visibility.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Show Location</h3>
            <p className="text-sm text-muted-foreground">
              Display your location on your public profile.
            </p>
          </div>
          <Switch defaultChecked />
        </div>
        <Button onClick={() => toast.success('Privacy settings saved')}>
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
};

export default PrivacySettings;
