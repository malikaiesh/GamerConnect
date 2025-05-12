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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            You've just played <span className="text-primary">{game.title}</span>!
          </DialogTitle>
          <DialogDescription>
            How was your gaming experience? Try these similar games or share your feedback.
          </DialogDescription>
        </DialogHeader>
        
        {showFeedback ? (
          <div className="space-y-4 py-4">
            <h3 className="font-semibold text-lg">Rate your experience with {game.title}</h3>
            <div className="grid gap-4">
              <div className="flex items-center justify-center space-x-2">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                    onClick={() => onClose()}
                  >
                    {rating}
                  </button>
                ))}
              </div>
              <textarea 
                className="w-full rounded-md border border-border p-3 text-sm"
                placeholder="Share your thoughts about the game (optional)"
                rows={3}
              />
              
              <div className="flex flex-col items-center space-y-3">
                <p className="text-sm text-muted-foreground">Share your gaming experience with friends</p>
                <SocialShareButtons
                  title={`Check out my review of ${game.title}!`}
                  description={`I just played and rated ${game.title} - ${game.description}`}
                  url={window.location.origin + `/game/${game.id}`}
                  image={game.thumbnail}
                  platforms={['facebook', 'twitter', 'linkedin', 'email']}
                  size="sm"
                  compact={true}
                />
              </div>
              
              <Button onClick={onClose}>Submit Feedback</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="py-2">
              <RelatedGames 
                gameId={game.id} 
                category={game.category} 
                tags={game.tags} 
                isModal={true}
                onGameSelect={handleGameSelect}
              />
            </div>
            
            <div className="mt-4 mb-4">
              <h3 className="text-sm font-medium mb-2">Share your achievement</h3>
              <div className="flex items-center justify-center">
                <SocialShareButtons
                  title={`I just played ${game.title}!`}
                  description={`Check out ${game.title} - ${game.description}`}
                  url={window.location.origin + (game.slug ? `/g/${game.slug}` : `/game/${game.id}`)}
                  image={game.thumbnail}
                  platforms={['facebook', 'twitter', 'linkedin', 'email', 'copy']}
                  size="default"
                />
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleShowFeedback} variant="outline" className="flex-1">
                Rate This Game
              </Button>
              <Button onClick={handleBackToHome} variant="default" className="flex-1">
                Back to Home
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}