
import { useState, useEffect, useCallback } from 'react';
import { toast } from "sonner";

interface VoiceDetectionOptions {
  triggerWord: string;
  onTriggerDetected: () => void;
  enabled?: boolean;
  sensitivity?: number; // 0 to 1, with 1 being most sensitive
}

export const useVoiceDetection = ({
  triggerWord,
  onTriggerDetected,
  enabled = true,
  sensitivity = 0.7
}: VoiceDetectionOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (!enabled) return;

    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser");
      return;
    }
    
    try {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US'; // Default language
      
      recognitionInstance.onstart = () => {
        console.log("Voice detection started");
        setIsListening(true);
      };
      
      recognitionInstance.onerror = (event: any) => {
        console.error("Voice detection error:", event.error);
        if (event.error === 'not-allowed') {
          toast.error("Microphone access denied. Voice detection disabled.");
          setIsListening(false);
        }
      };
      
      recognitionInstance.onend = () => {
        if (enabled) {
          // Restart recognition if it was still enabled when it stopped
          try {
            recognitionInstance.start();
          } catch (error) {
            console.error("Failed to restart voice detection:", error);
          }
        } else {
          setIsListening(false);
        }
      };
      
      recognitionInstance.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript.trim().toLowerCase();
            console.log("Detected speech:", transcript);
            
            // Check if the trigger word is in the speech
            if (transcript.includes(triggerWord.toLowerCase())) {
              console.log(`Trigger word "${triggerWord}" detected!`);
              onTriggerDetected();
            }
          }
        }
      };
      
      setRecognition(recognitionInstance);
    } catch (error) {
      console.error("Error initializing speech recognition:", error);
    }
  }, [enabled, triggerWord, onTriggerDetected, sensitivity]);
  
  // Start/stop listening
  useEffect(() => {
    if (!recognition) return;
    
    if (enabled && !isListening) {
      try {
        recognition.start();
      } catch (error) {
        console.error("Failed to start voice detection:", error);
      }
    } else if (!enabled && isListening) {
      try {
        recognition.stop();
        setIsListening(false);
      } catch (error) {
        console.error("Failed to stop voice detection:", error);
      }
    }
    
    return () => {
      if (recognition && isListening) {
        try {
          recognition.stop();
        } catch (error) {
          console.error("Failed to stop voice detection on cleanup:", error);
        }
      }
    };
  }, [enabled, recognition, isListening]);
  
  const toggleListening = useCallback(() => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
      } else {
        try {
          recognition.start();
        } catch (error) {
          console.error("Failed to toggle voice detection:", error);
        }
      }
    }
  }, [recognition, isListening]);
  
  return {
    isListening,
    toggleListening
  };
};

export default useVoiceDetection;
