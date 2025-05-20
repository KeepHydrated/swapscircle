
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const PrivacySettings: React.FC = () => {
  const [privacyLevel, setPrivacyLevel] = React.useState('friends');
  const [darkMode, setDarkMode] = React.useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Privacy Settings</CardTitle>
        <CardDescription>
          Control your privacy and visibility.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="privacy">Profile Visibility</Label>
          <Select 
            value={privacyLevel} 
            onValueChange={setPrivacyLevel}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="friends">Friends Only</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Dark Mode</h3>
            <p className="text-sm text-muted-foreground">
              Enable dark mode for the application.
            </p>
          </div>
          <Switch 
            checked={darkMode} 
            onCheckedChange={setDarkMode} 
          />
        </div>
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
