
import { useEffect } from 'react';

export const useSafetyCheck = () => {
  // All notification functionality has been removed
  
  const showSafetyCheckNotification = () => {
    // Completely disabled - no logs or notifications
    // No-op function to maintain API compatibility
  };

  return {
    showSafetyCheckNotification
  };
};
