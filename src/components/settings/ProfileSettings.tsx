
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Pencil, Upload } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { uploadItemImage } from '@/services/authService';
import { supabase } from '@/integrations/supabase/client';

// Create form schema
const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z
    .string()
    .email("Please enter a valid email address.")
    .optional()
    .or(z.literal("")), // <--- allow undefined or empty string
  bio: z.string().max(500, {
    message: "Bio must be at most 500 characters.",
  }),
  location: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfileSettings: React.FC = () => {
  // Get user data from auth context
  const { user, updateProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || "");
  const [initialLoading, setInitialLoading] = useState(true);

  // Initialize form with empty values at first, update once Supabase data loads
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      bio: "",
      location: "",
    },
  });

  // Fetch user profile data from Supabase on mount and set form values
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setInitialLoading(true);

      console.log("[ProfileSettings] Fetching profile from DB for user:", user.id);

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('name, email, username, bio, location, avatar_url')
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
        form.reset({
          name: profile.name ?? "",
          username: profile.username ?? "",
          email: profile.email ?? "",
          bio: profile.bio ?? "",
          location: profile.location ?? "",
        });
        setAvatarUrl(profile.avatar_url ?? "");
      }
      setInitialLoading(false);
    };

    fetchProfile();
    // eslint-disable-next-line
  }, [user]);

  // Handle form submission
  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    try {
      console.log("[ProfileSettings] Updating profile in DB for user:", user.id, "with data:", data, "avatar:", avatarUrl);
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          username: data.username,
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

      // Also update name/avatar_url in AuthContext user object
      await updateProfile({
        name: data.name,
        avatar_url: avatarUrl,
      });

      console.log("[ProfileSettings] Profile updated successfully!");
      toast.success('Profile updated successfully');
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
        const imageUrl = await uploadItemImage(file);
        if (imageUrl) {
          setAvatarUrl(imageUrl);

          // Save immediately to DB (optional)
          if (user) {
            await supabase
              .from("profiles")
              .update({ avatar_url: imageUrl, updated_at: new Date().toISOString() })
              .eq("id", user.id);
            
            await updateProfile({
              avatar_url: imageUrl,
            });
          }

          console.log("[ProfileSettings] Profile picture uploaded and saved to db:", imageUrl);
          toast.success('Profile picture uploaded successfully');
        }
      } catch (uploadError) {
        console.error('[ProfileSettings] Upload failed, keeping local preview:', uploadError);
        toast.success('Profile picture updated (preview only)');
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
            <AvatarImage src={avatarUrl || "https://github.com/shadcn.png"} alt="Profile" />
            <AvatarFallback>{user?.name?.substring(0, 2) || "US"}</AvatarFallback>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              </div>
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Your email address" {...field} disabled />
                    </FormControl>
                    <FormDescription>
                      Email cannot be changed from this form.
                    </FormDescription>
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
                    <FormControl>
                      <Input placeholder="Your location" {...field} />
                    </FormControl>
                    <FormDescription>
                      City and state where you're located.
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
