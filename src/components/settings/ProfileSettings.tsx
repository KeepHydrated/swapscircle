import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Pencil, Upload, Check, ChevronsUpDown, RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { uploadAvatarImage } from '@/services/authService';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '@/hooks/useLocation';

// Create form schema
const profileFormSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  bio: z.string().max(500, {
    message: "Bio must be at most 500 characters.",
  }),
  location: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfileSettings: React.FC = () => {
  // Get user data from auth context
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || "");
  const [locationOpen, setLocationOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [hasUnsavedLocation, setHasUnsavedLocation] = useState(false);
  const location = useLocation();

  // Major US cities for dropdown
  const cities = [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego',
    'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco',
    'Indianapolis', 'Seattle', 'Denver', 'Boston', 'El Paso', 'Detroit', 'Nashville', 'Memphis', 'Portland',
    'Oklahoma City', 'Las Vegas', 'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno',
    'Mesa', 'Sacramento', 'Atlanta', 'Kansas City', 'Colorado Springs', 'Miami', 'Raleigh', 'Omaha',
    'Long Beach', 'Virginia Beach', 'Oakland', 'Minneapolis', 'Tulsa', 'Arlington', 'Tampa', 'New Orleans',
    'Wichita', 'Cleveland', 'Bakersfield', 'Aurora', 'Anaheim', 'Honolulu', 'Santa Ana', 'Riverside',
    'Corpus Christi', 'Lexington', 'Stockton', 'Henderson', 'Saint Paul', 'St. Louis', 'Cincinnati',
    'Pittsburgh', 'Greensboro', 'Anchorage', 'Plano', 'Lincoln', 'Orlando', 'Irvine', 'Newark', 'Durham',
    'Chula Vista', 'Toledo', 'Fort Wayne', 'St. Petersburg', 'Laredo', 'Jersey City', 'Chandler',
    'Madison', 'Lubbock', 'Scottsdale', 'Reno', 'Buffalo', 'Gilbert', 'Glendale', 'North Las Vegas',
    'Winston-Salem', 'Chesapeake', 'Norfolk', 'Fremont', 'Garland', 'Irving', 'Hialeah', 'Richmond',
    'Boise', 'Spokane', 'Baton Rouge'
  ].sort();

  // Initialize form with empty values at first, update once Supabase data loads
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      bio: "",
      location: "",
    },
  });

  // ---- NEW HELPER FUNCTION TO CREATE PROFILE ROW IF MISSING ----
  const createProfileIfMissing = async () => {
    if (!user) return;
    // Attempt to fetch profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();
    if (!profile) {
      // No profile row exists! Try to create minimal default row
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      if (!insertError) {
        // Optionally reload page to pick up new profile row.
        // window.location.reload();
      }
    }
  };

  // Fetch user profile data from Supabase on mount and set form values
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setInitialLoading(true);

      // Ensure profile row exists!
      await createProfileIfMissing();

      console.log("[ProfileSettings] Fetching profile from DB for user:", user.id);

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('username, name, bio, location, avatar_url')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        toast.error('Error loading profile');
        setInitialLoading(false);
        console.error("[ProfileSettings] Error loading profile:", error);
        return;
      }

      if (profile) {
        console.log("[ProfileSettings] Profile loaded:", profile);
        console.log("[ProfileSettings] User name:", user?.name);
        console.log("[ProfileSettings] Profile name:", profile?.name);
        console.log("[ProfileSettings] Profile username:", profile?.username);
        
        const finalDisplayName = (user?.name || profile?.name || profile?.username) ?? "";
        console.log("[ProfileSettings] Final display name:", finalDisplayName);
        console.log("[ProfileSettings] Setting displayName state to:", finalDisplayName);
        setDisplayName(finalDisplayName); // Set stable display name
        
        form.reset({
          username: finalDisplayName,
          bio: profile.bio ?? "",
          location: profile.location ?? "",
        });
        
        // Only set avatar URL from DB if it's in the correct bucket or if we don't have a local one
        const dbAvatarUrl = profile.avatar_url ?? "";
        console.log("[ProfileSettings] DB avatar URL:", dbAvatarUrl);
        console.log("[ProfileSettings] Current local avatar URL:", avatarUrl);
        
        // If the DB has an avatar URL that's in the wrong bucket (item-images), don't use it
        // unless we don't have a current avatar URL
        if (dbAvatarUrl && !dbAvatarUrl.includes('/item-images/')) {
          setAvatarUrl(dbAvatarUrl);
        } else if (!avatarUrl) {
          setAvatarUrl(dbAvatarUrl);
        }
      }
      setInitialLoading(false);
    };

    fetchProfile();
    // eslint-disable-next-line
  }, [user]);

  // Also update displayName when user changes (from AuthContext)
  useEffect(() => {
    if (user?.name && !displayName) {
      console.log("[ProfileSettings] User changed, updating displayName to:", user.name);
      setDisplayName(user.name);
    }
  }, [user?.name, displayName]);

  const handleUseGPS = () => {
    setIsUpdatingLocation(true);
    location.getCurrentLocation();
  };

  const handleSaveLocation = async () => {
    if (location.hasLocation) {
      // Update the form field with the coordinates
      form.setValue('location', `${location.latitude?.toFixed(4)}, ${location.longitude?.toFixed(4)}`);
      setHasUnsavedLocation(false);
      toast.success('Location coordinates added to your profile');
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

  // Handle form submission
  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    try {
      console.log("[ProfileSettings] Updating profile in DB for user:", user.id, "with data:", data, "avatar:", avatarUrl);
      const { error } = await supabase
        .from('profiles')
        .update({
          username: data.username,
          name: data.username, // Save the display name to both fields
          bio: data.bio,
          location: data.location,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error("[ProfileSettings] Error updating profile:", error);
        throw error;
      }

      // Also update name and avatar_url in AuthContext user object
      await updateProfile({
        name: data.username,
        avatar_url: avatarUrl,
      });

      console.log("[ProfileSettings] Profile updated successfully!");
      toast.success('Profile updated successfully');
      navigate('/profile');
    } catch (error) {
      console.error('[ProfileSettings] Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      // For now, create a local URL for the image to show immediate feedback
      const localUrl = URL.createObjectURL(file);
      setAvatarUrl(localUrl);

      // Upload to storage, update avatar URL in db
      try {
        console.log("[ProfileSettings] Uploading avatar image...");
        const imageUrl = await uploadAvatarImage(file);
        console.log("[ProfileSettings] Upload result:", imageUrl);
        
        if (imageUrl) {
          setAvatarUrl(imageUrl);
          console.log("[ProfileSettings] Setting avatar URL to:", imageUrl);

          // Save immediately to DB (optional)
          if (user) {
            const updateResult = await supabase
              .from("profiles")
              .update({ avatar_url: imageUrl, updated_at: new Date().toISOString() })
              .eq("id", user.id);
            
            console.log("[ProfileSettings] Database update result:", updateResult);
            
            await updateProfile({
              avatar_url: imageUrl,
            });

            console.log("[ProfileSettings] Profile picture uploaded and saved to db:", imageUrl);
            toast.success('Profile picture uploaded successfully');
          }
        } else {
          console.error("[ProfileSettings] Upload failed - no URL returned");
          toast.error('Upload failed - please try again');
        }
      } catch (uploadError) {
        console.error('[ProfileSettings] Upload failed, keeping local preview:', uploadError);
        toast.error('Upload failed - please try again');
      }
    } catch (error) {
      console.error('[ProfileSettings] Error handling avatar:', error);
      toast.error('Failed to update profile picture');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your profile information and avatar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-5 pb-6 mb-6 border-b">
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatarUrl} alt="Profile" />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
              {(() => {
                // Use stable displayName state, fallback to user name, then "User"
                const nameToUse = displayName || user?.name || "User";
                console.log("[ProfileSettings] Avatar initials using name:", nameToUse, "displayName state:", displayName, "user.name:", user?.name);
                return nameToUse.split(" ").map(name => name[0]).join("").substring(0, 2).toUpperCase();
              })()}
            </AvatarFallback>
          </Avatar>
          <div>
            <Button size="sm" className="relative" variant="outline" disabled={uploading}>
              {uploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Pencil className="mr-2 h-4 w-4" />
                  Change Avatar
                </>
              )}
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={uploading}
              />
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Recommended: Square JPG or PNG, at least 400x400 pixels. Max 5MB.
            </p>
          </div>
        </div>

        {initialLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Your username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <div className="space-y-2">
                      <div className="relative">
                        <FormControl>
                           <div className="flex">
                             <Input
                               placeholder="Type your location..."
                               value={field.value || ""}
                               onChange={(e) => {
                                 field.onChange(e.target.value);
                                 if (e.target.value && !locationOpen) setLocationOpen(true);
                               }}
                               onFocus={() => {
                                 if (field.value) setLocationOpen(true);
                               }}
                               onBlur={() => {
                                 setTimeout(() => setLocationOpen(false), 200);
                               }}
                               className="flex-1"
                             />
                            <Button 
                              type="button"
                              onClick={hasUnsavedLocation ? handleSaveLocation : handleUseGPS}
                              variant="default"
                              size="sm"
                              disabled={location.loading}
                              className="rounded-l-none border-l-0"
                            >
                              {location.loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : hasUnsavedLocation ? (
                                <RefreshCw className="h-4 w-4" />
                              ) : (
                                <RefreshCw className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        {locationOpen && field.value && (
                          <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
                            {cities
                              .filter(city => 
                                city.toLowerCase().includes(field.value.toLowerCase())
                              )
                              .slice(0, 10)
                              .map((city) => (
                                <div
                                  key={city}
                                  className="px-3 py-2 hover:bg-accent cursor-pointer text-sm"
                                  onClick={() => {
                                    field.onChange(city);
                                    setLocationOpen(false);
                                  }}
                                >
                                  {city}
                                </div>
                              ))}
                            {cities.filter(city => 
                              city.toLowerCase().includes(field.value.toLowerCase())
                            ).length === 0 && (
                              <div className="px-3 py-2 text-sm text-muted-foreground">
                                No matching cities found
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {location.error && (
                        <div className="text-center text-sm text-destructive">
                          {location.error}
                        </div>
                      )}
                    </div>
                    
                    <FormDescription>
                      City and state where you're located, or use GPS coordinates.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell a bit about yourself" 
                        className="min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Tell others about yourself and what kinds of items you like to trade.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Save Changes'}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;
