import { db } from "@db";
import { teamMembers } from '@shared/schema';
import { count } from 'drizzle-orm';

const DEFAULT_TEAM_MEMBERS = [
  {
    name: 'Alex Chen',
    designation: 'Founder & CEO',
    profilePicture: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iIzNBODFCQSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNzAiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjRkZGRkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+QUM8L3RleHQ+PC9zdmc+',
    bio: 'Passionate gamer and entrepreneur with over 10 years of experience in the gaming industry. Founded GamerConnect to create the ultimate gaming destination for players worldwide.',
    socialLinkedin: 'https://linkedin.com/in/alexchen',
    socialTwitter: 'https://twitter.com/alexchen_games',
    socialGithub: 'https://github.com/alexchen',
    displayOrder: 1,
    status: 'active' as const
  },
  {
    name: 'Sarah Rodriguez',
    designation: 'Lead Game Developer',
    profilePicture: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI0U5MUU2MyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNzAiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjRkZGRkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+U1I8L3RleHQ+PC9zdmc+',
    bio: 'Full-stack developer specializing in game development and web technologies. Expert in Unity, HTML5 games, and mobile app development with a focus on creating engaging user experiences.',
    socialLinkedin: 'https://linkedin.com/in/sarahrodriguez',
    socialTwitter: 'https://twitter.com/sarah_codes',
    socialGithub: 'https://github.com/sarahrodriguez',
    socialInstagram: 'https://instagram.com/sarahcodes',
    displayOrder: 2,
    status: 'active' as const
  },
  {
    name: 'Marcus Johnson',
    designation: 'Head of Design',
    profilePicture: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iIzlCNTlCNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNzAiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjRkZGRkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TUo8L3RleHQ+PC9zdmc+',
    bio: 'Creative director with expertise in UI/UX design, game art, and user interface development. Brings games to life through stunning visuals and intuitive design.',
    socialLinkedin: 'https://linkedin.com/in/marcusjohnson',
    socialTwitter: 'https://twitter.com/marcus_design',
    socialInstagram: 'https://instagram.com/marcusdesigns',
    displayOrder: 3,
    status: 'active' as const
  },
  {
    name: 'Emily Watson',
    designation: 'Community Manager',
    profilePicture: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iIzI3QUU2MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNzAiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjRkZGRkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+RVc8L3RleHQ+PC9zdmc+',
    bio: 'Gaming enthusiast and community builder dedicated to creating awesome experiences for our players. Manages our social media, events, and player engagement initiatives.',
    socialLinkedin: 'https://linkedin.com/in/emilywatson',
    socialTwitter: 'https://twitter.com/emily_gaming',
    socialInstagram: 'https://instagram.com/emilygaming',
    socialFacebook: 'https://facebook.com/emily.watson.gaming',
    socialTiktok: 'https://tiktok.com/@emilygaming',
    displayOrder: 4,
    status: 'active' as const
  },
  {
    name: 'David Kim',
    designation: 'Backend Developer',
    profilePicture: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI0ZGNTcyMiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNzAiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjRkZGRkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+REs8L3RleHQ+PC9zdmc+',
    bio: 'Backend engineer focused on building scalable, high-performance systems. Ensures our platform runs smoothly and handles millions of game sessions efficiently.',
    socialLinkedin: 'https://linkedin.com/in/davidkim',
    socialTwitter: 'https://twitter.com/david_codes',
    socialGithub: 'https://github.com/davidkim',
    displayOrder: 5,
    status: 'active' as const
  },
  {
    name: 'Lisa Park',
    designation: 'Content Writer & SEO Specialist',
    profilePicture: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI0Y5QzkzNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNzAiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjRkZGRkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TFA8L3RleHQ+PC9zdmc+',
    bio: 'Content strategist and gaming journalist who creates engaging blog content, game reviews, and SEO-optimized articles. Keeps our community informed about the latest gaming trends.',
    socialLinkedin: 'https://linkedin.com/in/lisapark',
    socialTwitter: 'https://twitter.com/lisa_writes',
    socialInstagram: 'https://instagram.com/lisawrites',
    displayOrder: 6,
    status: 'active' as const
  }
];

export async function seedTeamMembers() {
  try {
    // Check if team members already exist
    const [existingCount] = await db
      .select({ count: count() })
      .from(teamMembers);

    // Only seed if no team members exist (fresh deployment)
    if (existingCount.count === 0) {
      console.log('🌱 Seeding default team members...');
      
      await db.insert(teamMembers).values(DEFAULT_TEAM_MEMBERS);
      
      console.log(`✅ ${DEFAULT_TEAM_MEMBERS.length} team members seeded successfully`);
    } else {
      console.log('ℹ️  Team members already exist, skipping seeding');
    }
  } catch (error) {
    console.error('❌ Error seeding team members:', error);
    throw error;
  }
}