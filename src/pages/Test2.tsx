import MainLayout from '@/components/layout/MainLayout';
import AdminSupportChat from '@/components/chat/AdminSupportChat';

const Test2 = () => {
  return (
    <MainLayout>
      <div className="h-screen overflow-hidden bg-background">
        <div className="h-full flex flex-col overflow-hidden">
          <div className="flex-1 p-6 overflow-hidden min-h-0">
            <AdminSupportChat />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Test2;