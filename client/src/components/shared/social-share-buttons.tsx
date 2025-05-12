import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Facebook, Twitter, Linkedin, Link2, Mail, Check, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SocialShareButtonsProps {
  title: string;
  description?: string;
  url: string;
  image?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  platforms?: ('facebook' | 'twitter' | 'linkedin' | 'email' | 'whatsapp' | 'copy')[];
  className?: string;
  compact?: boolean;
}

export const SocialShareButtons: FC<SocialShareButtonsProps> = ({
  title,
  description = '',
  url,
  image = '',
  size = 'icon',
  platforms = ['facebook', 'twitter', 'linkedin', 'email', 'copy'],
  className = '',
  compact = false,
}) => {
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
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%0A${encodedDescription}%0A${encodedUrl}`,
  };

  const handleShare = (platform: string) => {
    if (platform === 'copy') {
      navigator.clipboard.writeText(url).then(
        () => {
          setCopied(true);
          toast({
            title: 'Link copied!',
            description: 'The link has been copied to your clipboard.',
            duration: 1500,
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
  };

  const buttonClasses = compact 
    ? "w-7 h-7 p-0 rounded-full"
    : "rounded-full";

  return (
    <div className={`flex gap-1 ${className}`}>
      {platforms.includes('facebook') && (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size={size}
                className={buttonClasses}
                onClick={() => handleShare('facebook')}
              >
                <Facebook className={compact ? "h-3 w-3 text-blue-600" : "h-4 w-4 text-blue-600"} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Share on Facebook</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {platforms.includes('twitter') && (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size={size}
                className={buttonClasses}
                onClick={() => handleShare('twitter')}
              >
                <Twitter className={compact ? "h-3 w-3 text-sky-500" : "h-4 w-4 text-sky-500"} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Share on Twitter</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {platforms.includes('linkedin') && (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size={size}
                className={buttonClasses}
                onClick={() => handleShare('linkedin')}
              >
                <Linkedin className={compact ? "h-3 w-3 text-blue-700" : "h-4 w-4 text-blue-700"} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Share on LinkedIn</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {platforms.includes('email') && (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size={size}
                className={buttonClasses}
                onClick={() => handleShare('email')}
              >
                <Mail className={compact ? "h-3 w-3 text-gray-600" : "h-4 w-4 text-gray-600"} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Share via Email</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      {platforms.includes('whatsapp') && (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size={size}
                className={buttonClasses}
                onClick={() => handleShare('whatsapp')}
              >
                <MessageCircle className={compact ? "h-3 w-3 text-green-600" : "h-4 w-4 text-green-600"} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Share via WhatsApp</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {platforms.includes('copy') && (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size={size}
                className={buttonClasses}
                onClick={() => handleShare('copy')}
              >
                {copied ? (
                  <Check className={compact ? "h-3 w-3 text-green-600" : "h-4 w-4 text-green-600"} />
                ) : (
                  <Link2 className={compact ? "h-3 w-3 text-gray-600" : "h-4 w-4 text-gray-600"} />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{copied ? 'Copied!' : 'Copy Link'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};