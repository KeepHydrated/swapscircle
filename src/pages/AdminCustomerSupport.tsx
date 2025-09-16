import React from 'react';
import AdminSupportChat from '@/components/chat/AdminSupportChat';
import MainLayout from '@/components/layout/MainLayout';

const AdminCustomerSupport = () => {
  return (
    <MainLayout>
      <div className="bg-background">
        <div className="p-6">
          <AdminSupportChat />
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminCustomerSupport;