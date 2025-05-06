import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Share2, Facebook, Twitter, Linkedin, Link2, Mail, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SocialShareProps {
  title: string;
  description?: string;
  url: string;
  image?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
  platforms?: ('facebook' | 'twitter' | 'linkedin' | 'email' | 'copy')[];
  className?: string;
}

export const SocialShare: FC<SocialShareProps> = ({
  title,
  description = '',
  url,
  image = '',
  variant = 'outline',
  size = 'default',
  showLabel = true,
  platforms = ['facebook', 'twitter', 'linkedin', 'email', 'copy'],
  className = '',
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const encodedUrl = encodeURIComponent(url);
  const encodedImage = encodeURIComponent(image);

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
  };

  const handleShare = (platform: string) => {
    if (platform === 'copy') {
      navigator.clipboard.writeText(url).then(
        () => {
          setCopied(true);
          toast({
            title: 'Link copied!',
            description: 'The link has been copied to your clipboard.',
          });
          setTimeout(() => setCopied(false), 2000);
        },
        (err) => {
          console.error('Could not copy text: ', err);
          toast({
            title: 'Copy failed',
            description: 'Could not copy the link. Please try again.',
            variant: 'destructive',
          });
        }
      );
      return;
    }

    // Open share URL in a new window
    window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
    setDialogOpen(false);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Share2 className="h-4 w-4 mr-2" />
          {showLabel && 'Share'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this content</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-5 gap-2 py-4">
          {platforms.includes('facebook') && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={() => handleShare('facebook')}
                  >
                    <Facebook className="h-4 w-4 text-blue-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share on Facebook</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {platforms.includes('twitter') && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={() => handleShare('twitter')}
                  >
                    <Twitter className="h-4 w-4 text-sky-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share on Twitter</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {platforms.includes('linkedin') && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={() => handleShare('linkedin')}
                  >
                    <Linkedin className="h-4 w-4 text-blue-700" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share on LinkedIn</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {platforms.includes('email') && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={() => handleShare('email')}
                  >
                    <Mail className="h-4 w-4 text-gray-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share via Email</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {platforms.includes('copy') && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={() => handleShare('copy')}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Link2 className="h-4 w-4 text-gray-600" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{copied ? 'Copied!' : 'Copy Link'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <div className="flex items-center border rounded-md pl-2 overflow-hidden bg-muted/50">
              <span className="text-sm text-muted-foreground truncate">{url}</span>
            </div>
          </div>
          <Button 
            size="sm" 
            className="px-3"
            onClick={() => handleShare('copy')}
          >
            <span className="sr-only">Copy</span>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};