import { useState, useCallback } from 'react';

interface UseLocationReturn {
  zipcode: string | null;
  error: string | null;
  loading: boolean;
  hasLocation: boolean;
  setZipcode: (zipcode: string) => void;
  validateZipcode: (zipcode: string) => boolean;
  autoDetectLocation: () => void;
}

export const useLocation = (): UseLocationReturn => {
  const [zipcode, setZipcodeState] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateZipcode = useCallback((zip: string): boolean => {
    // US zipcode validation (5 digits or 5+4 format)
    const zipcodeRegex = /^\d{5}(-\d{4})?$/;
    return zipcodeRegex.test(zip.trim());
  }, []);

  const setZipcode = useCallback((zip: string) => {
    setError(null);
    if (zip.trim() === '') {
      setZipcodeState(null);
      return;
    }
    
    if (validateZipcode(zip)) {
      setZipcodeState(zip.trim());
    } else {
      setError('Please enter a valid US zipcode (e.g., 12345 or 12345-6789)');
    }
  }, [validateZipcode]);

  // Convert GPS coordinates to zipcode using free geocoding API
  const convertCoordsToZipcode = async (lat: number, lng: number): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await response.json();
      
      if (data.postcode) {
        return data.postcode;
      }
      return null;
    } catch (error) {
      console.error('Error converting coordinates to zipcode:', error);
      return null;
    }
  };

  // Auto-detect location using GPS and convert to zipcode
  const autoDetectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    // Clear previous zipcode and error
    setZipcodeState(null);
    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const detectedZipcode = await convertCoordsToZipcode(latitude, longitude);
          
          if (detectedZipcode) {
            setZipcodeState(detectedZipcode);
            console.log('Auto-detected zipcode:', detectedZipcode);
          } else {
            setError('Could not determine zipcode from your location');
          }
        } catch (error) {
          setError('Failed to convert location to zipcode');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Please allow location access to auto-detect your zipcode');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location unavailable. Please enter your zipcode manually');
            break;
          case error.TIMEOUT:
            setError('Location request timed out. Please try again');
            break;
          default:
            setError('Unable to detect location. Please enter your zipcode manually');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000 // 5 minutes
      }
    );
  }, []);

  return {
    zipcode,
    error,
    loading,
    hasLocation: zipcode !== null,
    setZipcode,
    validateZipcode,
    autoDetectLocation
  };
};