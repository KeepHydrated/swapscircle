import React from 'react';
import { Button } from '@/components/ui/button';
import { Smartphone, Globe } from 'lucide-react';
import { useIsNativeApp } from '@/hooks/useIsNativeApp';
import { useIsMobile } from '@/hooks/use-mobile';

export function NativePreviewToggle() {
  const isNativeApp = useIsNativeApp();
  const isMobile = useIsMobile();

  const toggleNativePreview = () => {
    const current = localStorage.getItem('nativeAppPreview') === 'true';
    localStorage.setItem('nativeAppPreview', (!current).toString());
    window.location.reload();
  };

  // Hide on mobile
  if (isMobile) return null;

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={toggleNativePreview}
        variant={isNativeApp ? "default" : "outline"}
        size="sm"
        className="fixed bottom-4 right-4 z-50 bg-white shadow-lg border-2"
      >
        {isNativeApp ? (
          <>
            <Globe className="w-4 h-4 mr-2" />
            Switch to Web
          </>
        ) : (
          <>
            <Smartphone className="w-4 h-4 mr-2" />
            Switch to Native
          </>
        )}
      </Button>
    </>
  );
}