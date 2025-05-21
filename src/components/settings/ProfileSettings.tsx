
import React, { useEffect } from 'react';
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
import { Pencil } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Create form schema
const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
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

  // Initialize form with user data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      username: user?.email?.split('@')[0] || "",
      email: user?.email || "",
      bio: "",
      location: "",
    },
  });

  // Fetch user profile data when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (error) {
            console.error('Error fetching profile:', error);
            return;
          }
          
          if (data) {
            // Update form values with fetched profile data
            // Use type assertion to access the fields we know exist in the database
            const profileData = data as any;
            form.reset({
              name: profileData.name || user.name || "",
              username: user.email?.split('@')[0] || "",
              email: user.email || "",
              bio: profileData.bio || "",
              location: profileData.location || "",
            });
          }
        } catch (error) {
          console.error('Error fetching profile data:', error);
        }
      }
    };
    
    fetchUserProfile();
  }, [user, form]);

  // Handle form submission
  const onSubmit = async (data: ProfileFormValues) => {
    try {
      if (user) {
        // Update the profile in Supabase
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            name: data.name,
            email: user.email,
            bio: data.bio,
            location: data.location,
            updated_at: new Date().toISOString()
          });
        
        if (error) {
          console.error('Error updating profile in database:', error);
          toast.error('Failed to update profile in database');
          return;
        }
        
        // Update auth user profile (for name and avatar)
        await updateProfile({
          name: data.name,
          // We could add avatar_url here if implementing file uploads
        });
        
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length || !user) {
      return;
    }
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-avatar.${fileExt}`;
    
    try {
      // Check if the bucket exists and create it if it doesn't
      let { data: bucket } = await supabase.storage.getBucket('avatars');
      
      if (!bucket) {
        const { error: createBucketError } = await supabase.storage.createBucket('avatars', {
          public: true
        });
        
        if (createBucketError) {
          toast.error('Error creating storage bucket');
          return;
        }
      }
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });
      
      if (uploadError) {
        toast.error('Error uploading image');
        return;
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      if (urlData) {
        // Update user profile with new avatar URL
        await updateProfile({
          avatar_url: urlData.publicUrl
        });
        
        // Update the profile in database
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            avatar_url: urlData.publicUrl,
            updated_at: new Date().toISOString()
          });
          
        if (error) {
          console.error('Error updating avatar in database:', error);
          toast.error('Failed to update avatar in database');
          return;
        }
        
        toast.success('Profile picture updated');
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error('Failed to update profile picture');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your profile information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-5 pb-6 mb-6 border-b">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user?.avatar_url || "https://github.com/shadcn.png"} alt="Profile" />
            <AvatarFallback>{user?.name?.substring(0, 2) || "US"}</AvatarFallback>
          </Avatar>
          <div>
            <Button size="sm" className="relative" variant="outline">
              <Pencil className="mr-2 h-4 w-4" />
              Change Avatar
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Recommended: Square JPG or PNG, at least 400x400 pixels.
            </p>
          </div>
        </div>

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
                    <Input type="email" placeholder="Your email address" {...field} />
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
            
            <Button type="submit">Save Changes</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;
