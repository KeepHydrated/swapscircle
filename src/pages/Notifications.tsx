
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Bell } from 'lucide-react';

const Notifications: React.FC = () => {
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground mt-1">View your alerts and updates</p>
      </div>
      
      <div className="bg-card rounded-lg shadow-sm p-12 flex flex-col items-center justify-center">
        <Bell className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-medium text-muted-foreground">No notifications yet</h2>
        <p className="text-muted-foreground mt-2">You'll see your market alerts and updates here</p>
      </div>
    </MainLayout>
  );
};

export default Notifications;
