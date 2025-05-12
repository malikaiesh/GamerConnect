import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { HomeAd as HomeAdType } from '@shared/schema';

interface HomeAdProps {
  position: string;
}

export function HomeAd({ position }: HomeAdProps) {
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

  // Handle click on the ad
  const handleAdClick = async () => {
    if (ad && ad.id) {
      // Don't await this, let it happen in the background
      apiRequest('POST', `/api/home-ads/${ad.id}/click`)
        .catch(err => console.error('Failed to record click:', err));
    }
  };

  // If there's no ad or it's inactive, return nothing
  if (!ad || isLoading || error || ad.status !== 'active') {
    return null;
  }

  return (
    <div 
      className="w-full my-4 text-center overflow-hidden"
      onClick={handleAdClick}
    >
      {/* Use dangerouslySetInnerHTML to render the ad code */}
      <div dangerouslySetInnerHTML={{ __html: ad.adCode }} />
    </div>
  );
}