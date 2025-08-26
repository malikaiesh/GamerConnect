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
      <div className="relative w-full h-[500px] bg-gradient-to-br from-purple-600 via-blue-600 to-teal-600 animate-pulse rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading hero content...</p>
          </div>
        </div>
      </div>
    );
  }

  if (activeImages.length === 0) {
    // Default hero section when no images are configured
    return (
      <div className="relative w-full h-[500px] bg-gradient-to-br from-purple-600 via-blue-600 to-teal-600 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative h-full flex items-center justify-center text-center text-white p-8">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Welcome to GameZone
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Discover amazing games, connect with fellow gamers, and dive into endless entertainment
            </p>
            <div className="space-x-4">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-blue-50">
                Explore Games
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden group" data-testid="hero-slider">
      {/* Main Image */}
      <div className="relative h-full">
        <img
          src={currentImage.imagePath}
          alt={currentImage.title}
          className="w-full h-full object-cover"
          data-testid={`hero-image-${currentImage.id}`}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30" />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl text-white">
            <div className="inline-block bg-primary/20 text-primary-foreground text-sm font-medium px-3 py-1 rounded-full mb-4 backdrop-blur-sm">
              Featured
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
              {currentImage.title}
            </h1>
            {currentImage.description && (
              <p className="text-lg md:text-xl mb-8 text-gray-100 drop-shadow-md">
                {currentImage.description}
              </p>
            )}
            {currentImage.linkUrl && currentImage.linkText && (
              <div className="space-x-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 shadow-lg"
                  onClick={() => window.location.href = currentImage.linkUrl || ''}
                  data-testid="hero-cta-button"
                >
                  {currentImage.linkText}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      {activeImages.length > 1 && (
        <>
          {/* Previous/Next Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
            data-testid="hero-prev-button"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
            data-testid="hero-next-button"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
            {activeImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`relative w-12 h-2 rounded-full transition-all ${
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

          {/* Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            className="absolute bottom-6 right-6 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
            data-testid="hero-play-pause-button"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        </>
      )}
    </div>
  );
}