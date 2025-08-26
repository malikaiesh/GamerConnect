import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { GameAd } from '@shared/schema';
import { useEffect, useRef } from 'react';

interface GameAdDisplayProps {
  position: string;
  className?: string;
}

export function GameAdDisplay({ position, className = '' }: GameAdDisplayProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const impressionRecorded = useRef(false);

  const { data: gameAd, isLoading } = useQuery<GameAd | null>({
    queryKey: ['/api/game-ads/position', position],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/game-ads/position/${position}`);
        if (!response.ok) {
          if (response.status === 404) {
            return null; // No ad found for this position
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json() as GameAd;
      } catch (error: any) {
        if (error.message.includes('404')) {
          return null; // No ad found for this position
        }
        throw error;
      }
    },
    retry: false,
  });

  const recordImpressionMutation = useMutation({
    mutationFn: async (adId: number) => {
      return fetch(`/api/game-ads/${adId}/impression`, {
        method: 'POST'
      });
    },
    onError: (error) => {
      console.error('Failed to record game ad impression:', error);
    }
  });

  const recordClickMutation = useMutation({
    mutationFn: async (adId: number) => {
      return fetch(`/api/game-ads/${adId}/click`, {
        method: 'POST'
      });
    },
    onError: (error) => {
      console.error('Failed to record game ad click:', error);
    }
  });

  // Record impression when ad comes into view
  useEffect(() => {
    if (!gameAd || !adRef.current || impressionRecorded.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !impressionRecorded.current) {
            impressionRecorded.current = true;
            recordImpressionMutation.mutate(gameAd.id);
          }
        });
      },
      { threshold: 0.5 } // Record impression when 50% of ad is visible
    );

    observer.observe(adRef.current);

    return () => {
      observer.disconnect();
    };
  }, [gameAd, recordImpressionMutation]);

  const handleAdClick = (ad: GameAd) => {
    recordClickMutation.mutate(ad.id);
    
    if (ad.targetUrl) {
      window.open(ad.targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Don't render anything if loading or no ad found
  if (isLoading || !gameAd) {
    return null;
  }

  // Don't render if ad is not enabled or not active
  if (!gameAd.adEnabled || gameAd.status !== 'active') {
    return null;
  }

  // Check if ad is within date range (if dates are specified)
  const now = new Date();
  if (gameAd.startDate && new Date(gameAd.startDate) > now) {
    return null;
  }
  if (gameAd.endDate && new Date(gameAd.endDate) < now) {
    return null;
  }

  return (
    <div 
      ref={adRef}
      className={`game-ad-container ${className}`}
      data-testid={`game-ad-${position}`}
      data-ad-position={position}
    >
      {gameAd.isGoogleAd && gameAd.adCode ? (
        // Google Ad Code
        <div 
          className="google-ad"
          dangerouslySetInnerHTML={{ __html: gameAd.adCode }}
        />
      ) : gameAd.adCode ? (
        // Custom Ad Code
        <div 
          className="custom-ad"
          dangerouslySetInnerHTML={{ __html: gameAd.adCode }}
        />
      ) : gameAd.imageUrl ? (
        // Image-based Ad
        <div 
          className="image-ad cursor-pointer"
          onClick={() => handleAdClick(gameAd)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleAdClick(gameAd);
            }
          }}
        >
          <img 
            src={gameAd.imageUrl} 
            alt={gameAd.name}
            className="w-full h-auto max-w-full"
            loading="lazy"
          />
        </div>
      ) : null}
      
      {/* Optional: Add a small label for development/testing */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-400 mt-1">
          Ad: {gameAd.name} (Position: {position})
        </div>
      )}
    </div>
  );
}

// Specific position components for easier usage
export function GameAdAboveGame({ className }: { className?: string }) {
  return <GameAdDisplay position="above_game" className={className} />;
}

export function GameAdBelowGame({ className }: { className?: string }) {
  return <GameAdDisplay position="below_game" className={className} />;
}

export function GameAdSidebarTop({ className }: { className?: string }) {
  return <GameAdDisplay position="sidebar_top" className={className} />;
}

export function GameAdSidebarBottom({ className }: { className?: string }) {
  return <GameAdDisplay position="sidebar_bottom" className={className} />;
}

export function GameAdBetweenRelated({ className }: { className?: string }) {
  return <GameAdDisplay position="between_related" className={className} />;
}

export function GameAdHeaderBanner({ className }: { className?: string }) {
  return <GameAdDisplay position="header_banner" className={className} />;
}

export function GameAdFooterBanner({ className }: { className?: string }) {
  return <GameAdDisplay position="footer_banner" className={className} />;
}