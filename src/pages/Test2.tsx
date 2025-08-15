import MainLayout from '@/components/layout/MainLayout';
import AdminSupportChat from '@/components/chat/AdminSupportChat';

const Test2 = () => {
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

export default Test2;