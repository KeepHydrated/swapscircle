
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ProfileSettings from '@/components/settings/ProfileSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import PrivacySettings from '@/components/settings/PrivacySettings';
import AccountSettings from '@/components/settings/AccountSettings';

const Settings: React.FC = () => {
  return (
    <MainLayout>
      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full flex rounded-none h-12 bg-white border-b justify-start overflow-x-visible">
            <TabsTrigger 
              value="profile" 
              className="flex-1 md:min-w-[180px] data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none data-[state=active]:shadow-none whitespace-nowrap px-2 md:px-4 text-sm"
            >
              <span className="md:hidden">Profile</span>
              <span className="hidden md:inline">Profile Settings</span>
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="flex-1 md:min-w-[180px] data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none data-[state=active]:shadow-none whitespace-nowrap px-2 md:px-4 text-sm"
            >
              <span className="md:hidden">Notifications</span>
              <span className="hidden md:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger 
              value="privacy" 
              className="flex-1 md:min-w-[180px] data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none data-[state=active]:shadow-none whitespace-nowrap px-2 md:px-4 text-sm"
            >
              <span className="md:hidden">Privacy</span>
              <span className="hidden md:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger 
              value="account" 
              className="flex-1 md:min-w-[180px] data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none data-[state=active]:shadow-none whitespace-nowrap px-2 md:px-4 text-sm"
            >
              <span className="md:hidden">Account</span>
              <span className="hidden md:inline">Account</span>
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


          <TabsContent value="account" className="p-3 pt-4">
            <AccountSettings />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;
