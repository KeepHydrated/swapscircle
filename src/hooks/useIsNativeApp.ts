import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

/**
 * Hook to detect if the app is running as a native mobile app
 * vs running in a mobile browser
 */
export function useIsNativeApp() {
  const [isNativeApp, setIsNativeApp] = useState(false);

  useEffect(() => {
    // Check for development override via URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const forceNative = urlParams.get('nativePreview') === 'true';
    
    // Check for localStorage override for persistent testing
    const localStorageOverride = localStorage.getItem('nativeAppPreview') === 'true';
    
    if (forceNative || localStorageOverride) {
      setIsNativeApp(true);
      // Store in localStorage for persistence
      localStorage.setItem('nativeAppPreview', 'true');
    } else {
      // Normal Capacitor detection
      setIsNativeApp(Capacitor.isNativePlatform());
    }
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