
export {};

declare global {
  interface Window {
    lastLocationToast?: number;
    locationTracker?: { stopTracking: () => void };
    SpeechRecognition?: typeof SpeechRecognition;
    webkitSpeechRecognition?: typeof SpeechRecognition;
    Capacitor?: {
      isNativePlatform: () => boolean;
      Plugins?: {
        Contacts?: any;
        SMS?: any;
      };
    };
  }
}
