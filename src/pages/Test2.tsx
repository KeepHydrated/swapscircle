import MainLayout from '@/components/layout/MainLayout';
import AdminSupportChat from '@/components/chat/AdminSupportChat';

const Test2 = () => {
  return (
    <MainLayout>
      <div className="h-screen overflow-hidden bg-background">
        <div className="h-full p-6 overflow-hidden">
          <AdminSupportChat />
        </div>
      </div>
    </MainLayout>
  );
};

export default Test2;