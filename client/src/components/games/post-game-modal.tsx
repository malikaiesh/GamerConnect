import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RelatedGames } from '@/components/games/related-games';
import { SocialShareButtons } from '@/components/shared/social-share-buttons';
import { Game } from '@shared/schema';
import { useLocation } from 'wouter';

interface PostGameModalProps {
  game: Game;
  isOpen: boolean;
  onClose: () => void;
}

export function PostGameModal({ game, isOpen, onClose }: PostGameModalProps) {
  const [, setLocation] = useLocation();
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Reset the feedback state when the modal opens
  useEffect(() => {
    if (isOpen) {
      setShowFeedback(false);
    }
  }, [isOpen]);
  
  const handleGameSelect = (selectedGame: Game) => {
    onClose();
    // Use slug-based URL if available, otherwise fall back to ID-based URL
    setLocation(selectedGame.slug ? `/g/${selectedGame.slug}` : `/game/${selectedGame.id}`);
  };
  
  const handleShowFeedback = () => {
    setShowFeedback(true);
  };
  
  const handleBackToHome = () => {
    onClose();
    setLocation('/');
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[500px] sm:max-w-[600px] max-h-[95vh] overflow-y-auto mx-auto">
        <DialogHeader className="text-center sm:text-left">
          <DialogTitle className="text-lg sm:text-2xl leading-tight">
            You've just played <span className="text-primary">{game.title}</span>!
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            How was your gaming experience? Try these similar games or share your feedback.
          </DialogDescription>
        </DialogHeader>
        
        {showFeedback ? (
          <div className="space-y-4 py-4">
            <h3 className="font-semibold text-base sm:text-lg text-center">Rate your experience with {game.title}</h3>
            <div className="grid gap-4">
              {/* Mobile-Optimized Rating Buttons */}
              <div className="flex items-center justify-center space-x-3">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    className="w-12 h-12 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border-2 border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 font-bold text-lg sm:text-base touch-manipulation"
                    onClick={() => onClose()}
                  >
                    {rating}
                  </button>
                ))}
              </div>
              <textarea 
                className="w-full rounded-lg border border-border p-3 text-sm focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                placeholder="Share your thoughts about the game (optional)"
                rows={3}
              />
              
              <div className="flex flex-col items-center space-y-3">
                <p className="text-sm text-muted-foreground text-center">Share your gaming experience with friends</p>
                <SocialShareButtons
                  title={`Check out my review of ${game.title}!`}
                  description={`I just played and rated ${game.title} - ${game.description}`}
                  url={window.location.origin + `/game/${game.id}`}
                  image={game.thumbnail}
                  platforms={['facebook', 'twitter', 'linkedin', 'whatsapp', 'email']}
                  size="sm"
                  compact={true}
                />
              </div>
              
              <Button onClick={onClose} className="w-full py-3 mt-4 touch-manipulation">
                Submit Feedback
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile-Optimized Related Games */}
            <div className="py-2">
              <RelatedGames 
                gameId={game.id} 
                category={game.category} 
                tags={game.tags} 
                isModal={true}
                onGameSelect={handleGameSelect}
              />
            </div>
            
            {/* Mobile-Optimized Social Share */}
            <div className="mt-4 mb-4">
              <h3 className="text-sm font-medium mb-3 text-center sm:text-left">Share your achievement</h3>
              <div className="flex items-center justify-center">
                <SocialShareButtons
                  title={`I just played ${game.title}!`}
                  description={`Check out ${game.title} - ${game.description}`}
                  url={window.location.origin + (game.slug ? `/g/${game.slug}` : `/game/${game.id}`)}
                  image={game.thumbnail}
                  platforms={['facebook', 'twitter', 'linkedin', 'whatsapp', 'email', 'copy']}
                  size="default"
                />
              </div>
            </div>
            
            <Separator className="my-4" />
            
            {/* Mobile-Optimized Action Buttons */}
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
              <Button 
                onClick={handleShowFeedback} 
                variant="outline" 
                className="flex-1 py-3 touch-manipulation font-medium"
              >
                <i className="ri-star-line mr-2"></i>
                Rate This Game
              </Button>
              <Button 
                onClick={handleBackToHome} 
                variant="default" 
                className="flex-1 py-3 touch-manipulation font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <i className="ri-home-5-line mr-2"></i>
                Back to Home
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}