import { db } from '../db';
import { siteSettings } from '@shared/schema';

export async function seedSiteSettings() {
  console.log('🌱 Seeding default site settings...');
  
  try {
    const existingSettings = await db.select().from(siteSettings).limit(1);
    
    if (existingSettings.length > 0) {
      console.log('ℹ️  Site settings already exist, skipping seeding');
      return;
    }

    const defaultSettings = {
      // Basic site information
      siteTitle: 'Gaming Portal',
      metaDescription: 'Ultimate destination for online gaming entertainment. Play hundreds of free games across multiple genres including action, adventure, puzzle, strategy, and more.',
      keywords: 'online games, free games, browser games, gaming portal, action games, puzzle games, strategy games',
      
      // Theme and appearance
      currentTheme: 'default',
      
      // Features
      pushNotificationsEnabled: false,
      
      // Cookie consent settings (enabled by default for GDPR compliance)
      cookiePopupEnabled: true,
      cookiePopupTitle: 'We use cookies',
      cookiePopupMessage: 'We use cookies to improve your experience on our website. By browsing this website, you agree to our use of cookies.',
      cookieAcceptButtonText: 'Accept All',
      cookieDeclineButtonText: 'Decline',
      cookieLearnMoreText: 'Learn More',
      cookieLearnMoreUrl: '/privacy',
      cookiePopupPosition: 'bottom', // 'bottom', 'top', or 'center'
      cookiePopupTheme: 'dark', // 'dark' or 'light'
      
      // SEO settings
      googleAnalyticsId: '',
      facebookPixelId: '',
      tiktokPixelId: '',
      twitterPixelId: '',
      linkedinPixelId: '',
      pinterestPixelId: '',
      snapchatPixelId: '',
      redditPixelId: '',
      bingAdsId: '',
      hotjarId: '',
      clarityId: '',
      yandexMetricaId: '',
      baiduAnalyticsId: '',
      
      // Branding
      logoUrl: '',
      faviconUrl: '',
      textLogoColor: '#6366f1',
      
      // Custom code sections
      customHeadCode: '',
      customBodyCode: '',
      customFooterCode: '',
      
      // Robots.txt
      robotsTxt: `User-agent: *
Allow: /

Sitemap: ${process.env.VITE_APP_URL || 'https://your-domain.com'}/sitemap.xml`,
      
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.insert(siteSettings).values(defaultSettings);
    console.log('✅ Default site settings seeded successfully with cookies popup enabled');
  } catch (error) {
    console.error('❌ Error seeding site settings:', error);
    throw error;
  }
}