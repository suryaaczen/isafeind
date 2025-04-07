
import { useEffect } from 'react';
import { toast } from "sonner";

export const useSafetyCheck = () => {
  useEffect(() => {
    // Setup periodic safety check notifications
    setupSafetyCheckNotifications();
    
    // Request permission for notifications
    requestNotificationPermission();
  }, []);
  
  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.warning("Please enable notifications for safety alerts");
      }
    }
  };
  
  const setupSafetyCheckNotifications = () => {
    // Setup safety check every 5 hours (in milliseconds)
    const fiveHours = 5 * 60 * 60 * 1000;
    
    // For demo purposes, we'll set it to 1 minute
    const oneMinute = 60 * 1000;
    
    setInterval(() => {
      showSafetyCheckNotification();
    }, fiveHours); // Use fiveHours in production
  };
  
  const showSafetyCheckNotification = () => {
    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification("iSafe Safety Check", {
        body: "Are you safe? If not, press SOS button or dial 100",
        icon: "/favicon.ico"
      });
      
      notification.onclick = () => {
        window.focus();
      };
    }
    
    // Also show in-app notification
    toast(
      "Safety Check",
      {
        description: "Are you safe? If not, press SOS or dial 100",
        action: {
          label: "I'm safe",
          onClick: () => {
            toast.success("Glad you're safe!");
          }
        }
      }
    );
  };
};
