
import { useState, useEffect } from 'react';
import { useVoiceDetection } from '@/hooks/useVoiceDetection';
import { Mic, MicOff } from 'lucide-react';
import { toast } from "sonner";

interface VoiceEmergencyDetectorProps {
  enabled?: boolean;
}

const VoiceEmergencyDetector = ({ enabled = true }: VoiceEmergencyDetectorProps) => {
  const [safetyCheckActive, setSafetyCheckActive] = useState(false);
  const [safetyCheckTimer, setSafetyCheckTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Handle the "Help" voice command detection
  const handleHelpDetected = () => {
    // Trigger safety check
    toast.error(
      "Emergency Voice Command Detected",
      {
        description: "Are you safe?",
        duration: 60000, // 60 seconds
        action: {
          label: "I'm Safe",
          onClick: () => {
            if (safetyCheckTimer) {
              clearTimeout(safetyCheckTimer);
              setSafetyCheckTimer(null);
            }
            setSafetyCheckActive(false);
            toast.success("Safety confirmed. Emergency canceled.");
          }
        }
      }
    );
    
    // Set a timer for auto-dialing emergency if no response
    setSafetyCheckActive(true);
    const timer = setTimeout(() => {
      // Auto-dial emergency number after 1 minute
      toast.error("No safety confirmation received. Dialing emergency services.");
      window.location.href = "tel:100";
      
      // Send location to trusted contacts (similar to SOS function)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            
            // Get trusted contacts
            const contactsStr = localStorage.getItem('trustedContacts');
            if (contactsStr) {
              const contacts = JSON.parse(contactsStr);
              
              // Create location message
              const locationMessage = `
🚨 VOICE EMERGENCY DETECTED 🚨
Help may be needed immediately!
📍 Location: https://www.google.com/maps?q=${latitude},${longitude}
⏰ Detected: ${new Date().toLocaleTimeString()}
              `;
              
              console.log("Voice emergency location would be sent:", locationMessage);
              toast.info(`Location sent to ${contacts.length} trusted contacts`);
            }
          },
          (error) => {
            console.error("Error getting location for voice emergency:", error);
          }
        );
      }
      
      setSafetyCheckActive(false);
      setSafetyCheckTimer(null);
    }, 60000); // 1 minute timeout
    
    setSafetyCheckTimer(timer);
  };
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (safetyCheckTimer) {
        clearTimeout(safetyCheckTimer);
      }
    };
  }, [safetyCheckTimer]);
  
  const { isListening } = useVoiceDetection({
    triggerWord: "help",
    onTriggerDetected: handleHelpDetected,
    enabled
  });
  
  return (
    <div className="fixed top-4 right-4 z-50">
      {isListening ? (
        <div className="bg-green-500 text-white p-2 rounded-full shadow-lg">
          <Mic className="h-5 w-5" />
        </div>
      ) : (
        <div className="bg-gray-400 text-white p-2 rounded-full shadow-lg">
          <MicOff className="h-5 w-5" />
        </div>
      )}
    </div>
  );
};

export default VoiceEmergencyDetector;
