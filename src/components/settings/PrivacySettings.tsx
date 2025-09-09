
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const PrivacySettings: React.FC = () => {
  const navigate = useNavigate();
  const [showLocation, setShowLocation] = useState(true);
  const [vacationMode, setVacationMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load current settings
  useEffect(() => {
    const loadSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('show_location, vacation_mode')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profile) {
          setShowLocation(profile.show_location ?? true);
          setVacationMode(profile.vacation_mode ?? false);
        }
      }
      setInitialLoading(false);
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({
          show_location: showLocation,
          vacation_mode: vacationMode,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      if (error) {
        toast.error('Failed to save privacy settings');
      } else {
        toast.success('Privacy settings saved successfully');
      }
    } else {
      navigate('/auth');
    }
    setLoading(false);
  };

  if (initialLoading) {
    return (
      <Card>
        <CardHeader className="hidden md:block">
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>
            Control your privacy and visibility.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8 md:pt-6">
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="hidden md:block">
        <CardTitle>Privacy Settings</CardTitle>
        <CardDescription>
          Control your privacy and visibility.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-8 md:pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Show Location</h3>
            <p className="text-sm text-muted-foreground">
              Display your location on your public profile.
            </p>
          </div>
          <Switch 
            checked={showLocation} 
            onCheckedChange={setShowLocation}
            disabled={loading}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Vacation Mode</h3>
            <p className="text-sm text-muted-foreground">
              Hide your items from matching and disable trade notifications while you're away.
            </p>
          </div>
          <Switch 
            checked={vacationMode} 
            onCheckedChange={setVacationMode}
            disabled={loading}
          />
        </div>
        
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PrivacySettings;
