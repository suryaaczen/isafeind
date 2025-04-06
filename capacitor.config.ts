
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.4eb2d98bb1314f1998be8f82d72294f6',
  appName: 'iSafe-guardian-alert-system',
  webDir: 'dist',
  server: {
    url: 'https://4eb2d98b-b131-4f19-98be-8f82d72294f6.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: "#B02A37",
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#FFFFFF",
    },
  }
};

export default config;
