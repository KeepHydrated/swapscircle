
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProfileSettings from '@/components/settings/ProfileSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import PrivacySettings from '@/components/settings/PrivacySettings';
import AccountSettings from '@/components/settings/AccountSettings';
import HiddenItemsSettings from '@/components/settings/HiddenItemsSettings';
import { useIsMobile } from '@/hooks/use-mobile';
import { User, Bell, Shield, Settings as SettingsIcon, EyeOff, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';

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

  const activeItem = menuItems.find(item => item.value === activeTab) || menuItems[0];
  const ActiveIcon = activeItem.icon;

  // Mobile: dropdown menu
  if (isMobile) {
    return (
      <MainLayout>
        <div className="bg-card rounded-lg shadow-sm overflow-hidden">
          {/* Dropdown menu for mobile */}
          <div className="p-4 border-b">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <ActiveIcon className="h-4 w-4" />
                    {activeItem.label}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[calc(100vw-2rem)] bg-popover border border-border shadow-lg">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem
                      key={item.value}
                      onClick={() => setActiveTab(item.value)}
                      className={cn(
                        "flex items-center gap-2 cursor-pointer",
                        activeTab === item.value && "bg-muted"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content */}
          <div className="p-4">
            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'privacy' && <PrivacySettings />}
            {activeTab === 'hidden' && <HiddenItemsSettings />}
            {activeTab === 'account' && <AccountSettings />}
          </div>
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
