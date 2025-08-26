import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HeroImage } from "@shared/schema";

export function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  // Fetch hero images
  const { data: heroImages = [], isLoading } = useQuery<HeroImage[]>({
    queryKey: ['/api/hero-images'],
    retry: false
  });

  const activeImages = heroImages.filter(img => img.isActive);
  const currentImage = activeImages[currentIndex];

  // Auto-advance slider
  useEffect(() => {
    if (!isPlaying || activeImages.length === 0) return;

    const duration = currentImage?.displayDuration || 5000;
    const interval = 50; // Update progress every 50ms for smooth animation
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Move to next slide
          setCurrentIndex(current => (current + 1) % activeImages.length);
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, isPlaying, activeImages.length, currentImage?.displayDuration]);

  // Reset progress when manually changing slides
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setProgress(0);
  };

  const nextSlide = () => {
    goToSlide((currentIndex + 1) % activeImages.length);
  };

  const prevSlide = () => {
    goToSlide((currentIndex - 1 + activeImages.length) % activeImages.length);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  if (isLoading) {
    return (
      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_25px_rgba(124,58,237,0.15)]">
        <div className="h-[250px] sm:h-[350px] lg:h-[400px] bg-gradient-to-br from-purple-600 via-blue-600 to-teal-600 animate-pulse rounded-xl flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-sm sm:text-base">Loading hero content...</p>
          </div>
        </div>
      </div>
    );
  }

  if (activeImages.length === 0) {
    // Default fallback image when no hero images are configured
    return (
      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_25px_rgba(124,58,237,0.15)]">
        <img 
          src="https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80" 
          alt="Gaming setup with neon lighting" 
          className="rounded-xl shadow-2xl w-full object-cover h-[250px] sm:h-[350px] lg:h-[400px]" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_25px_rgba(124,58,237,0.15)] group" data-testid="hero-slider">
      {/* Main Image */}
      <div className="relative h-[250px] sm:h-[350px] lg:h-[400px]">
        <img
          src={currentImage.imagePath}
          alt={currentImage.title}
          className="w-full h-full object-cover rounded-xl"
          data-testid={`hero-image-${currentImage.id}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl" />
      </div>

      {/* Hero Action Buttons - positioned at bottom left */}
      <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4">
        <div className="flex flex-wrap gap-2">
          {/* Login Button - First Priority */}
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg backdrop-blur-sm text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg"
            onClick={() => window.location.href = '/auth'}
            data-testid="hero-login-button"
          >
            Login
          </Button>
          
          {/* Signup Button - Second Priority */}
          <Button
            size="sm"
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg backdrop-blur-sm text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg"
            onClick={() => window.location.href = '/auth'}
            data-testid="hero-signup-button"
          >
            Sign Up
          </Button>
          
          {/* Play Now Button - Third Priority */}
          <Button
            size="sm"
            className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg backdrop-blur-sm text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg"
            onClick={() => window.location.href = '/games'}
            data-testid="hero-play-button"
          >
            Play Now
          </Button>
          
          {/* Original CTA Button - Last if present */}
          {currentImage.linkUrl && currentImage.linkText && (
            <Button
              size="sm"
              className="bg-primary/80 hover:bg-primary text-primary-foreground shadow-lg backdrop-blur-sm text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg"
              onClick={() => window.location.href = currentImage.linkUrl || ''}
              data-testid="hero-cta-button"
            >
              {currentImage.linkText}
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      {activeImages.length > 1 && (
        <>
          {/* Previous/Next Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full transition-all opacity-70 sm:opacity-0 sm:group-hover:opacity-100"
            data-testid="hero-prev-button"
          >
            <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full transition-all opacity-70 sm:opacity-0 sm:group-hover:opacity-100"
            data-testid="hero-next-button"
          >
            <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
          </button>

          {/* Slide Indicators - positioned at bottom center */}
          <div className="absolute bottom-1 sm:bottom-2 left-1/2 -translate-x-1/2 flex space-x-1 sm:space-x-2">
            {activeImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`relative w-6 h-1.5 sm:w-8 sm:h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/70'
                }`}
                data-testid={`hero-indicator-${index}`}
              >
                {index === currentIndex && (
                  <div
                    className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Play/Pause Button - positioned at bottom right */}
          <button
            onClick={togglePlayPause}
            className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100"
            data-testid="hero-play-pause-button"
          >
            {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          </button>
        </>
      )}
    </div>
  );
}