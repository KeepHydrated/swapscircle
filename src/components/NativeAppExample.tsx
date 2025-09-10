import React from 'react';
import { useIsNativeApp, usePlatform } from '@/hooks/useIsNativeApp';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Example component showing how to create different experiences
 * for native app vs mobile web
 */
export function NativeAppExample() {
  const isNativeApp = useIsNativeApp();
  const platform = usePlatform();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Platform Detection
          <Badge variant={isNativeApp ? "default" : "secondary"}>
            {isNativeApp ? "Native App" : "Mobile Web"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Platform: {platform}</p>
          <p className="text-sm text-muted-foreground">
            Native App: {isNativeApp ? "Yes" : "No"}
          </p>
        </div>

        {/* Different content based on platform */}
        {isNativeApp ? (
          <div className="space-y-2">
            <h4 className="font-medium text-green-600">Native App Features:</h4>
            <ul className="text-sm space-y-1">
              <li>• Push notifications</li>
              <li>• Native navigation</li>
              <li>• Camera access</li>
              <li>• Offline support</li>
            </ul>
            <Button className="w-full">Open Native Feature</Button>
          </div>
        ) : (
          <div className="space-y-2">
            <h4 className="font-medium text-blue-600">Mobile Web Features:</h4>
            <ul className="text-sm space-y-1">
              <li>• Instant access</li>
              <li>• No installation required</li>
              <li>• Share via URL</li>
              <li>• Always up-to-date</li>
            </ul>
            <Button variant="outline" className="w-full">
              Download Our App
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}