
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useTheme } from '@/context/ThemeContext';

const PrivacySettings: React.FC = () => {
  const { theme, setTheme } = useTheme();

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
            <h3 className="text-sm font-medium">Dark Mode</h3>
            <p className="text-sm text-muted-foreground">
              Enable dark mode for the application.
            </p>
          </div>
          <Switch 
            checked={theme === 'dark'} 
            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} 
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
