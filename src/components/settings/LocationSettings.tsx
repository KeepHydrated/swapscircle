import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLocation as useGeoLocation } from '@/hooks/useLocation';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, MapPin, Loader2, ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LocationInput from '@/components/LocationInput';

export default function LocationSettings() {
  const [profile, setProfile] = useState<any>(null);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [hasUnsavedLocation, setHasUnsavedLocation] = useState(false);
  const location = useGeoLocation();
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const updateLocationInDatabase = async (lat: number, lng: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        location: `${lat},${lng}`,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update location",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Location Updated",
        description: "Your location has been saved successfully",
      });
      fetchProfile();
    }
  };

  const handleUseGPS = () => {
    setIsUpdatingLocation(true);
    location.getCurrentLocation();
  };

  const handleSaveLocation = async () => {
    if (location.hasLocation) {
      await updateLocationInDatabase(location.latitude!, location.longitude!);
      setHasUnsavedLocation(false);
    }
  };

  // Track when GPS location is obtained to show save button
  useEffect(() => {
    if (isUpdatingLocation && location.hasLocation) {
      setHasUnsavedLocation(true);
      setIsUpdatingLocation(false);
    } else if (isUpdatingLocation && location.error) {
      setIsUpdatingLocation(false);
    }
  }, [location.hasLocation, location.error, isUpdatingLocation]);

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Use Current Location */}
        <Card className="shadow-primary">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <RefreshCw className="h-6 w-6" />
              <h2 className="text-xl font-semibold">Update Location</h2>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground min-w-fit">
                {location.hasLocation 
                  ? `${location.latitude?.toFixed(4)}, ${location.longitude?.toFixed(4)}` 
                  : 'No location detected'}
              </div>

              <Button 
                onClick={hasUnsavedLocation ? handleSaveLocation : handleUseGPS}
                variant="default"
                disabled={location.loading}
              >
                {location.loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Getting Location...
                  </>
                ) : hasUnsavedLocation ? (
                  <>
                    <Save className="h-4 w-4" />
                    Save New Location
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Update Location
                  </>
                )}
              </Button>
            </div>

            {location.error && (
              <div className="text-center text-sm text-destructive">
                {location.error}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}