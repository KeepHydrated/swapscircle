import MainLayout from '@/components/layout/MainLayout';
import { RecommendedTradesSlider } from '@/components/trade/RecommendedTradesSlider';
import { RecommendedFriendsSection } from '@/components/friends/RecommendedFriendsSection';
import RecommendedCategoriesSection from '@/components/categories/RecommendedCategoriesSection';
import TradeOptionsSection from '@/components/trade/TradeOptionsSection';
import RecommendedLocalTradesSection from '@/components/trade/RecommendedLocalTradesSection';
import MatchesSection from '@/components/items/MatchesSection';

const Test2 = () => {
  return (
    <MainLayout>
      <div className="bg-background min-h-screen space-y-8 p-6">
        <MatchesSection />
        <RecommendedTradesSlider />
        <TradeOptionsSection />
        <RecommendedLocalTradesSection />
        <RecommendedCategoriesSection />
        <RecommendedFriendsSection />
      </div>
    </MainLayout>
  );
};

export default Test2;