
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ProfileSettings from '@/components/settings/ProfileSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import PrivacySettings from '@/components/settings/PrivacySettings';
import AccountSettings from '@/components/settings/AccountSettings';
import HiddenItemsSettings from '@/components/settings/HiddenItemsSettings';
import { useIsMobile } from '@/hooks/use-mobile';
import { User, Bell, Shield, Settings as SettingsIcon, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { value: 'profile', label: 'Profile Settings', icon: User },
  { value: 'notifications', label: 'Notifications', icon: Bell },
  { value: 'privacy', label: 'Privacy', icon: Shield },
  { value: 'hidden', label: 'Hidden Items', icon: EyeOff },
  { value: 'account', label: 'Account', icon: SettingsIcon },
];

const Settings: React.FC = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('profile');

  // Mobile: horizontal tabs
  if (isMobile) {
    return (
      <MainLayout>
        <div className="bg-card rounded-lg shadow-sm overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full flex rounded-none h-12 bg-white border-b justify-start overflow-x-auto">
              {menuItems.map((item) => (
                <TabsTrigger 
                  key={item.value}
                  value={item.value} 
                  className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none data-[state=active]:shadow-none whitespace-nowrap px-2 text-sm"
                >
                  {item.label.replace(' Settings', '')}
                </TabsTrigger>
              ))}
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

            <TabsContent value="hidden" className="p-6">
              <HiddenItemsSettings />
            </TabsContent>

            <TabsContent value="account" className="p-3 pt-1">
              <AccountSettings />
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    );
  }

  // Desktop/Tablet: vertical sidebar menu
  return (
    <MainLayout>
      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        <div className="flex min-h-[600px]">
          {/* Sidebar */}
          <div className="w-56 border-r bg-muted/30 p-4">
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.value}
                    onClick={() => setActiveTab(item.value)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      activeTab === item.value
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'privacy' && <PrivacySettings />}
            {activeTab === 'hidden' && <HiddenItemsSettings />}
            {activeTab === 'account' && <AccountSettings />}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
