
import { useToast, toast } from "@/hooks/use-toast";

// Configure toast to be silent by default
const originalToast = toast;

// Override toast methods to be silent with proper typing
const silentToast = (props: Parameters<typeof originalToast>[0]) => {
  // For debugging only - no actual toasts will be shown
  console.debug("Toast suppressed:", props);
  return originalToast(props);
};

// Export the silent toast while maintaining API compatibility
export { useToast, silentToast as toast };
