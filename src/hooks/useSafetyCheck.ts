
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
      // Create a basic notification without the actions property
      const notification = new Notification("iSafe Safety Check", {
        body: "Are you safe? Click to respond",
        icon: "/favicon.ico",
        requireInteraction: true
      });
      
      // Handle click event without accessing the action property
      notification.onclick = (event) => {
        // Show a confirmation dialog when notification is clicked
        const isSafe = window.confirm("Are you safe? Press OK if yes, Cancel if no.");
        
        if (!isSafe) {
          // Dial emergency number if not safe
          window.location.href = "tel:100";
        } else {
          window.focus();
          toast.success("Glad you're safe!");
        }
      };
    }
    
    // Also show in-app notification
    toast(
      "Safety Check",
      {
        description: "Are you safe?",
        duration: 50000,
        action: {
          label: "Yes",
          onClick: () => {
            toast.success("Glad you're safe!");
          }
        },
        cancel: {
          label: "No",
          onClick: () => {
            // Dial emergency number
            window.location.href = "tel:100";
          }
        }
      }
    );
  };

  return {
    showSafetyCheckNotification
  };
};
