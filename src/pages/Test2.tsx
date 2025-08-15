import MainLayout from '@/components/layout/MainLayout';
import AdminSupportChat from '@/components/chat/AdminSupportChat';

const Test2 = () => {
  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Support Chat</h1>
            <p className="text-muted-foreground">
              Manage and respond to user support conversations
            </p>
          </div>
          <AdminSupportChat />
        </div>
      </div>
    </MainLayout>
  );
};

export default Test2;