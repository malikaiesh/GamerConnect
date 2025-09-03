import { useState, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ShortLinkData {
  shortUrl: string;
  originalUrl: string;
  shortCode: string;
  clickCount: number;
}

interface GenerateShortLinkParams {
  targetType: 'game' | 'blog' | 'category' | 'page';
  targetId?: number;
  targetSlug?: string;
  customCode?: string;
}

export function useShortLink() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [shortLink, setShortLink] = useState<ShortLinkData | null>(null);
  const { toast } = useToast();

  const generateShortLink = useCallback(async (params: GenerateShortLinkParams): Promise<ShortLinkData | null> => {
    setIsGenerating(true);
    
    try {
      const response = await apiRequest('/api/short-links/generate', {
        method: 'POST',
        body: JSON.stringify(params),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate short link');
      }

      const data = await response.json();
      
      if (data.success) {
        const linkData: ShortLinkData = {
          shortUrl: data.shortUrl,
          originalUrl: data.originalUrl,
          shortCode: data.shortLink.shortCode,
          clickCount: data.shortLink.clickCount || 0
        };
        
        setShortLink(linkData);
        return linkData;
      } else {
        throw new Error('Failed to generate short link');
      }
    } catch (error) {
      console.error('Error generating short link:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate short link',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  const copyShortLink = useCallback(async (shortUrl: string) => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      toast({
        title: 'Copied!',
        description: 'Short link copied to clipboard',
      });
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shortUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast({
        title: 'Copied!',
        description: 'Short link copied to clipboard',
      });
    }
  }, [toast]);

  const resetShortLink = useCallback(() => {
    setShortLink(null);
  }, []);

  return {
    shortLink,
    isGenerating,
    generateShortLink,
    copyShortLink,
    resetShortLink
  };
}

// Hook for automatic short link generation when page loads
export function useAutoShortLink(params: GenerateShortLinkParams, enabled: boolean = true) {
  const { generateShortLink, ...rest } = useShortLink();

  // Generate short link automatically when component mounts or params change
  const generateAuto = useCallback(async () => {
    if (!enabled) return null;
    return await generateShortLink(params);
  }, [generateShortLink, params, enabled]);

  return {
    generateShortLink: generateAuto,
    ...rest
  };
}

// Utility function to extract target info from current URL
export function getTargetInfoFromUrl(pathname: string): GenerateShortLinkParams | null {
  // Game page patterns: /game/:id or /g/:slug
  const gameIdMatch = pathname.match(/^\/game\/(\d+)$/);
  const gameSlugMatch = pathname.match(/^\/g\/([^\/]+)$/);
  
  if (gameIdMatch) {
    return {
      targetType: 'game',
      targetId: parseInt(gameIdMatch[1]),
    };
  }
  
  if (gameSlugMatch) {
    return {
      targetType: 'game',
      targetSlug: gameSlugMatch[1],
    };
  }

  // Blog post pattern: /blog/:slug
  const blogMatch = pathname.match(/^\/blog\/([^\/]+)$/);
  if (blogMatch) {
    return {
      targetType: 'blog',
      targetSlug: blogMatch[1],
    };
  }

  // Category pattern: /games/category/:slug
  const categoryMatch = pathname.match(/^\/games\/category\/([^\/]+)$/);
  if (categoryMatch) {
    return {
      targetType: 'category',
      targetSlug: categoryMatch[1],
    };
  }

  // Static page patterns
  const pageMatch = pathname.match(/^\/([^\/]+)$/);
  if (pageMatch && !['admin', 'auth', 'login', 'register'].includes(pageMatch[1])) {
    return {
      targetType: 'page',
      targetSlug: pageMatch[1],
    };
  }

  return null;
}