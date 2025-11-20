import MainLayout from '@/components/layout/MainLayout';
import { RecommendedTradesSlider } from '@/components/trade/RecommendedTradesSlider';
import { RecommendedFriendsSection } from '@/components/friends/RecommendedFriendsSection';

const Test2 = () => {
  return (
    <MainLayout>
      <div className="bg-background min-h-screen">
        <RecommendedTradesSlider />
        <RecommendedFriendsSection />
      </div>
    </MainLayout>
  );
};

export default Test2;