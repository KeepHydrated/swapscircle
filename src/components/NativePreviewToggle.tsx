import React from 'react';
import { Button } from '@/components/ui/button';
import { Smartphone, Globe } from 'lucide-react';
import { useIsNativeApp } from '@/hooks/useIsNativeApp';

export function NativePreviewToggle() {
  const isNativeApp = useIsNativeApp();

  const toggleNativePreview = () => {
    const current = localStorage.getItem('nativeAppPreview') === 'true';
    localStorage.setItem('nativeAppPreview', (!current).toString());
    window.location.reload();
  };

  return (
    <>
      {/* Native Mode Indicator Banner */}
      {isNativeApp && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white text-center py-2 text-sm font-medium">
          📱 NATIVE APP PREVIEW MODE
        </div>
      )}
      
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