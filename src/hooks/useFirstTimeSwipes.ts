import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

const SWIPE_COUNT_KEY = 'swipe_count_';

export const useFirstTimeSwipes = () => {
  const { user } = useAuth();
  const [swipeCount, setSwipeCount] = useState<number>(0);
  const [shouldShowToast, setShouldShowToast] = useState<boolean>(false);

  useEffect(() => {
    if (user?.id) {
      const key = `${SWIPE_COUNT_KEY}${user.id}`;
      const storedCount = localStorage.getItem(key);
      const count = storedCount ? parseInt(storedCount, 10) : 0;
      setSwipeCount(count);
      setShouldShowToast(count < 2);
    }
  }, [user?.id]);

  const incrementSwipeCount = () => {
    if (user?.id && swipeCount < 2) {
      const newCount = swipeCount + 1;
      const key = `${SWIPE_COUNT_KEY}${user.id}`;
      localStorage.setItem(key, newCount.toString());
      setSwipeCount(newCount);
      setShouldShowToast(newCount < 2);
    }
  };

  return {
    shouldShowToast,
    incrementSwipeCount,
    swipeCount,
  };
};
