import { useQuery } from "@tanstack/react-query";
import { TeamMember } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Linkedin, Twitter, Github, Instagram } from "lucide-react";

interface TeamSectionProps {
  className?: string;
}

export function TeamSection({ className }: TeamSectionProps) {
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4" />
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-3 bg-muted rounded mb-4" />
                  <div className="h-12 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return null; // Don't show the section if there's an error
  }

  // Show empty state if no team members
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

  return (
    <section className={`py-16 bg-gradient-to-br from-background to-muted/50 ${className}`} data-testid="section-team">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
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

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teamMembers.map((member) => (
            <Card 
              key={member.id} 
              className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 bg-card/90 backdrop-blur-sm"
              data-testid={`card-member-${member.id}`}
            >
              <CardContent className="p-6 text-center">
                {/* Profile Picture */}
                <div className="relative mb-4 group-hover:scale-105 transition-transform duration-300">
                  <Avatar className="w-20 h-20 mx-auto ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all duration-300">
                    <AvatarImage 
                      src={member.profilePicture || ""} 
                      alt={member.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Member Info */}
                <div className="space-y-2 mb-4">
                  <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors duration-300" data-testid={`text-name-${member.id}`}>
                    {member.name}
                  </h3>
                  <Badge 
                    variant="secondary" 
                    className="text-xs bg-primary/10 text-primary hover:bg-primary/20"
                    data-testid={`badge-designation-${member.id}`}
                  >
                    {member.designation}
                  </Badge>
                </div>

                {/* Bio */}
                {member.bio && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3" data-testid={`text-bio-${member.id}`}>
                    {member.bio}
                  </p>
                )}

                {/* Social Links */}
                <div className="flex justify-center gap-2 flex-wrap">
                  {member.socialLinkedin && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:border-blue-800"
                      onClick={() => member.socialLinkedin && window.open(member.socialLinkedin, '_blank')}
                      data-testid={`button-linkedin-${member.id}`}
                    >
                      <Linkedin className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {member.socialTwitter && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-500 dark:hover:bg-blue-950 dark:hover:border-blue-800"
                      onClick={() => member.socialTwitter && window.open(member.socialTwitter, '_blank')}
                      data-testid={`button-twitter-${member.id}`}
                    >
                      <Twitter className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {member.socialGithub && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-gray-50 hover:border-gray-200 hover:text-gray-800 dark:hover:bg-gray-950 dark:hover:border-gray-700"
                      onClick={() => member.socialGithub && window.open(member.socialGithub, '_blank')}
                      data-testid={`button-github-${member.id}`}
                    >
                      <Github className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {member.socialInstagram && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-pink-50 hover:border-pink-200 hover:text-pink-600 dark:hover:bg-pink-950 dark:hover:border-pink-800"
                      onClick={() => member.socialInstagram && window.open(member.socialInstagram, '_blank')}
                      data-testid={`button-instagram-${member.id}`}
                    >
                      <Instagram className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
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