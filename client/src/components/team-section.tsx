import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TeamMember } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Linkedin, Twitter, Github, Instagram, Facebook, Youtube, ChevronLeft, ChevronRight } from "lucide-react";
import { SiTiktok } from "react-icons/si";

interface TeamSectionProps {
  className?: string;
}

export function TeamSection({ className }: TeamSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const { data: teamMembers, isLoading, isError } = useQuery<TeamMember[]>({
    queryKey: ["/api/team"],
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handlePrev = () => {
    if (teamMembers && teamMembers.length > 0) {
      setCurrentIndex((prev) => (prev === 0 ? teamMembers.length - 1 : prev - 1));
    }
  };

  const handleNext = () => {
    if (teamMembers && teamMembers.length > 0) {
      setCurrentIndex((prev) => (prev === teamMembers.length - 1 ? 0 : prev + 1));
    }
  };

  const getVisibleMembers = () => {
    if (!teamMembers || teamMembers.length === 0) return [];
    
    const visible: { member: TeamMember; position: 'far-left' | 'left' | 'center' | 'right' | 'far-right' }[] = [];
    const total = teamMembers.length;
    
    // Calculate positions for 5 visible cards (desktop) or 3 (mobile)
    for (let i = -2; i <= 2; i++) {
      const index = (currentIndex + i + total) % total;
      const position = i === -2 ? 'far-left' : i === -1 ? 'left' : i === 0 ? 'center' : i === 1 ? 'right' : 'far-right';
      visible.push({ member: teamMembers[index], position });
    }
    
    return visible;
  };

  if (isLoading) {
    return (
      <section className={`py-16 bg-gradient-to-br from-background to-muted/50 ${className}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Loading our amazing team...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return null;
  }

  if (!teamMembers || teamMembers.length === 0) {
    return (
      <section className={`py-16 bg-gradient-to-br from-background to-muted/50 ${className}`} data-testid="section-team">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Users className="h-8 w-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground" data-testid="heading-team">
                Meet Our Team
              </h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-team-description">
              Our team section is coming soon. Stay tuned to meet the passionate minds behind our gaming platform!
            </p>
          </div>
        </div>
      </section>
    );
  }

  const visibleMembers = getVisibleMembers();

  return (
    <section className={`py-16 bg-gradient-to-br from-background to-muted/50 relative overflow-hidden ${className}`} data-testid="section-team">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 rounded-full bg-purple-500/5 blur-3xl"></div>
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="h-8 w-8 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground" data-testid="heading-team">
              Meet Our Team
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-team-description">
            The passionate minds behind our gaming platform, dedicated to bringing you the best gaming experience.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Team Member Cards Carousel */}
          <div className="flex items-center justify-center min-h-[350px] md:min-h-[400px] relative px-4">
            {visibleMembers.map(({ member, position }, index) => {
              const isCenter = position === 'center';
              const isSide = position === 'left' || position === 'right';
              const isFarSide = position === 'far-left' || position === 'far-right';
              
              // Position and scale calculations - responsive
              const positionMap = {
                'far-left': 'md:-translate-x-[200%] md:scale-50 hidden md:block',
                'left': '-translate-x-[90%] md:-translate-x-[100%] scale-[0.6] md:scale-75',
                'center': 'translate-x-0 scale-100',
                'right': 'translate-x-[90%] md:translate-x-[100%] scale-[0.6] md:scale-75',
                'far-right': 'md:translate-x-[200%] md:scale-50 hidden md:block'
              };
              
              const opacityMap = {
                'far-left': 'md:opacity-30',
                'left': 'opacity-40 md:opacity-60',
                'center': 'opacity-100',
                'right': 'opacity-40 md:opacity-60',
                'far-right': 'md:opacity-30'
              };
              
              const zIndexMap = {
                'far-left': 'z-0',
                'left': 'z-10',
                'center': 'z-20',
                'right': 'z-10',
                'far-right': 'z-0'
              };

              return (
                <div 
                  key={`${member.id}-${index}`}
                  className={`absolute transition-all duration-500 ease-in-out ${positionMap[position]} ${opacityMap[position]} ${zIndexMap[position]} ${
                    isCenter 
                      ? 'w-64 sm:w-72 md:w-80' 
                      : isSide
                        ? 'w-52 sm:w-60 md:w-64'
                        : 'w-44 sm:w-48 md:w-52'
                  }`}
                >
                  {/* Animated gradient border wrapper */}
                  <div className={`animate-gradient-border ${isCenter ? 'shadow-2xl' : isSide ? 'shadow-lg' : 'shadow-md'}`}>
                    <Card 
                      className="animate-gradient-border-content backdrop-blur-sm border-0"
                      data-testid={`card-member-${member.id}`}
                    >
                      <CardContent className={`${isCenter ? 'p-5 sm:p-6' : isSide ? 'p-4' : 'p-3'} text-center`}>
                        {/* Profile Picture */}
                        <div className={`relative mb-3 sm:mb-4 transition-transform duration-300 ${isCenter ? 'hover:scale-105' : ''}`}>
                          <Avatar className={`${isCenter ? 'w-20 h-20 sm:w-24 sm:h-24' : isSide ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-14 h-14'} mx-auto ring-2 sm:ring-4 ${
                            isCenter ? 'ring-primary/40' : 'ring-primary/10'
                          } transition-all duration-300`}>
                            <AvatarImage 
                              src={member.profilePicture || ""} 
                              alt={member.name}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-base sm:text-xl">
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          
                          {/* Decorative ring for center card */}
                          {isCenter && (
                            <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping opacity-50"></div>
                          )}
                        </div>

                        {/* Member Info */}
                        <div className="space-y-2 mb-3">
                          <h3 className={`font-bold ${isCenter ? 'text-lg sm:text-xl' : isSide ? 'text-base sm:text-lg' : 'text-sm'} text-foreground transition-colors duration-300`} data-testid={`text-name-${member.id}`}>
                            {member.name}
                          </h3>
                          <Badge 
                            variant="secondary" 
                            className={`${isCenter ? 'text-xs sm:text-sm px-3 py-0.5 sm:px-4 sm:py-1' : 'text-xs px-2 py-0.5'} bg-primary/10 text-primary hover:bg-primary/20`}
                            data-testid={`badge-designation-${member.id}`}
                          >
                            {member.designation}
                          </Badge>
                        </div>

                        {/* Bio - only show for center and side cards */}
                        {(isCenter || isSide) && member.bio && (
                          <p className={`${isCenter ? 'text-sm' : 'text-xs'} text-muted-foreground mb-4 ${isCenter ? 'line-clamp-3' : 'line-clamp-2'}`} data-testid={`text-bio-${member.id}`}>
                            {member.bio}
                          </p>
                        )}

                        {/* Social Links - only show for center card */}
                        {isCenter && (
                          <div className="flex justify-center gap-1.5 sm:gap-2 flex-wrap mt-4">
                            {member.socialLinkedin && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:border-blue-800"
                                onClick={() => member.socialLinkedin && window.open(member.socialLinkedin, '_blank')}
                                data-testid={`button-linkedin-${member.id}`}
                              >
                                <Linkedin className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              </Button>
                            )}
                            {member.socialTwitter && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-500 dark:hover:bg-blue-950 dark:hover:border-blue-800"
                                onClick={() => member.socialTwitter && window.open(member.socialTwitter, '_blank')}
                                data-testid={`button-twitter-${member.id}`}
                              >
                                <Twitter className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              </Button>
                            )}
                            {member.socialGithub && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-gray-50 hover:border-gray-200 hover:text-gray-800 dark:hover:bg-gray-950 dark:hover:border-gray-700"
                                onClick={() => member.socialGithub && window.open(member.socialGithub, '_blank')}
                                data-testid={`button-github-${member.id}`}
                              >
                                <Github className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              </Button>
                            )}
                            {member.socialInstagram && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-pink-50 hover:border-pink-200 hover:text-pink-600 dark:hover:bg-pink-950 dark:hover:border-pink-800"
                                onClick={() => member.socialInstagram && window.open(member.socialInstagram, '_blank')}
                                data-testid={`button-instagram-${member.id}`}
                              >
                                <Instagram className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              </Button>
                            )}
                            {(member as any).socialTiktok && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-black hover:border-black hover:text-white dark:hover:bg-white dark:hover:border-white dark:hover:text-black"
                                onClick={() => (member as any).socialTiktok && window.open((member as any).socialTiktok, '_blank')}
                                data-testid={`button-tiktok-${member.id}`}
                              >
                                <SiTiktok className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              </Button>
                            )}
                            {(member as any).socialFacebook && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 dark:hover:bg-blue-950 dark:hover:border-blue-800"
                                onClick={() => (member as any).socialFacebook && window.open((member as any).socialFacebook, '_blank')}
                                data-testid={`button-facebook-${member.id}`}
                              >
                                <Facebook className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              </Button>
                            )}
                            {(member as any).socialYoutube && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-950 dark:hover:border-red-800"
                                onClick={() => (member as any).socialYoutube && window.open((member as any).socialYoutube, '_blank')}
                                data-testid={`button-youtube-${member.id}`}
                              >
                                <Youtube className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              </Button>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 mt-8 sm:mt-12">
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrev}
              className="relative px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base font-semibold bg-gray-800/90 hover:bg-gray-700/90 text-white border-2 border-gray-600 hover:border-gray-500 shadow-[0_0_15px_rgba(107,114,128,0.3)] hover:shadow-[0_0_25px_rgba(107,114,128,0.5)] transition-all duration-300 overflow-hidden group"
              data-testid="button-prev-team"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-600/30 to-gray-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
              <span className="relative flex items-center">
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                PREV
              </span>
            </Button>
            <Button
              variant="default"
              size="lg"
              onClick={handleNext}
              className="relative px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-2 border-purple-500/50 hover:border-pink-500/50 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] transition-all duration-300 overflow-hidden group"
              data-testid="button-next-team"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 to-pink-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
              <span className="relative flex items-center">
                NEXT
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 ml-1 sm:ml-2" />
              </span>
            </Button>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">
            Want to join our amazing team?
          </p>
          <Button 
            variant="outline" 
            className="hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
            onClick={() => window.location.href = '/contact'}
            data-testid="button-join-team"
          >
            Get In Touch
          </Button>
        </div>
      </div>
    </section>
  );
}
