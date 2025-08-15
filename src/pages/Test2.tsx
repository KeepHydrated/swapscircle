import MainLayout from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';

const Test2 = () => {
  return (
    <MainLayout>
      <div className="h-screen bg-background overflow-hidden">
        <div className="h-full max-w-7xl mx-auto p-6">
          <Card className="p-8 h-full flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-foreground mb-4">Test2 Page</h1>
              <p className="text-muted-foreground text-lg">
                This is a blank page with the header included.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Test2;