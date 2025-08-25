import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.197cafe874c14d96adfbf6a92436ceae',
  appName: 'SwapsCircle',
  webDir: 'dist',
  server: {
    url: 'https://197cafe8-74c1-4d96-adfb-f6a92436ceae.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;