import MainLayout from '@/components/layout/MainLayout';
import { RecommendedTradesSlider } from '@/components/trade/RecommendedTradesSlider';

const Test2 = () => {
  return (
    <MainLayout>
      <div className="bg-background min-h-screen">
        <RecommendedTradesSlider />
      </div>
    </MainLayout>
  );
};

export default Test2;