import MainLayout from '@/components/layout/MainLayout';
import { RecommendedTradesSlider } from '@/components/trade/RecommendedTradesSlider';
import { RecommendedFriendsSection } from '@/components/friends/RecommendedFriendsSection';
import RecommendedCategoriesSection from '@/components/categories/RecommendedCategoriesSection';
import TradeOptionsSection from '@/components/trade/TradeOptionsSection';

const Test2 = () => {
  return (
    <MainLayout>
      <div className="bg-background min-h-screen space-y-8 p-6">
        <RecommendedTradesSlider />
        <TradeOptionsSection />
        <RecommendedCategoriesSection />
        <RecommendedFriendsSection />
      </div>
    </MainLayout>
  );
};

export default Test2;