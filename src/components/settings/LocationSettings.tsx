
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Slider } from '@/components/ui/slider';

const LocationSettings: React.FC = () => {
  const [selectionType, setSelectionType] = useState('range');
  const [distanceValue, setDistanceValue] = useState(25);

  const handleDistanceChange = (value: number[]) => {
    setDistanceValue(value[0]);
  };

  const handleSelectionTypeChange = (type: string) => {
    setSelectionType(type);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Location Settings</CardTitle>
        <CardDescription>
          Control your location preferences for trading.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label className="text-base">Maximum Trading Distance</Label>
          
          <div className="flex gap-4 items-center">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="nationwide"
                name="location-type"
                checked={selectionType === 'all'}
                onChange={() => handleSelectionTypeChange('all')}
                className="h-4 w-4 text-primary"
              />
              <Label htmlFor="nationwide" className="text-sm font-normal cursor-pointer">
                All of US
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="specific-range"
                name="location-type"
                checked={selectionType === 'range'}
                onChange={() => handleSelectionTypeChange('range')}
                className="h-4 w-4 text-primary"
              />
              <Label htmlFor="specific-range" className="text-sm font-normal cursor-pointer">
                Specific range
              </Label>
            </div>
          </div>
          
          {selectionType === 'range' && (
            <div className="pt-2">
              <div className="w-full max-w-md">
                <Slider
                  defaultValue={[distanceValue]}
                  min={1}
                  max={50}
                  step={1}
                  onValueChange={handleDistanceChange}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
                  <span>1 mile</span>
                  <span>{distanceValue} miles</span>
                  <span>50 miles</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <Button onClick={() => toast.success('Location settings saved')}>
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
};

export default LocationSettings;
