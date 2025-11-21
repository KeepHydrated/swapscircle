import MainLayout from '@/components/layout/MainLayout';
import { RecommendedTradesSlider } from '@/components/trade/RecommendedTradesSlider';
import { RecommendedFriendsSection } from '@/components/friends/RecommendedFriendsSection';
import RecommendedCategoriesSection from '@/components/categories/RecommendedCategoriesSection';
import RecommendedLocalTradesSection from '@/components/trade/RecommendedLocalTradesSection';
import MatchesSection from '@/components/items/MatchesSection';
import HeroBanner from '@/components/home/HeroBanner';

const Test2 = () => {
  return (
    <MainLayout>
      <div className="bg-background min-h-screen space-y-8 p-6">
        <HeroBanner />
        <MatchesSection />
        <RecommendedTradesSlider />
        <RecommendedLocalTradesSection />
        <RecommendedCategoriesSection />
        <RecommendedFriendsSection />
      </div>
    </MainLayout>
  );
};

export default Test2;