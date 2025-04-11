
import { useState, useEffect, useCallback } from 'react';
import { toast } from "sonner";

interface VoiceDetectionOptions {
  triggerWord: string;
  onTriggerDetected: () => void;
  enabled?: boolean;
  sensitivity?: number; // 0 to 1, with 1 being most sensitive
  languages?: string[]; // Array of language codes to detect
}

export const useVoiceDetection = ({
  triggerWord,
  onTriggerDetected,
  enabled = true,
  sensitivity = 0.7,
  languages = ['en-US', 'hi-IN', 'te-IN', 'ta-IN', 'mr-IN', 'bn-IN'] // Default to English and common Indian languages
}: VoiceDetectionOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [androidRecognition, setAndroidRecognition] = useState<any>(null);
  const [currentLanguage, setCurrentLanguage] = useState(languages[0]);
  
  // Function to cycle through languages
  const cycleLanguage = useCallback(() => {
    const currentIndex = languages.indexOf(currentLanguage);
    const nextIndex = (currentIndex + 1) % languages.length;
    setCurrentLanguage(languages[nextIndex]);
    
    console.log(`Switched voice recognition to ${languages[nextIndex]}`);
    return languages[nextIndex];
  }, [currentLanguage, languages]);

  // Initialize native Android speech recognition
  const initAndroidRecognition = useCallback(() => {
    if (!window.Capacitor?.isNativePlatform()) return null;
    
    console.log("Initializing Android native speech recognition");
    
    try {
      // In a real implementation, we would use a Capacitor plugin like:
      // const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
      // return SpeechRecognition;
      
      // For demonstration without the actual plugin:
      const mockAndroidRecognition = {
        start: async (options: any) => {
          console.log(`Starting Android speech recognition in ${options.language}`);
          setIsListening(true);
          
          // Simulated recognition result after a short delay
          setTimeout(() => {
            console.log("Android mock recognition active");
            toast.info(`Voice detection active (${options.language})`);
          }, 1000);
          
          return true;
        },
        stop: async () => {
          console.log("Stopping Android speech recognition");
          setIsListening(false);
          return true;
        },
        hasPermission: async () => {
          return true;
        },
        requestPermission: async () => {
          console.log("Requesting Android speech recognition permission");
          toast.info("Requesting microphone permission");
          return true;
        }
      };
      
      return mockAndroidRecognition;
    } catch (error) {
      console.error("Error initializing Android speech recognition:", error);
      return null;
    }
  }, []);

  // Helper function to check trigger words in multiple languages
  const checkMultiLanguageTriggers = useCallback((transcript: string) => {
    // Emergency trigger words in different languages
    const triggerWords = {
      'en-US': ['help', 'emergency', 'sos', 'danger'],
      'hi-IN': ['मदद', 'बचाओ', 'बचाव', 'खतरा'],
      'te-IN': ['సాయం', 'సహాయం', 'కాపాడండి'],
      'ta-IN': ['உதவி', 'காப்பாற்று'],
      'mr-IN': ['मदत', 'बचाव'],
      'bn-IN': ['সাহায্য', 'বাঁচাও']
    };
    
    // Check for trigger words in all configured languages
    const lowercaseTranscript = transcript.toLowerCase();
    
    // Check if any trigger word is present
    for (const lang in triggerWords) {
      const words = triggerWords[lang as keyof typeof triggerWords];
      if (words.some(word => lowercaseTranscript.includes(word))) {
        console.log(`Detected trigger word in ${lang}: "${transcript}"`);
        return true;
      }
    }
    
    // Check for the specific triggerWord passed as prop
    if (lowercaseTranscript.includes(triggerWord.toLowerCase())) {
      console.log(`Detected main trigger word "${triggerWord}": "${transcript}"`);
      return true;
    }
    
    return false;
  }, [triggerWord]);

  // Initialize speech recognition
  useEffect(() => {
    if (!enabled) return;

    // Initialize Android native speech recognition if on Android
    if (window.Capacitor?.isNativePlatform()) {
      const androidSpeechRecognition = initAndroidRecognition();
      setAndroidRecognition(androidSpeechRecognition);
      
      if (androidSpeechRecognition) {
        // Request permission
        androidSpeechRecognition.requestPermission()
          .then((hasPermission: boolean) => {
            if (hasPermission) {
              // Start Android speech recognition
              androidSpeechRecognition.start({
                language: currentLanguage,
                maxResults: 5,
                prompt: "Listening for emergency commands...",
                partialResults: true,
                popup: false,
                callbacks: {
                  onResult: (results: any) => {
                    if (results && results.matches && results.matches.length > 0) {
                      const transcript = results.matches[0];
                      console.log("Android speech recognition result:", transcript);
                      
                      if (checkMultiLanguageTriggers(transcript)) {
                        onTriggerDetected();
                      }
                    }
                  },
                  onError: (error: any) => {
                    console.error("Android speech recognition error:", error);
                    
                    // Restart recognition on error
                    setTimeout(() => {
                      if (enabled) {
                        androidSpeechRecognition.start({
                          language: cycleLanguage(),
                          maxResults: 5,
                          prompt: "Listening for emergency commands...",
                          partialResults: true,
                          popup: false
                        });
                      }
                    }, 1000);
                  },
                  onStop: () => {
                    console.log("Android speech recognition stopped");
                    
                    // Restart recognition when it stops
                    setTimeout(() => {
                      if (enabled) {
                        androidSpeechRecognition.start({
                          language: cycleLanguage(),
                          maxResults: 5,
                          prompt: "Listening for emergency commands...",
                          partialResults: true,
                          popup: false
                        });
                      }
                    }, 1000);
                  }
                }
              });
            } else {
              toast.error("Microphone permission denied. Voice detection disabled.");
            }
          })
          .catch((error: any) => {
            console.error("Error requesting Android speech permission:", error);
          });
      }
      
      return () => {
        if (androidSpeechRecognition) {
          androidSpeechRecognition.stop().catch((error: any) => {
            console.error("Error stopping Android speech recognition:", error);
          });
        }
      };
    }

    // Web speech recognition implementation for testing in browser
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser");
      return;
    }
    
    try {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = currentLanguage;
      
      recognitionInstance.onstart = () => {
        console.log("Voice detection started");
        setIsListening(true);
      };
      
      recognitionInstance.onerror = (event: any) => {
        console.error("Voice detection error:", event.error);
        if (event.error === 'not-allowed') {
          toast.error("Microphone access denied. Voice detection disabled.");
          setIsListening(false);
        } else {
          // Switch language and restart on error
          setTimeout(() => {
            if (enabled && recognition) {
              recognition.lang = cycleLanguage();
              try {
                recognition.start();
              } catch (error) {
                console.error("Failed to restart voice detection after error:", error);
              }
            }
          }, 1000);
        }
      };
      
      recognitionInstance.onend = () => {
        if (enabled) {
          // Restart recognition if it was still enabled when it stopped
          // Also cycle through languages
          setTimeout(() => {
            if (recognition) {
              recognition.lang = cycleLanguage();
              try {
                recognition.start();
              } catch (error) {
                console.error("Failed to restart voice detection:", error);
              }
            }
          }, 1000);
        } else {
          setIsListening(false);
        }
      };
      
      recognitionInstance.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript.trim();
            console.log("Detected speech:", transcript);
            
            // Check for trigger words in multiple languages
            if (checkMultiLanguageTriggers(transcript)) {
              onTriggerDetected();
            }
          }
        }
      };
      
      setRecognition(recognitionInstance);
    } catch (error) {
      console.error("Error initializing speech recognition:", error);
    }
  }, [enabled, currentLanguage, checkMultiLanguageTriggers, onTriggerDetected, cycleLanguage, initAndroidRecognition]);
  
  // Start/stop listening
  useEffect(() => {
    if (window.Capacitor?.isNativePlatform()) {
      // Android native speech recognition is managed in the initialization
      return;
    }
    
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
    if (window.Capacitor?.isNativePlatform() && androidRecognition) {
      if (isListening) {
        androidRecognition.stop();
      } else {
        androidRecognition.start({
          language: currentLanguage,
          maxResults: 5,
          prompt: "Listening for emergency commands...",
          partialResults: true,
          popup: false
        });
      }
      return;
    }
    
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
  }, [recognition, androidRecognition, isListening, currentLanguage]);
  
  return {
    isListening,
    toggleListening,
    currentLanguage
  };
};

export default useVoiceDetection;
