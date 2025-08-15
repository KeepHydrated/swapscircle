import MainLayout from '@/components/layout/MainLayout';
import AdminSupportChat from '@/components/chat/AdminSupportChat';

const Test2 = () => {
  return (
    <MainLayout>
      <div className="h-screen overflow-hidden bg-background">
        <div className="h-full flex flex-col">
          <div className="flex-1 pt-4 px-6 pb-6 overflow-hidden">
            <AdminSupportChat />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Test2;