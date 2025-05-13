import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SiteSetting } from '@shared/schema';

export function AppHead() {
  const { data: settings } = useQuery<SiteSetting>({
    queryKey: ['/api/settings'],
  });

  useEffect(() => {
    if (!settings) return;

    // Update page title
    if (settings.siteTitle) {
      document.title = settings.siteTitle;
    }

    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    if (settings.metaDescription) {
      metaDescription.setAttribute('content', settings.metaDescription);
    }

    // Update Open Graph title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    if (settings.siteTitle) {
      ogTitle.setAttribute('content', settings.siteTitle);
    }

    // Update Open Graph description
    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement('meta');
      ogDescription.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescription);
    }
    if (settings.metaDescription) {
      ogDescription.setAttribute('content', settings.metaDescription);
    }

    // Update favicon
    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.setAttribute('rel', 'icon');
      document.head.appendChild(favicon);
    }
    
    if (settings.siteFavicon) {
      const fileExtension = settings.siteFavicon.split('.').pop()?.toLowerCase();
      
      if (fileExtension === 'ico') {
        favicon.setAttribute('type', 'image/x-icon');
      } else if (fileExtension === 'png') {
        favicon.setAttribute('type', 'image/png');
      } else if (fileExtension === 'svg') {
        favicon.setAttribute('type', 'image/svg+xml');
      } else {
        favicon.setAttribute('type', 'image/png'); // Default type
      }
      
      favicon.setAttribute('href', settings.siteFavicon);
    }

    // Update keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords && settings.keywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    
    if (metaKeywords && settings.keywords) {
      metaKeywords.setAttribute('content', settings.keywords);
    }
  }, [settings]);
  
  return null; // This component doesn't render anything visible
}