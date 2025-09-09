import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2, Navigation } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const LocationSettings = () => {
  const [profile, setProfile] = useState<any>(null);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [inputZipcode, setInputZipcode] = useState('');
  const { zipcode, error, setZipcode, validateZipcode, loading, autoDetectLocation } = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      setProfile(data);
    }
  };

  // Update location in database
  const updateLocationInDatabase = async (zip: string) => {
    try {
      setIsUpdatingLocation(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to update your location",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ 
          location: zip,
          latitude: null,
          longitude: null
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Location Updated",
        description: "Your zipcode has been successfully updated",
      });
      
      // Refresh profile data
      fetchProfile();
      setInputZipcode('');
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: "Error",
        description: "Failed to update location. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  // Handle zipcode input change
  const handleZipcodeChange = (value: string) => {
    setInputZipcode(value);
    setZipcode(value);
  };

  // Auto-update input when zipcode is auto-detected
  useEffect(() => {
    if (zipcode && zipcode !== inputZipcode) {
      setInputZipcode(zipcode);
    }
  }, [zipcode, inputZipcode]);

  // Handle saving zipcode
  const handleSaveLocation = () => {
    if (zipcode && validateZipcode(zipcode)) {
      updateLocationInDatabase(zipcode);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location Update
        </CardTitle>
        <CardDescription>
          Update your zipcode for better matching with nearby traders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <div className="text-sm text-muted-foreground">
            Current location:
          </div>
          <div className="text-sm font-mono bg-muted p-2 rounded">
            {profile?.location || "No location set"}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="zipcode-input">Zipcode</Label>
          <div className="flex gap-2">
            <Input
              id="zipcode-input"
              type="text"
              placeholder="Enter zipcode (e.g., 12345)"
              value={inputZipcode}
              onChange={(e) => handleZipcodeChange(e.target.value)}
              maxLength={10}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={autoDetectLocation}
              disabled={loading}
              title="Auto-detect zipcode from your location"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
            {error}
          </div>
        )}

        <Button
          onClick={handleSaveLocation}
          disabled={!zipcode || isUpdatingLocation || !!error}
          className="w-full"
        >
          {isUpdatingLocation && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Location
        </Button>
      </CardContent>
    </Card>
  );
};

export default LocationSettings;