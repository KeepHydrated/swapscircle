
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const LocationSettings: React.FC = () => {
  const [distance, setDistance] = React.useState('25');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Location Settings</CardTitle>
        <CardDescription>
          Control your location preferences for trading.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="distance">Maximum Trading Distance (miles)</Label>
          <Select 
            value={distance} 
            onValueChange={setDistance}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select distance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 miles</SelectItem>
              <SelectItem value="10">10 miles</SelectItem>
              <SelectItem value="25">25 miles</SelectItem>
              <SelectItem value="50">50 miles</SelectItem>
              <SelectItem value="nationwide">All of US</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => toast.success('Location settings saved')}>
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
};

export default LocationSettings;
