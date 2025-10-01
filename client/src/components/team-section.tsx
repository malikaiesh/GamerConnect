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
    
    // Calculate positions for 5 visible cards
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
          <div className="flex items-center justify-center min-h-[500px] relative">
            {visibleMembers.map(({ member, position }, index) => {
              const isCenter = position === 'center';
              const isSide = position === 'left' || position === 'right';
              const isFarSide = position === 'far-left' || position === 'far-right';
              
              // Position and scale calculations
              const positionMap = {
                'far-left': '-translate-x-[200%] scale-50',
                'left': '-translate-x-[100%] scale-75',
                'center': 'translate-x-0 scale-100',
                'right': 'translate-x-[100%] scale-75',
                'far-right': 'translate-x-[200%] scale-50'
              };
              
              const opacityMap = {
                'far-left': 'opacity-30',
                'left': 'opacity-60',
                'center': 'opacity-100',
                'right': 'opacity-60',
                'far-right': 'opacity-30'
              };
              
              const zIndexMap = {
                'far-left': 'z-0',
                'left': 'z-10',
                'center': 'z-20',
                'right': 'z-10',
                'far-right': 'z-0'
              };

              return (
                <Card 
                  key={`${member.id}-${index}`}
                  className={`absolute transition-all duration-500 ease-in-out ${positionMap[position]} ${opacityMap[position]} ${zIndexMap[position]} ${
                    isCenter 
                      ? 'w-80 md:w-96 shadow-2xl border-4 border-primary/30 bg-gradient-to-br from-card via-card to-primary/5' 
                      : isSide
                        ? 'w-64 md:w-80 shadow-lg border-2 border-border/50 bg-card/80'
                        : 'w-56 md:w-64 shadow-md border border-border/30 bg-card/60'
                  } backdrop-blur-sm`}
                  data-testid={`card-member-${member.id}`}
                >
                  <CardContent className={`${isCenter ? 'p-8' : isSide ? 'p-6' : 'p-4'} text-center`}>
                    {/* Profile Picture */}
                    <div className={`relative mb-6 transition-transform duration-300 ${isCenter ? 'hover:scale-105' : ''}`}>
                      <Avatar className={`${isCenter ? 'w-32 h-32' : isSide ? 'w-24 h-24' : 'w-20 h-20'} mx-auto ring-4 ${
                        isCenter ? 'ring-primary/40' : 'ring-primary/10'
                      } transition-all duration-300`}>
                        <AvatarImage 
                          src={member.profilePicture || ""} 
                          alt={member.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xl">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Decorative ring for center card */}
                      {isCenter && (
                        <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping opacity-50"></div>
                      )}
                    </div>

                    {/* Member Info */}
                    <div className="space-y-3 mb-4">
                      <h3 className={`font-bold ${isCenter ? 'text-2xl' : isSide ? 'text-xl' : 'text-lg'} text-foreground transition-colors duration-300`} data-testid={`text-name-${member.id}`}>
                        {member.name}
                      </h3>
                      <Badge 
                        variant="secondary" 
                        className={`${isCenter ? 'text-sm px-4 py-1' : 'text-xs px-3 py-0.5'} bg-primary/10 text-primary hover:bg-primary/20`}
                        data-testid={`badge-designation-${member.id}`}
                      >
                        {member.designation}
                      </Badge>
                    </div>

                    {/* Bio - only show for center and side cards */}
                    {(isCenter || isSide) && member.bio && (
                      <p className={`${isCenter ? 'text-base' : 'text-sm'} text-muted-foreground mb-6 ${isCenter ? 'line-clamp-4' : 'line-clamp-2'}`} data-testid={`text-bio-${member.id}`}>
                        {member.bio}
                      </p>
                    )}

                    {/* Social Links - only show for center card */}
                    {isCenter && (
                      <div className="flex justify-center gap-2 flex-wrap mt-6">
                        {member.socialLinkedin && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 w-9 p-0 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:border-blue-800"
                            onClick={() => member.socialLinkedin && window.open(member.socialLinkedin, '_blank')}
                            data-testid={`button-linkedin-${member.id}`}
                          >
                            <Linkedin className="h-4 w-4" />
                          </Button>
                        )}
                        {member.socialTwitter && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 w-9 p-0 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-500 dark:hover:bg-blue-950 dark:hover:border-blue-800"
                            onClick={() => member.socialTwitter && window.open(member.socialTwitter, '_blank')}
                            data-testid={`button-twitter-${member.id}`}
                          >
                            <Twitter className="h-4 w-4" />
                          </Button>
                        )}
                        {member.socialGithub && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 w-9 p-0 hover:bg-gray-50 hover:border-gray-200 hover:text-gray-800 dark:hover:bg-gray-950 dark:hover:border-gray-700"
                            onClick={() => member.socialGithub && window.open(member.socialGithub, '_blank')}
                            data-testid={`button-github-${member.id}`}
                          >
                            <Github className="h-4 w-4" />
                          </Button>
                        )}
                        {member.socialInstagram && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 w-9 p-0 hover:bg-pink-50 hover:border-pink-200 hover:text-pink-600 dark:hover:bg-pink-950 dark:hover:border-pink-800"
                            onClick={() => member.socialInstagram && window.open(member.socialInstagram, '_blank')}
                            data-testid={`button-instagram-${member.id}`}
                          >
                            <Instagram className="h-4 w-4" />
                          </Button>
                        )}
                        {(member as any).socialTiktok && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 w-9 p-0 hover:bg-black hover:border-black hover:text-white dark:hover:bg-white dark:hover:border-white dark:hover:text-black"
                            onClick={() => (member as any).socialTiktok && window.open((member as any).socialTiktok, '_blank')}
                            data-testid={`button-tiktok-${member.id}`}
                          >
                            <SiTiktok className="h-4 w-4" />
                          </Button>
                        )}
                        {(member as any).socialFacebook && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 w-9 p-0 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 dark:hover:bg-blue-950 dark:hover:border-blue-800"
                            onClick={() => (member as any).socialFacebook && window.open((member as any).socialFacebook, '_blank')}
                            data-testid={`button-facebook-${member.id}`}
                          >
                            <Facebook className="h-4 w-4" />
                          </Button>
                        )}
                        {(member as any).socialYoutube && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 w-9 p-0 hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-950 dark:hover:border-red-800"
                            onClick={() => (member as any).socialYoutube && window.open((member as any).socialYoutube, '_blank')}
                            data-testid={`button-youtube-${member.id}`}
                          >
                            <Youtube className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 mt-12">
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrev}
              className="bg-gray-700/90 hover:bg-gray-600 text-white border-gray-600 hover:border-gray-500 px-8 py-6 text-base font-semibold shadow-lg transition-all duration-300 hover:scale-105"
              data-testid="button-prev-team"
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              PREV
            </Button>
            <Button
              variant="default"
              size="lg"
              onClick={handleNext}
              className="bg-green-600 hover:bg-green-500 text-white px-8 py-6 text-base font-semibold shadow-lg transition-all duration-300 hover:scale-105"
              data-testid="button-next-team"
            >
              NEXT
              <ChevronRight className="h-5 w-5 ml-2" />
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
