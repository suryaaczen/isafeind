
import { useToast, toast } from "@/hooks/use-toast";

// Configure toast to be silent by default
const originalToast = toast;

// Override toast methods to be silent
const silentToast = (...args: any[]) => {
  // For debugging only - no actual toasts will be shown
  console.debug("Toast suppressed:", args);
  return originalToast(...args);
};

// Export the silent toast while maintaining API compatibility
export { useToast, silentToast as toast };
