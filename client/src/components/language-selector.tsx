import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Languages, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Language {
  id: number;
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isActive: boolean;
  sortOrder: number;
}

interface SiteSettings {
  translationEnabled: boolean;
  showLanguageSelectorOnHomepage: boolean;
  defaultLanguage: string;
  autoDetectLanguage: boolean;
}

interface LanguageSelectorProps {
  variant?: "card" | "select" | "dropdown";
  className?: string;
  showLabel?: boolean;
}

export function LanguageSelector({ 
  variant = "select", 
  className = "",
  showLabel = true 
}: LanguageSelectorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");

  // Fetch site settings to check if translations are enabled
  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ['/api/settings'],
  });

  // Fetch active languages
  const { data: languages = [] } = useQuery<Language[]>({
    queryKey: ['/api/translations/languages/active'],
    enabled: settings?.translationEnabled
  });

  // Initialize selected language
  useEffect(() => {
    if (!selectedLanguage && settings && languages.length > 0) {
      const storedLanguage = localStorage.getItem('selected-language');
      
      if (storedLanguage && languages.some(lang => lang.code === storedLanguage)) {
        setSelectedLanguage(storedLanguage);
      } else if (settings.autoDetectLanguage) {
        // Auto-detect language from browser
        const browserLanguage = navigator.language.split('-')[0];
        const matchedLanguage = languages.find(lang => lang.code === browserLanguage);
        setSelectedLanguage(matchedLanguage?.code || settings.defaultLanguage);
      } else {
        setSelectedLanguage(settings.defaultLanguage);
      }
    }
  }, [settings, languages, selectedLanguage]);

  // Handle language change
  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    localStorage.setItem('selected-language', languageCode);
    
    // Dispatch custom event for other components to listen to language changes
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { languageCode } 
    }));

    // Show toast notification
    const selectedLang = languages.find(lang => lang.code === languageCode);
    if (selectedLang) {
      // You can implement a toast notification here if needed
      console.log(`Language changed to ${selectedLang.name}`);
    }
  };

  // Don't render if translations are disabled or not supposed to show on homepage
  if (!settings?.translationEnabled || !settings?.showLanguageSelectorOnHomepage || languages.length <= 1) {
    return null;
  }

  const currentLanguage = languages.find(lang => lang.code === selectedLanguage);

  if (variant === "card") {
    return (
      <Card className={cn("w-full max-w-sm", className)} data-testid="card-language-selector">
        <CardContent className="p-4">
          {showLabel && (
            <div className="flex items-center gap-2 mb-3">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Choose Language</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            {languages.map((language) => (
              <Button
                key={language.code}
                variant={selectedLanguage === language.code ? "default" : "outline"}
                size="sm"
                className="justify-start h-auto p-3"
                onClick={() => handleLanguageChange(language.code)}
                data-testid={`button-language-${language.code}`}
              >
                <span className="text-lg mr-2">{language.flag}</span>
                <div className="text-left">
                  <div className="font-medium text-xs">{language.name}</div>
                  <div className="text-xs opacity-70">{language.nativeName}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === "dropdown") {
    return (
      <div className={cn("relative", className)}>
        <Button
          variant="outline"
          className="w-full justify-between"
          data-testid="button-language-dropdown"
        >
          <div className="flex items-center gap-2">
            {currentLanguage && (
              <>
                <span className="text-lg">{currentLanguage.flag}</span>
                <span>{currentLanguage.nativeName}</span>
              </>
            )}
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
        {/* You can implement a custom dropdown here if needed */}
      </div>
    );
  }

  // Default select variant
  return (
    <div className={cn("space-y-2", className)}>
      {showLabel && (
        <div className="flex items-center gap-2 text-sm font-medium">
          <Languages className="h-4 w-4 text-muted-foreground" />
          <span>Language</span>
        </div>
      )}
      <Select
        value={selectedLanguage}
        onValueChange={handleLanguageChange}
      >
        <SelectTrigger className="w-auto min-w-[140px] max-w-[180px] h-10 px-3 py-2 text-sm border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:border-primary/50" data-testid="select-language">
          <SelectValue placeholder="Select language">
            {currentLanguage && (
              <div className="flex items-center gap-2 text-white">
                <span className="text-base">{currentLanguage.flag}</span>
                <span className="font-medium text-sm truncate">{currentLanguage.nativeName}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-card/95 backdrop-blur-sm border border-border shadow-lg rounded-lg">
          {languages.map((language) => (
            <SelectItem 
              key={language.code} 
              value={language.code}
              className="hover:bg-primary/10 focus:bg-primary/15 cursor-pointer"
              data-testid={`option-language-${language.code}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{language.flag}</span>
                <span className="font-medium">{language.name}</span>
                <span className="text-xs text-muted-foreground">({language.nativeName})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Hook to use current language in other components
export function useCurrentLanguage() {
  const [currentLanguage, setCurrentLanguage] = useState<string>("");

  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ['/api/settings'],
  });

  const { data: languages = [] } = useQuery<Language[]>({
    queryKey: ['/api/translations/languages/active'],
    enabled: settings?.translationEnabled
  });

  useEffect(() => {
    // Set initial language
    const storedLanguage = localStorage.getItem('selected-language');
    if (storedLanguage) {
      setCurrentLanguage(storedLanguage);
    } else if (settings) {
      setCurrentLanguage(settings.defaultLanguage);
    }

    // Listen for language changes
    const handleLanguageChange = (event: CustomEvent) => {
      setCurrentLanguage(event.detail.languageCode);
    };

    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, [settings]);

  return {
    currentLanguage,
    languages,
    isTranslationEnabled: settings?.translationEnabled || false
  };
}

// Hook to get translations for current language
export function useTranslations(category?: string) {
  const { currentLanguage, isTranslationEnabled } = useCurrentLanguage();

  const { data: translations = {} } = useQuery<Record<string, string>>({
    queryKey: ['/api/translations/translations', currentLanguage, { category }],
    enabled: isTranslationEnabled && !!currentLanguage,
  });

  // Translation function
  const t = (key: string, fallback?: string): string => {
    if (!isTranslationEnabled) {
      return fallback || key;
    }
    
    return translations[key] || fallback || key;
  };

  return {
    t,
    currentLanguage,
    translations,
    isTranslationEnabled
  };
}