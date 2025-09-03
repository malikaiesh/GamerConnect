import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useShortLink, getTargetInfoFromUrl } from '@/hooks/use-short-link';
import { Copy, Link, Share2, ExternalLink, TrendingUp } from 'lucide-react';
import { useLocation } from 'wouter';

interface ShareLinkProps {
  title?: string;
  description?: string;
  targetType?: 'game' | 'blog' | 'category' | 'page';
  targetId?: number;
  targetSlug?: string;
  className?: string;
  showStats?: boolean;
  compact?: boolean;
}

export function ShareLink({ 
  title = "Share this page",
  description = "Get a short link to share easily",
  targetType,
  targetId,
  targetSlug,
  className = "",
  showStats = false,
  compact = false
}: ShareLinkProps) {
  const [location] = useLocation();
  const { shortLink, isGenerating, generateShortLink, copyShortLink } = useShortLink();
  const [originalUrl, setOriginalUrl] = useState('');

  useEffect(() => {
    // Set the original URL
    const currentUrl = `${window.location.origin}${location}`;
    setOriginalUrl(currentUrl);

    // Auto-generate short link
    const generateLink = async () => {
      let params = null;

      // Use provided parameters or extract from URL
      if (targetType && (targetId || targetSlug)) {
        params = { targetType, targetId, targetSlug };
      } else {
        params = getTargetInfoFromUrl(location);
      }

      if (params) {
        await generateShortLink(params);
      }
    };

    generateLink();
  }, [location, targetType, targetId, targetSlug, generateShortLink]);

  const handleCopyOriginal = async () => {
    try {
      await navigator.clipboard.writeText(originalUrl);
    } catch (error) {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = originalUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const handleCopyShort = () => {
    if (shortLink) {
      copyShortLink(shortLink.shortUrl);
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {shortLink ? (
          <>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Input
                value={shortLink.shortUrl}
                readOnly
                className="text-sm"
                data-testid="input-short-url-compact"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyShort}
                disabled={isGenerating}
                data-testid="button-copy-short-compact"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {showStats && (
              <Badge variant="secondary" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                {shortLink.clickCount} clicks
              </Badge>
            )}
          </>
        ) : isGenerating ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link className="h-4 w-4 animate-spin" />
            Generating short link...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyOriginal}
              data-testid="button-copy-original-compact"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Original URL */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Original URL</label>
          <div className="flex items-center gap-2">
            <Input
              value={originalUrl}
              readOnly
              className="font-mono text-sm"
              data-testid="input-original-url"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyOriginal}
              data-testid="button-copy-original"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Short URL */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-primary">Short URL</label>
            {shortLink && showStats && (
              <Badge variant="secondary" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                {shortLink.clickCount} clicks
              </Badge>
            )}
          </div>
          
          {isGenerating ? (
            <div className="flex items-center gap-2 py-3 text-muted-foreground">
              <Link className="h-4 w-4 animate-spin" />
              <span className="text-sm">Generating short link...</span>
            </div>
          ) : shortLink ? (
            <div className="flex items-center gap-2">
              <Input
                value={shortLink.shortUrl}
                readOnly
                className="font-mono text-sm text-primary font-medium"
                data-testid="input-short-url"
              />
              <Button
                size="sm"
                onClick={handleCopyShort}
                data-testid="button-copy-short"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(shortLink.shortUrl, '_blank')}
                data-testid="button-open-short"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground py-3">
              Unable to generate short link for this page
            </div>
          )}
        </div>

        {shortLink && (
          <div className="text-xs text-muted-foreground">
            Short links redirect to the original page and track click statistics
          </div>
        )}
      </CardContent>
    </Card>
  );
}