import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import SupportChat from '@/components/chat/SupportChat';
import { useIsMobile } from '@/hooks/use-mobile';

const CustomerSupport = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // If not mobile, redirect to home and show popup
  if (!isMobile) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-lg font-semibold">Customer Support</h1>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Support Chat Component */}
      <div className="p-4">
        <SupportChat embedded={true} />
      </div>
    </div>
  );
};

export default CustomerSupport;