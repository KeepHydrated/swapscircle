
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ProfileSettings from '@/components/settings/ProfileSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import PrivacySettings from '@/components/settings/PrivacySettings';
import LocationSettings from '@/components/settings/LocationSettings';

const Settings: React.FC = () => {
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>
      
      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full flex rounded-none h-12 bg-white border-b justify-start">
            <TabsTrigger 
              value="profile" 
              className="flex-1 md:flex-none md:min-w-[180px] data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none data-[state=active]:shadow-none"
            >
              Profile Settings
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="flex-1 md:flex-none md:min-w-[180px] data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none data-[state=active]:shadow-none"
            >
              Notifications
            </TabsTrigger>
            <TabsTrigger 
              value="privacy" 
              className="flex-1 md:flex-none md:min-w-[180px] data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none data-[state=active]:shadow-none"
            >
              Privacy
            </TabsTrigger>
            <TabsTrigger 
              value="location" 
              className="flex-1 md:flex-none md:min-w-[180px] data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none data-[state=active]:shadow-none"
            >
              Location
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="p-6">
            <ProfileSettings />
          </TabsContent>

          <TabsContent value="notifications" className="p-6">
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="privacy" className="p-6">
            <PrivacySettings />
          </TabsContent>

          <TabsContent value="location" className="p-6">
            <LocationSettings />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;
