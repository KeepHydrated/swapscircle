import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

/**
 * Hook to detect if the app is running as a native mobile app
 * vs running in a mobile browser
 */
export function useIsNativeApp() {
  const [isNativeApp, setIsNativeApp] = useState(false);

  useEffect(() => {
    // For development: Force native app preview mode
    setIsNativeApp(true);
    localStorage.setItem('nativeAppPreview', 'true');
  }, []);

  return isNativeApp;
}

/**
 * Hook to get the specific platform (ios, android, web)
 */
export function usePlatform() {
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web'>('web');

  useEffect(() => {
    setPlatform(Capacitor.getPlatform() as 'ios' | 'android' | 'web');
  }, []);

  return platform;
}