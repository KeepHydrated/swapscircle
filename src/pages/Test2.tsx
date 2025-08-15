import MainLayout from '@/components/layout/MainLayout';
import AdminSupportChat from '@/components/chat/AdminSupportChat';

const Test2 = () => {
  return (
    <div className="h-screen overflow-hidden bg-background">
      <div className="h-full flex flex-col">
        <div className="p-6 pb-4 shrink-0">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Support Chat</h1>
          <p className="text-muted-foreground">
            Manage and respond to user support conversations
          </p>
        </div>
        <div className="flex-1 px-6 pb-6 overflow-hidden">
          <AdminSupportChat />
        </div>
      </div>
    </div>
  );
};

export default Test2;