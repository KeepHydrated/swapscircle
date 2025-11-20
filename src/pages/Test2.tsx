import MainLayout from '@/components/layout/MainLayout';
import { RecommendedTradesSlider } from '@/components/trade/RecommendedTradesSlider';
import { RecommendedTradesSection } from '@/components/trade/RecommendedTradesSection';

const Test2 = () => {
  return (
    <MainLayout>
      <div className="bg-background min-h-screen">
        <RecommendedTradesSlider />
        <RecommendedTradesSection />
      </div>
    </MainLayout>
  );
};

export default Test2;