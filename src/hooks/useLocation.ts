import { useState, useCallback } from 'react';

interface UseLocationReturn {
  zipcode: string | null;
  error: string | null;
  loading: boolean;
  hasLocation: boolean;
  setZipcode: (zipcode: string) => void;
  validateZipcode: (zipcode: string) => boolean;
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

  return {
    zipcode,
    error,
    loading,
    hasLocation: zipcode !== null,
    setZipcode,
    validateZipcode
  };
};