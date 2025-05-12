import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SiteSetting } from '@shared/schema';

interface BlogAdProps {
  type: 'header' | 'footer' | 'sidebar' | 'content' | 'paragraph2' | 'paragraph4' | 'paragraph6' | 'paragraph8' | 'afterContent' | 'floatingHeader' | 'floatingFooter';
  className?: string;
}

export function BlogAd({ type, className = '' }: BlogAdProps) {
  const adContainerRef = useRef<HTMLDivElement>(null);

  // Map the type to the corresponding site settings field
  const typeToField: Record<string, keyof SiteSetting> = {
    header: 'headerAds',
    footer: 'footerAds',
    sidebar: 'sidebarAds',
    content: 'contentAds',
    paragraph2: 'paragraph2Ad',
    paragraph4: 'paragraph4Ad',
    paragraph6: 'paragraph6Ad',
    paragraph8: 'paragraph8Ad',
    afterContent: 'afterContentAd',
    floatingHeader: 'floatingHeaderAds',
    floatingFooter: 'floatingFooterAds'
  };

  // Fetch site settings, which include ad settings
  const { data: settings } = useQuery<SiteSetting>({
    queryKey: ['/api/settings'],
  });

  // Get the ad content based on the type
  const adField = typeToField[type];
  const adContent = settings?.[adField] as string | undefined;
  const isGoogleAdsEnabled = settings?.enableGoogleAds;
  const googleAdClient = settings?.googleAdClient;

  // Initialize Google Ads if needed
  useEffect(() => {
    if (isGoogleAdsEnabled && googleAdClient && adContainerRef.current) {
      try {
        // Check if AdSense script is already loaded
        if (window.adsbygoogle === undefined) {
          // Create and add AdSense script
          const script = document.createElement('script');
          script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
          script.async = true;
          script.setAttribute('data-ad-client', googleAdClient);
          document.head.appendChild(script);
          
          // Define adsbygoogle if it doesn't exist
          window.adsbygoogle = window.adsbygoogle || [];
        }
        
        // Push the ad to be displayed
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error('Error initializing Google AdSense:', error);
      }
    }
  }, [isGoogleAdsEnabled, googleAdClient]);

  if (!adContent && !isGoogleAdsEnabled) {
    return null;
  }

  return (
    <div 
      className={`w-full my-4 text-center overflow-hidden max-w-full mx-auto ad-container ${className}`}
      ref={adContainerRef}
      data-ad-type={type}
    >
      {isGoogleAdsEnabled ? (
        // Google Ad
        <ins 
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={googleAdClient}
          data-ad-slot="auto"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        // Custom Ad HTML
        <div 
          className="custom-ad"
          dangerouslySetInnerHTML={{ __html: adContent || '' }} 
        />
      )}
    </div>
  );
}

// Add this type definition for Google AdSense
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}