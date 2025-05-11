
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { User } from 'lucide-react';

const Profile: React.FC = () => {
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">View and manage your profile</p>
      </div>
      
      <div className="bg-card rounded-lg shadow-sm p-12 flex flex-col items-center justify-center">
        <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center mb-4">
          <User className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-medium">User Profile</h2>
        <p className="text-muted-foreground mt-2">Profile section coming soon</p>
      </div>
    </MainLayout>
  );
};

export default Profile;
