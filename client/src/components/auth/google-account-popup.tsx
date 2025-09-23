import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { X, User } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { useAuth } from "@/hooks/use-auth";

interface GoogleAccountPopupProps {
  onClose: () => void;
  isVisible: boolean;
}

export function GoogleAccountPopup({ onClose, isVisible }: GoogleAccountPopupProps) {
  const { socialLogin } = useAuth();
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Small delay to make the popup feel natural
      const timer = setTimeout(() => setShouldShow(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setShouldShow(false);
    }
  }, [isVisible]);

  const handleGoogleSignIn = () => {
    // Close popup and initiate Google OAuth with account selection
    onClose();
    socialLogin('google');
  };

  const handleClose = () => {
    // Mark as dismissed in session storage
    sessionStorage.setItem('google-popup-dismissed', 'true');
    onClose();
  };

  if (!shouldShow) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        {/* Popup */}
        <Card 
          className="w-full max-w-md bg-white shadow-2xl border-0 animate-in slide-in-from-bottom-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader className="relative pb-4">
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 h-8 w-8 p-0 hover:bg-gray-100"
              onClick={handleClose}
              data-testid="button-close-popup"
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center justify-center mb-2">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <FaGoogle className="text-white text-xl" />
              </div>
            </div>
            
            <h2 className="text-xl font-semibold text-center text-gray-900">
              Sign in to Gaming Portal with google.com
            </h2>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              To continue, Google will share your name, email address, and profile picture with Gaming Portal.
            </p>
            
            {/* Mock Google Account Options */}
            <div className="space-y-2">
              <div 
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={handleGoogleSignIn}
                data-testid="google-account-option-1"
              >
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <User className="text-white text-sm" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">ADS Hella Pay</p>
                  <p className="text-sm text-gray-500">ads.hellapay@gmail.com</p>
                </div>
              </div>
              
              <div 
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={handleGoogleSignIn}
                data-testid="google-account-option-2"
              >
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                  <User className="text-white text-sm" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Gaming User</p>
                  <p className="text-sm text-gray-500">user@gmail.com</p>
                </div>
              </div>
            </div>
            
            <Button
              onClick={handleGoogleSignIn}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
              data-testid="button-continue-google"
            >
              Continue as ADS Hella Pay
            </Button>
            
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
              <span>To continue, google.com will share your name, email address and</span>
            </div>
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
              <span>profile picture with this site. See this site's</span>
            </div>
            <div className="flex items-center justify-center space-x-4 text-xs text-blue-600">
              <button className="hover:underline">privacy policy</button>
              <span className="text-gray-500">and</span>
              <button className="hover:underline">terms of service</button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}