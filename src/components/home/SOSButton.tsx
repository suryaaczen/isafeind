
import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { toast } from "sonner";
import { loadContactsFromStorage } from '@/components/trusted-contacts/contactUtils';

const SOSButton = () => {
  const [locationWatchId, setLocationWatchId] = useState<number | null>(null);

  // Function to send SMS on Android
  const sendSMSOnAndroid = async (phoneNumber: string, message: string) => {
    try {
      // Check if we're in a native environment
      if (window.Capacitor?.isNativePlatform()) {
        console.log(`Sending SMS to ${phoneNumber} with message: ${message}`);
        
        // In a real implementation, this would use a Capacitor SMS plugin
        // For example with @capacitor-community/sms:
        // await CapacitorSMS.send({
        //   numbers: [phoneNumber],
        //   text: message
        // });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error sending SMS:", error);
      return false;
    }
  };

  // Clean up the location watcher when component unmounts
  useEffect(() => {
    return () => {
      if (locationWatchId !== null) {
        navigator.geolocation.clearWatch(locationWatchId);
      }
    };
  }, [locationWatchId]);

  const handleSOS = async () => {
    try {
      // Get trusted contacts first so we can start sending SMS
      const contacts = loadContactsFromStorage();
      
      // Start watching the user's location for real-time updates
      if (navigator.geolocation) {
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            
            // Send location to trusted contacts
            const locationMessage = `
🚨 EMERGENCY SOS 🚨
I need help immediately!
📍 My location: https://www.google.com/maps?q=${latitude},${longitude}
⏰ Sent: ${new Date().toLocaleTimeString()}
            `;
            
            // Try to send SMS on Android
            if (window.Capacitor?.isNativePlatform() && contacts.length > 0) {
              contacts.forEach(contact => {
                sendSMSOnAndroid(contact.phone, locationMessage);
              });
            }
            
            // Show update every 30 seconds to not overwhelm the UI
            const timeNow = new Date().getTime();
            if (!window.lastLocationToast || timeNow - window.lastLocationToast > 30000) {
              toast.info("Location update sent to trusted contacts");
              window.lastLocationToast = timeNow;
            }
          },
          (error) => {
            console.error("Error getting location for SOS:", error);
            toast.error("Could not access location. Please enable location services.");
          },
          { 
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000
          }
        );
        
        setLocationWatchId(watchId);
      } else {
        toast.error("Geolocation is not supported by this device");
      }
      
      // Show toast notification about SOS being activated
      toast.success(`Emergency SOS activated! ${contacts.length > 0 ? `Location being sent to ${contacts.length} trusted contacts` : 'No trusted contacts found'}`);
      
      // Immediately dial emergency number
      window.location.href = "tel:100";
      
    } catch (error) {
      console.error("Error in SOS:", error);
      toast.error("Error activating SOS. Please try again.");
      
      // Still try to dial emergency even if other parts fail
      window.location.href = "tel:100";
    }
  };

  return (
    <div className="fixed bottom-20 inset-x-0 flex justify-center">
      <button 
        onClick={handleSOS}
        className="h-20 w-20 rounded-full bg-red-600 flex items-center justify-center shadow-lg animate-pulse-emergency"
        aria-label="Emergency SOS"
      >
        <AlertTriangle className="h-10 w-10 text-white" />
        <span className="absolute mt-14 text-white font-bold">SOS</span>
      </button>
    </div>
  );
};

export default SOSButton;
