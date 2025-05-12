import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { HomeAd as HomeAdType } from '@shared/schema';

interface HomeAdProps {
  position: string;
}

export function HomeAd({ position }: HomeAdProps) {
  const adContainerRef = useRef<HTMLDivElement>(null);
  
  // Fetch the ad for this position
  const { 
    data: ad, 
    isLoading, 
    error 
  } = useQuery<HomeAdType>({
    queryKey: ['/api/home-ads/position', position],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/home-ads/position/${position}`);
        if (!res.ok) {
          if (res.status === 404) {
            // No ad found for this position, return null
            return null;
          }
          throw new Error('Failed to fetch ad');
        }
        return await res.json();
      } catch (error) {
        console.error(`Error fetching ad for position ${position}:`, error);
        return null;
      }
    },
  });

  // Record an impression when the ad is displayed
  useEffect(() => {
    if (ad && ad.id) {
      // Don't await this, let it happen in the background
      apiRequest('POST', `/api/home-ads/${ad.id}/impression`)
        .catch(err => console.error('Failed to record impression:', err));
    }
  }, [ad]);

  // Handle Google Ads
  useEffect(() => {
    if (ad && ad.isGoogleAd && adContainerRef.current) {
      // Initialize Google Ads
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (error) {
          console.error('Error initializing Google Ad:', error);
        }
      }
    }
  }, [ad]);

  // Handle click on the ad
  const handleAdClick = async () => {
    if (ad && ad.id) {
      // Don't await this, let it happen in the background
      apiRequest('POST', `/api/home-ads/${ad.id}/click`)
        .catch(err => console.error('Failed to record click:', err));
    }
  };

  // If there's no ad or it's inactive or disabled, return nothing
  if (!ad || isLoading || error || ad.status !== 'active' || !ad.adEnabled) {
    return null;
  }

  return (
    <div 
      className="w-full my-4 text-center overflow-hidden max-w-full sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl mx-auto"
      onClick={handleAdClick}
      ref={adContainerRef}
    >
      {ad.isGoogleAd ? (
        // Google Ad
        <ins 
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={ad.adCode}
          data-ad-slot="XXXXXXXX" // Replace with dynamic slot ID if needed
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        // Custom Ad Code
        <div 
          className="responsive-ad"
          dangerouslySetInnerHTML={{ __html: ad.adCode }} 
        />
      )}
    </div>
  );
}