import { useState, useCallback } from 'react';

interface UseLocationReturn {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
  hasLocation: boolean;
  getCurrentLocation: () => void;
}

export const useLocation = (): UseLocationReturn => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);
    setError(null);

    // Try high accuracy first, fallback to low accuracy if timeout
    const tryGetLocation = (useHighAccuracy: boolean, timeoutMs: number) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setLoading(false);
        },
        (error) => {
          // If high accuracy times out, try again with lower accuracy
          if (useHighAccuracy && error.code === error.TIMEOUT) {
            console.log('High accuracy timeout, trying with lower accuracy...');
            tryGetLocation(false, 30000);
            return;
          }

          setLoading(false);
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setError('Please allow location access to set your GPS coordinates');
              break;
            case error.POSITION_UNAVAILABLE:
              setError('GPS location unavailable. Try moving to an area with better signal');
              break;
            case error.TIMEOUT:
              setError('Location request timed out. Please try again or check your internet connection');
              break;
            default:
              setError('Unable to get location. Please try again');
              break;
          }
        },
        {
          enableHighAccuracy: useHighAccuracy,
          timeout: timeoutMs,
          maximumAge: useHighAccuracy ? 300000 : 600000 // 5min for high accuracy, 10min for low
        }
      );
    };

    // Start with high accuracy, 15 second timeout
    tryGetLocation(true, 15000);
  }, []);

  return {
    latitude,
    longitude,
    error,
    loading,
    hasLocation: latitude !== null && longitude !== null,
    getCurrentLocation
  };
};