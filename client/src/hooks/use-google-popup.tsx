import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

export function useGooglePopup() {
  const [showPopup, setShowPopup] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Don't show popup if user is already authenticated or still loading
    if (isAuthenticated || isLoading) {
      return;
    }

    // Check if popup was already dismissed in this session
    const wasDismissed = sessionStorage.getItem('google-popup-dismissed');
    if (wasDismissed) {
      return;
    }

    // Check if popup was shown recently (within 24 hours)
    const lastShown = localStorage.getItem('google-popup-last-shown');
    if (lastShown) {
      const lastShownTime = parseInt(lastShown);
      const now = Date.now();
      const hoursSinceLastShown = (now - lastShownTime) / (1000 * 60 * 60);
      
      // Don't show if shown within last 24 hours
      if (hoursSinceLastShown < 24) {
        return;
      }
    }

    // Show popup after a delay (like Canva does)
    const timer = setTimeout(() => {
      setShowPopup(true);
      localStorage.setItem('google-popup-last-shown', Date.now().toString());
    }, 3000); // 3 second delay

    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading]);

  const hidePopup = () => {
    setShowPopup(false);
  };

  return {
    showPopup,
    hidePopup
  };
}