
import { useEffect } from 'react';

export const useSafetyCheck = () => {
  // Removed all notification functionality per user request
  
  const showSafetyCheckNotification = () => {
    // Notification functionality has been removed
    console.log("Safety check notifications have been disabled");
  };

  return {
    showSafetyCheckNotification
  };
};
