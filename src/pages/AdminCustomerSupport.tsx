import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AdminSupportChat from '@/components/chat/AdminSupportChat';
import MainLayout from '@/components/layout/MainLayout';

const AdminCustomerSupport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.email !== 'nadiachibri@gmail.com') {
      navigate('/');
    }
  }, [user, navigate]);

  // Don't render if user is not authorized
  if (!user || user.email !== 'nadiachibri@gmail.com') {
    return null;
  }

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