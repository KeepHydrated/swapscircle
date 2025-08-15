import MainLayout from '@/components/layout/MainLayout';
import AdminSupportChat from '@/components/chat/AdminSupportChat';

const Test2 = () => {
  return (
    <MainLayout>
      <div className="h-[calc(100vh-4rem)] overflow-hidden bg-background">
        <div className="h-full p-4">
          <AdminSupportChat />
        </div>
      </div>
    </MainLayout>
  );
};

export default Test2;