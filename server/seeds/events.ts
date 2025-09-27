import { db } from "@db";
import { events, users } from '@shared/schema';
import { count, eq } from 'drizzle-orm';

export async function seedEvents() {
  try {
    // Check if events already exist
    const [existingCount] = await db
      .select({ count: count() })
      .from(events);

    // Only seed if no events exist (fresh deployment)
    if (existingCount.count === 0) {
      console.log('🌱 Seeding default events...');
      
      // Get admin user ID for createdBy field
      const [adminUser] = await db.select().from(users).where(eq(users.username, 'admin')).limit(1);
      const createdBy = adminUser?.id || 1;

      const DEFAULT_EVENTS = [
        {
          title: 'Global Gaming Championship 2024',
          slug: 'global-gaming-championship-2024',
          description: 'The biggest gaming tournament of the year featuring multiple game categories and massive prize pools. Compete against the best players worldwide in this ultimate gaming competition.',
          eventType: 'tournament' as const,
          status: 'published' as const,
          startDate: new Date('2024-06-15T10:00:00Z'),
          endDate: new Date('2024-06-17T22:00:00Z'),
          timezone: 'UTC',
          locationType: 'hybrid' as const,
          locationName: 'Gaming Arena Convention Center',
          locationAddress: '123 Gaming Street, Game City, GC 12345',
          onlineUrl: 'https://stream.gamerconnect.com/championship',
          registrationEnabled: true,
          registrationStartDate: new Date('2024-04-01T00:00:00Z'),
          registrationEndDate: new Date('2024-06-10T23:59:59Z'),
          maxParticipants: 500,
          currentParticipants: 247,
          registrationFee: 2500, // $25.00
          bannerImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImNoYW1waW9uc2hpcCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I0ZGRDcwMDsiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNGRjg5MDA7Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNjaGFtcGlvbnNoaXApIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI0OCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMyQzNFNTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5HTE9CQUwgR0FNSU5HPC90ZXh0Pjx0ZXh0IHg9IjUwJSIgeT0iNjAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzYiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjMkMzRTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Q0hBTVBJT05TSElQIDIwMjQ8L3RleHQ+PC9zdmc+',
          rules: `
# Tournament Rules

## Eligibility
- Open to players aged 16 and above
- Must have valid government-issued ID
- No previous tournament bans

## Competition Format
- Single elimination brackets
- Best of 3 matches in early rounds
- Best of 5 in semifinals and finals

## Prize Distribution
- 1st Place: $10,000 + Trophy
- 2nd Place: $5,000 + Medal  
- 3rd Place: $2,500 + Medal
- Top 8: Gaming gear packages

## Code of Conduct
- Respectful behavior required
- No cheating or exploits
- Follow all game-specific rules
          `,
          prizes: `
# Prize Pool: $25,000

**1st Place Winner**
- $10,000 Cash Prize
- Championship Trophy
- Gaming Setup Worth $2,000
- 1-Year Pro Gaming License

**2nd Place**
- $5,000 Cash Prize
- Silver Medal
- Gaming Headset & Keyboard Set

**3rd Place**
- $2,500 Cash Prize
- Bronze Medal
- Gaming Mouse & Mousepad Set

**Top 8 Finalists**
- Gaming merchandise packages
- Tournament certificates
- Priority registration for next year's event
          `,
          requirements: `
# Requirements

## Technical Requirements
- Stable internet connection (minimum 50 Mbps)
- Gaming setup capable of 60+ FPS
- Microphone for team communication
- Webcam for identity verification

## Documentation
- Government-issued photo ID
- Proof of age (birth certificate if under 18)
- Signed waiver and tournament agreement

## Skills
- Intermediate to advanced gaming skills
- Previous competitive gaming experience preferred
- Ability to handle tournament pressure
          `,
          contactInfo: 'tournament@gamerconnect.com | +1-555-GAME-123',
          metaTitle: 'Global Gaming Championship 2024 - Register Now',
          metaDescription: 'Join the biggest gaming tournament of 2024. $25,000 prize pool, 500 players, multiple game categories. Register now for the Global Gaming Championship.',
          featured: true,
          createdBy: createdBy
        },
        {
          title: 'Indie Game Development Workshop',
          slug: 'indie-game-dev-workshop-2024',
          description: 'Learn the fundamentals of indie game development in this hands-on workshop. Perfect for beginners and aspiring game developers looking to create their first game.',
          eventType: 'community' as const,
          status: 'published' as const,
          startDate: new Date('2024-05-20T14:00:00Z'),
          endDate: new Date('2024-05-20T18:00:00Z'),
          timezone: 'UTC',
          locationType: 'online' as const,
          onlineUrl: 'https://meet.gamerconnect.com/gamedev-workshop',
          registrationEnabled: true,
          registrationStartDate: new Date('2024-04-15T00:00:00Z'),
          registrationEndDate: new Date('2024-05-18T23:59:59Z'),
          maxParticipants: 100,
          currentParticipants: 67,
          registrationFee: 0, // Free event
          bannerImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9IndvcmtzaG9wIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMjdBRTYwOyIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzJFQ0M3MTsiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3dvcmtzaG9wKSIvPjx0ZXh0IHg9IjUwJSIgeT0iNDAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNDIiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjRkZGRkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SU5ESUUgR0FNRSBERVZFTE9QTUVOVDwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjYwJSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjMyIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlBSQUNUSUNBTCBXT1JLU0hPUDwvdGV4dD48L3N2Zz4=',
          rules: `
# Workshop Guidelines

## What to Bring
- Laptop with Unity or Godot installed
- Basic programming knowledge helpful but not required
- Notebook for taking notes

## Schedule
- 2:00 PM - Welcome & Introductions
- 2:30 PM - Game Design Basics
- 3:30 PM - Hands-on Development
- 4:30 PM - Break
- 4:45 PM - Publishing Your Game
- 5:45 PM - Q&A Session

## Code of Conduct
- Respectful learning environment
- Help fellow participants when possible
- Ask questions freely
          `,
          requirements: `
# Workshop Requirements

## Technical Setup
- Computer with Unity 2022.3 LTS or Godot 4.x installed
- Stable internet connection for online participation
- Microphone for Q&A sessions (optional but recommended)

## Skill Level
- Beginner friendly - no prior game dev experience needed
- Basic computer literacy required
- Enthusiasm for learning game development

## Materials Provided
- Workshop slides and resources
- Sample project files
- List of recommended learning resources
- Certificate of completion
          `,
          contactInfo: 'workshops@gamerconnect.com',
          metaTitle: 'Free Indie Game Development Workshop - Learn Game Dev Basics',
          metaDescription: 'Join our free online workshop to learn indie game development. Perfect for beginners. Covers Unity, Godot, and game design principles.',
          featured: false,
          createdBy: createdBy
        },
        {
          title: 'Retro Gaming Night',
          slug: 'retro-gaming-night-april',
          description: 'Step back in time and enjoy classic arcade games, retro consoles, and nostalgic gaming experiences. Bring your friends for a night of vintage gaming fun!',
          eventType: 'meetup' as const,
          status: 'published' as const,
          startDate: new Date('2024-04-25T19:00:00Z'),
          endDate: new Date('2024-04-26T02:00:00Z'),
          timezone: 'UTC',
          locationType: 'physical' as const,
          locationName: 'Retro Gaming Lounge',
          locationAddress: '456 Arcade Boulevard, Pixel City, PC 67890',
          registrationEnabled: true,
          registrationStartDate: new Date('2024-04-01T00:00:00Z'),
          registrationEndDate: new Date('2024-04-24T18:00:00Z'),
          maxParticipants: 50,
          currentParticipants: 34,
          registrationFee: 1000, // $10.00
          bannerImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InJldHJvIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojOUMyN0IwOyIvPjxzdG9wIG9mZnNldD0iNTAlIiBzdHlsZT0ic3RvcC1jb2xvcjojRTkxRTYzOyIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I0ZGNTcyMjsiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3JldHJvKSIvPjx0ZXh0IHg9IjUwJSIgeT0iNDAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNDgiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjRkZGRkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UkVUUk8gR0FNSU5HPC90ZXh0Pjx0ZXh0IHg9IjUwJSIgeT0iNjAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzYiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjRkZGRkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TklHSFQgRVZFTlQ8L3RleHQ+PC9zdmc+',
          rules: `
# Event Rules

## What's Included
- Access to 20+ classic arcade machines
- Retro console gaming stations (NES, SNES, Genesis, etc.)
- Complimentary snacks and soft drinks
- Tournament brackets for classic games

## Schedule
- 7:00 PM - Doors open & free play begins
- 8:00 PM - Pac-Man tournament
- 9:00 PM - Street Fighter II competition
- 10:00 PM - Retro trivia contest
- 11:00 PM - Free play continues
- 2:00 AM - Event ends

## Guidelines
- Respect the vintage equipment
- Take turns fairly on popular machines
- No outside food or drinks
- Age 16+ recommended (younger with parent/guardian)
          `,
          prizes: `
# Tournament Prizes

**Pac-Man Champion**
- Vintage Pac-Man merchandise
- $25 arcade credit voucher

**Street Fighter II Winner**
- Classic arcade joystick
- Tournament certificate

**Trivia Contest Top 3**
- Retro gaming art prints
- Gaming stickers and pins

**Participation**
- All attendees receive retro gaming buttons
- Photo opportunities with classic arcade setups
          `,
          requirements: `
# Event Requirements

## Age & Identification
- 16+ years recommended
- Under 18 requires parent/guardian consent
- Valid ID required for age verification

## What to Bring
- Comfortable clothes for standing/playing
- Small bag for prizes and merchandise
- Phone/camera for memories (flash photography allowed)

## Health & Safety
- Hand sanitizer stations available
- Well-ventilated gaming area
- Food allergies should be reported upon arrival
          `,
          contactInfo: 'events@gamerconnect.com | Social: @GamerConnect',
          metaTitle: 'Retro Gaming Night - Classic Arcade & Console Gaming',
          metaDescription: 'Join us for Retro Gaming Night featuring classic arcade machines, vintage consoles, tournaments, and nostalgic fun. Tickets $10.',
          featured: false,
          createdBy: createdBy
        },
        {
          title: 'Mobile Game Development Bootcamp',
          slug: 'mobile-gamedev-bootcamp-2024',
          description: 'Intensive 3-day bootcamp covering mobile game development for iOS and Android. Build and publish your first mobile game by the end of the program.',
          eventType: 'other' as const,
          status: 'published' as const,
          startDate: new Date('2024-07-08T09:00:00Z'),
          endDate: new Date('2024-07-10T17:00:00Z'),
          timezone: 'UTC',
          locationType: 'hybrid' as const,
          locationName: 'Tech Innovation Hub',
          locationAddress: '789 Developer Drive, Code City, CC 13579',
          onlineUrl: 'https://bootcamp.gamerconnect.com/mobile-dev',
          registrationEnabled: true,
          registrationStartDate: new Date('2024-05-01T00:00:00Z'),
          registrationEndDate: new Date('2024-07-01T23:59:59Z'),
          maxParticipants: 30,
          currentParticipants: 18,
          registrationFee: 29900, // $299.00
          bannerImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9Im1vYmlsZSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzMzOThEQjsiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM5QjU5QjY7Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNtb2JpbGUpIi8+PHRleHQgeD0iNTAlIiB5PSI0MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI0NCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNGRkZGRkYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5NT0JJTEUgR0FNRSBERVZFTE9QTUVOVDQ8L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI2MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIzMiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNGRkZGRkYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JTlRFTlNJVkUgQk9PVENBTVA8L3RleHQ+PC9zdmc+',
          rules: `
# Bootcamp Guidelines

## Daily Schedule
**Day 1: Foundations**
- 9:00 AM - Welcome & Setup
- 10:00 AM - Mobile Game Design Principles
- 12:00 PM - Lunch Break
- 1:00 PM - Unity Mobile Development
- 4:00 PM - Hands-on Project Start
- 5:00 PM - Day 1 Wrap-up

**Day 2: Development**
- 9:00 AM - Advanced Mobile Features
- 11:00 AM - Monetization Strategies
- 12:00 PM - Lunch Break
- 1:00 PM - Project Development Time
- 3:00 PM - Code Review & Optimization
- 5:00 PM - Day 2 Presentations

**Day 3: Publishing**
- 9:00 AM - App Store Guidelines
- 11:00 AM - Publishing Process
- 12:00 PM - Lunch Break
- 1:00 PM - Final Project Polish
- 3:00 PM - Project Presentations
- 4:00 PM - Graduation & Networking
- 5:00 PM - Program Ends

## Completion Requirements
- Attend all 3 days (minimum 80% attendance)
- Complete daily assignments
- Present final mobile game project
- Participate in group discussions
          `,
          requirements: `
# Bootcamp Prerequisites

## Technical Requirements
- Laptop capable of running Unity or similar IDE
- Android Studio and/or Xcode installed
- Android device for testing (iOS device optional)
- GitHub account for code version control

## Skill Level
- Basic programming experience (any language)
- Familiarity with software development concepts
- Prior mobile development experience helpful but not required
- High school diploma or equivalent

## What's Included
- 3-day intensive training
- All course materials and resources
- Lunch and refreshments daily
- Certificate of completion
- 30 days of mentorship support
- Access to exclusive developer community
          `,
          contactInfo: 'bootcamp@gamerconnect.com | Call: 1-555-BOOTCAMP',
          metaTitle: 'Mobile Game Development Bootcamp - 3-Day Intensive Program',
          metaDescription: '3-day mobile game development bootcamp. Learn iOS & Android game development, build and publish your game. Limited to 30 participants.',
          featured: true,
          createdBy: createdBy
        }
      ];
      
      await db.insert(events).values(DEFAULT_EVENTS);
      
      console.log(`✅ ${DEFAULT_EVENTS.length} events seeded successfully`);
    } else {
      console.log('ℹ️  Events already exist, skipping seeding');
    }
  } catch (error) {
    console.error('❌ Error seeding events:', error);
    throw error;
  }
}