import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const usePageViewTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        // Track the page view
        await supabase
          .from('page_views')
          .insert({
            page_path: location.pathname,
            user_agent: navigator.userAgent,
            referrer: document.referrer || null
          });
      } catch (error) {
        // Silently fail if tracking fails to not disrupt user experience
        console.debug('Page view tracking failed:', error);
      }
    };

    trackPageView();
  }, [location.pathname]);
};