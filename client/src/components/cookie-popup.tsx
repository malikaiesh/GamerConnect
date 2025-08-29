import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Cookie } from "lucide-react";

interface CookieSettings {
  cookiePopupEnabled: boolean;
  cookiePopupTitle: string;
  cookiePopupMessage: string;
  cookieAcceptButtonText: string;
  cookieDeclineButtonText: string;
  cookieLearnMoreText: string;
  cookieLearnMoreUrl: string;
  cookiePopupPosition: 'bottom' | 'top' | 'center';
  cookiePopupTheme: 'dark' | 'light';
}

export function CookiePopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const { data: settings } = useQuery<CookieSettings>({
    queryKey: ['/api/settings'],
  });

  useEffect(() => {
    // Check if cookies have been accepted/declined before
    const cookieConsent = localStorage.getItem('cookie-consent');
    
    // Only show popup if:
    // 1. Cookie popup is enabled in settings
    // 2. User hasn't made a choice before
    if (settings?.cookiePopupEnabled && !cookieConsent) {
      // Show popup after a short delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [settings]);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    closePopup();
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    closePopup();
  };

  const closePopup = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 300);
  };

  if (!isVisible || !settings?.cookiePopupEnabled) {
    return null;
  }

  const positionClasses = {
    bottom: 'bottom-4 left-4 right-4 md:left-6 md:right-6',
    top: 'top-4 left-4 right-4 md:left-6 md:right-6',
    center: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-md w-full mx-4'
  };

  const themeClasses = {
    dark: 'bg-card text-card-foreground border-border',
    light: 'bg-background text-foreground border-border'
  };

  const buttonThemeClasses = {
    dark: {
      accept: 'bg-primary hover:bg-primary/90 text-primary-foreground',
      decline: 'bg-muted hover:bg-muted/90 text-muted-foreground border-border',
      close: 'text-muted-foreground hover:text-foreground'
    },
    light: {
      accept: 'bg-primary hover:bg-primary/90 text-primary-foreground',
      decline: 'bg-muted hover:bg-muted/90 text-muted-foreground border-border',
      close: 'text-muted-foreground hover:text-foreground'
    }
  };

  return (
    <div 
      className={`fixed z-50 ${positionClasses[settings.cookiePopupPosition]} ${
        isClosing ? 'animate-out slide-out-to-bottom' : 'animate-in slide-in-from-bottom'
      }`}
      data-testid="cookie-popup"
    >
      <Card className={`${themeClasses[settings.cookiePopupTheme]} shadow-lg border-2`}>
        <CardContent className="p-4 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Cookie className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg" data-testid="cookie-title">
                  {settings.cookiePopupTitle}
                </h3>
              </div>
              
              <p className="text-sm mb-4 leading-relaxed" data-testid="cookie-message">
                {settings.cookiePopupMessage}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  onClick={handleAccept}
                  className={buttonThemeClasses[settings.cookiePopupTheme].accept}
                  data-testid="button-accept-cookies"
                >
                  {settings.cookieAcceptButtonText}
                </Button>
                
                <Button
                  onClick={handleDecline}
                  variant="outline"
                  className={buttonThemeClasses[settings.cookiePopupTheme].decline}
                  data-testid="button-decline-cookies"
                >
                  {settings.cookieDeclineButtonText}
                </Button>
                
                <Button
                  variant="link"
                  asChild
                  className="text-primary hover:text-primary/80 p-0 h-auto"
                  data-testid="link-learn-more"
                >
                  <a href={settings.cookieLearnMoreUrl} target="_blank" rel="noopener noreferrer">
                    {settings.cookieLearnMoreText}
                  </a>
                </Button>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={closePopup}
              className={`h-8 w-8 ${buttonThemeClasses[settings.cookiePopupTheme].close}`}
              data-testid="button-close-popup"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}