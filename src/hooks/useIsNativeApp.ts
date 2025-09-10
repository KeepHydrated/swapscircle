import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

/**
 * Hook to detect if the app is running as a native mobile app
 * vs running in a mobile browser
 */
export function useIsNativeApp() {
  const [isNativeApp, setIsNativeApp] = useState(false);

  useEffect(() => {
    // Capacitor.isNativePlatform() returns true for iOS/Android apps
    // and false for web/PWA
    setIsNativeApp(Capacitor.isNativePlatform());
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