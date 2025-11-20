import MainLayout from '@/components/layout/MainLayout';
import { RecommendedTradesSlider } from '@/components/trade/RecommendedTradesSlider';
import { RecommendedFriendsSection } from '@/components/friends/RecommendedFriendsSection';
import RecommendedCategoriesSection from '@/components/categories/RecommendedCategoriesSection';

const Test2 = () => {
  return (
    <MainLayout>
      <div className="bg-background min-h-screen space-y-8 p-6">
        <RecommendedTradesSlider />
        <RecommendedCategoriesSection />
        <RecommendedFriendsSection />
      </div>
    </MainLayout>
  );
};

export default Test2;