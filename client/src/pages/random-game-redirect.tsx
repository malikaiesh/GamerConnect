import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Game } from '@shared/schema';
import { Loader2 } from 'lucide-react';

export default function RandomGameRedirect() {
  const [, setLocation] = useLocation();
  const [isRedirecting, setIsRedirecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch a random game
  const { data: randomGame, isError } = useQuery<Game>({
    queryKey: ['/api/games/random'],
    retry: 3,
  });

  useEffect(() => {
    if (randomGame && isRedirecting) {
      // Redirect to the game using the slug if available, otherwise use the ID
      const gameUrl = randomGame.slug ? `/g/${randomGame.slug}` : `/game/${randomGame.id}`;
      setIsRedirecting(false);
      setLocation(gameUrl);
    }

    if (isError) {
      setIsRedirecting(false);
      setError('Failed to find a random game. Please try again later.');
    }
  }, [randomGame, isError, setLocation, isRedirecting]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      {isRedirecting ? (
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-2">Finding a random game for you...</h1>
          <p className="text-muted-foreground">We're searching for something fun!</p>
        </div>
      ) : error ? (
        <div className="text-center">
          <div className="bg-destructive/10 p-4 rounded-lg mb-6 inline-block">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-destructive mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Oops! Something went wrong</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Try Again
            </button>
            <button
              onClick={() => setLocation('/')}
              className="px-6 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
            >
              Back to Home
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}