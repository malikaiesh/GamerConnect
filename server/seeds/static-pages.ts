import { db } from '../db';
import { staticPages } from '@shared/schema';
import { count } from 'drizzle-orm';

const DEFAULT_STATIC_PAGES = [
  {
    title: 'About Us',
    slug: 'about',
    content: `
# About GamerConnect

Welcome to GamerConnect - your ultimate destination for online gaming entertainment!

## Our Mission

At GamerConnect, we believe gaming should be accessible, fun, and bring people together. Our mission is to create a comprehensive gaming platform where players can discover new games, connect with fellow gamers, and enjoy endless entertainment.

## What We Offer

### 🎮 Vast Game Library
Browse through hundreds of games across multiple categories including action, adventure, puzzle, strategy, and more. From quick casual games to immersive adventures, we have something for every type of gamer.

### 📱 Multi-Platform Gaming
Play directly in your browser or download games for mobile devices. Our platform supports various game formats including HTML5, Android APK, iOS apps, and Unity games.

### 🏆 Gaming Community
Connect with other players, share your achievements, and discover new gaming experiences through our vibrant community features.

### 📰 Gaming Content
Stay updated with the latest gaming news, tutorials, and reviews through our comprehensive blog section.

## Our Story

GamerConnect was founded by passionate gamers who wanted to create a centralized platform for discovering and playing quality games. We started as a small project and have grown into a comprehensive gaming portal serving thousands of players worldwide.

## Why Choose GamerConnect?

- **Free to Play**: Most of our games are completely free
- **No Downloads Required**: Play instantly in your browser
- **Regular Updates**: New games added weekly
- **Safe & Secure**: All games are tested and verified
- **Mobile Friendly**: Optimized for all devices
- **Community Driven**: Your feedback shapes our platform

## Join Our Community

Whether you're a casual player looking for quick entertainment or a hardcore gamer seeking your next challenge, GamerConnect has something for you. Join thousands of players who have made GamerConnect their go-to gaming destination.

Ready to start gaming? Browse our game collection and discover your next favorite game today!

---

*Have questions or suggestions? Contact us at support@gamerconnect.com*
    `,
    pageType: 'about' as const,
    metaTitle: 'About GamerConnect - Your Ultimate Gaming Destination',
    metaDescription: 'Learn about GamerConnect\'s mission to provide the best online gaming experience. Discover our game library, community features, and what makes us unique.',
    status: 'active' as const
  },
  {
    title: 'Privacy Policy',
    slug: 'privacy',
    content: `
# Privacy Policy

**Effective Date**: January 1, 2024  
**Last Updated**: January 1, 2024

## Introduction

GamerConnect ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our gaming platform.

## Information We Collect

### Personal Information
- Email address (for account creation)
- Username and display name
- Profile information you choose to share
- Game preferences and activity

### Automatically Collected Information
- IP address and location data
- Browser type and device information
- Game usage statistics and preferences
- Cookies and similar technologies

### Game Data
- Game scores and achievements
- Play time and session data
- Game preferences and favorites

## How We Use Your Information

We use your information to:
- Provide and maintain our gaming services
- Create and manage your account
- Personalize your gaming experience
- Send you important updates and notifications
- Improve our platform and games
- Ensure security and prevent fraud

## Information Sharing

We do not sell your personal information. We may share information:
- With your consent
- To comply with legal obligations
- With service providers who help operate our platform
- In case of business transfers or mergers

## Data Security

We implement appropriate security measures to protect your information:
- Encryption of sensitive data
- Regular security assessments
- Access controls and authentication
- Secure data storage practices

## Your Rights

You have the right to:
- Access your personal information
- Correct inaccurate information
- Delete your account and data
- Opt-out of marketing communications
- Export your data

## Cookies and Tracking

We use cookies to:
- Remember your preferences
- Analyze website traffic
- Personalize content
- Provide social media features

You can control cookies through your browser settings.

## Children's Privacy

Our platform is not intended for children under 13. We do not knowingly collect information from children under 13.

## International Users

Your information may be transferred to and stored in countries other than your own, including the United States.

## Changes to Privacy Policy

We may update this policy periodically. We'll notify you of significant changes via email or platform notifications.

## Contact Information

If you have questions about this Privacy Policy:
- Email: privacy@gamerconnect.com
- Address: [Company Address]

## Data Retention

We retain your information as long as your account is active or as needed to provide services.

---

*This policy is designed to be transparent about our data practices. Please contact us if you have any questions.*
    `,
    pageType: 'privacy' as const,
    metaTitle: 'Privacy Policy - GamerConnect',
    metaDescription: 'Learn how GamerConnect protects your privacy and handles your personal information. Read our comprehensive privacy policy.',
    status: 'active' as const
  },
  {
    title: 'Terms of Service',
    slug: 'terms',
    content: `
# Terms of Service

**Effective Date**: January 1, 2024  
**Last Updated**: January 1, 2024

## Acceptance of Terms

By accessing and using GamerConnect, you accept and agree to be bound by these Terms of Service.

## Description of Service

GamerConnect is an online gaming platform that provides access to various games, community features, and gaming-related content.

## User Accounts

### Registration
- You must provide accurate information
- You're responsible for maintaining account security
- One account per person
- You must be 13+ years old to create an account

### Account Responsibilities
- Keep your login credentials secure
- Notify us of unauthorized access
- You're responsible for all account activity

## Acceptable Use

### You May
- Play games for personal entertainment
- Share content within community guidelines
- Provide feedback and suggestions
- Use our platform for lawful purposes

### You May Not
- Violate any laws or regulations
- Harass, threaten, or abuse other users
- Distribute malware or harmful content
- Attempt to hack or compromise our systems
- Create multiple accounts
- Use automated tools or bots

## Content and Intellectual Property

### Our Content
- All games, text, graphics, and software are our property
- You may not copy, modify, or distribute our content
- Trademarks and logos are protected

### User Content
- You retain rights to content you create
- You grant us license to display and distribute user content
- You're responsible for content you share

## Gaming Rules

### Fair Play
- No cheating, exploiting, or hacking
- Respect other players
- Follow game-specific rules
- Report violations to our team

### Account Actions
We may suspend or terminate accounts for:
- Terms of Service violations
- Cheating or unfair play
- Harassment or abuse
- Illegal activities

## Privacy

Your privacy is important to us. Please review our Privacy Policy for information about data collection and use.

## Disclaimers

### Service Availability
- Services provided "as is" without warranties
- We don't guarantee uninterrupted service
- Games and features may be modified or removed

### Limitation of Liability
- We're not liable for indirect or consequential damages
- Total liability limited to amount paid for services
- Some jurisdictions may not allow these limitations

## Third-Party Content

- We may include links to third-party websites
- We're not responsible for third-party content
- Third-party terms may apply

## Modifications

We reserve the right to modify these terms at any time. Continued use constitutes acceptance of changes.

## Termination

### By You
- You may delete your account anytime
- Termination doesn't relieve you of prior obligations

### By Us
We may terminate accounts for:
- Terms violations
- Extended inactivity
- Legal requirements
- Service discontinuation

## Dispute Resolution

### Governing Law
These terms are governed by [Jurisdiction] law.

### Dispute Process
1. Contact us to resolve issues informally
2. Binding arbitration for unresolved disputes
3. Small claims court option available

## Contact Information

For questions about these Terms of Service:
- Email: support@gamerconnect.com
- Address: [Company Address]

## Severability

If any provision is found unenforceable, the remaining provisions continue in effect.

---

*By using GamerConnect, you acknowledge that you have read, understood, and agree to these Terms of Service.*
    `,
    pageType: 'terms' as const,
    metaTitle: 'Terms of Service - GamerConnect',
    metaDescription: 'Read GamerConnect\'s Terms of Service. Understand your rights and responsibilities when using our gaming platform.',
    status: 'active' as const
  },
  {
    title: 'Contact Us',
    slug: 'contact',
    content: `
# Contact Us

Get in touch with the GamerConnect team! We're here to help with any questions, suggestions, or issues you might have.

## Quick Contact

### 📧 Email Support
- **General Support**: support@gamerconnect.com
- **Technical Issues**: tech@gamerconnect.com
- **Business Inquiries**: business@gamerconnect.com
- **Press & Media**: press@gamerconnect.com

### 🕒 Response Times
- General inquiries: 24-48 hours
- Technical issues: 12-24 hours
- Urgent matters: Same business day

## What We Can Help With

### 🎮 Gaming Support
- Game not loading properly
- Account issues and login problems
- Missing game progress or saves
- Game recommendations

### 🛠 Technical Support
- Website functionality issues
- Mobile app problems
- Payment and billing questions
- Browser compatibility

### 💬 General Inquiries
- Feature requests and suggestions
- Partnership opportunities
- Media and press inquiries
- Community feedback

### 🚨 Report Issues
- Inappropriate content or behavior
- Bugs and technical glitches
- Security concerns
- Copyright violations

## Contact Form

*[A contact form would be integrated here in the actual implementation]*

Fill out our online contact form for the fastest response. Include:
- Your username (if applicable)
- Nature of your inquiry
- Detailed description of the issue
- Any relevant screenshots or error messages

## Community Support

### Discord Server
Join our community Discord server for:
- Real-time chat with other gamers
- Community support and tips
- Game discussions and recommendations
- Direct access to moderators

### Social Media
Follow us for updates and quick responses:
- **Twitter**: @GamerConnect
- **Facebook**: /GamerConnectOfficial
- **Instagram**: @gamer_connect

## Developer Resources

### Game Submission
Interested in featuring your game on our platform?
- **Developer Portal**: dev@gamerconnect.com
- **Submission Guidelines**: Available on request
- **Revenue Sharing**: Competitive rates available

### API Access
- **Documentation**: Available to approved developers
- **Integration Support**: Technical assistance provided
- **Partnership Opportunities**: Custom solutions available

## Business Information

### Company Details
- **Company Name**: GamerConnect Gaming Platform
- **Business Type**: Online Gaming Portal
- **Founded**: 2023
- **Location**: [City, Country]

### Legal Inquiries
- **Privacy Concerns**: privacy@gamerconnect.com
- **Terms of Service**: legal@gamerconnect.com
- **DMCA Notices**: dmca@gamerconnect.com

## FAQ

### Common Questions

**Q: How do I reset my password?**
A: Use the "Forgot Password" link on the login page, or contact support.

**Q: Why isn't a game loading?**
A: Try refreshing the page, clearing your browser cache, or using a different browser.

**Q: Can I suggest a game to be added?**
A: Absolutely! Send us your suggestions at support@gamerconnect.com.

**Q: How do I delete my account?**
A: Contact support with your deletion request, and we'll process it within 48 hours.

**Q: Is GamerConnect free to use?**
A: Yes! Most features and games are completely free to play.

## Office Hours

**Customer Support Hours:**
- Monday - Friday: 9:00 AM - 6:00 PM (EST)
- Saturday: 10:00 AM - 4:00 PM (EST)
- Sunday: Closed (Emergency support only)

*Emergency technical issues are handled 24/7*

## Feedback

We love hearing from our community! Your feedback helps us improve GamerConnect for everyone. Don't hesitate to reach out with:
- Feature suggestions
- Game recommendations
- User experience improvements
- General comments and praise

Thank you for being part of the GamerConnect community!

---

*We typically respond within 24 hours during business days. Thank you for your patience!*
    `,
    pageType: 'contact' as const,
    metaTitle: 'Contact GamerConnect - Get Support & Share Feedback',
    metaDescription: 'Contact GamerConnect for support, technical help, business inquiries, or to share feedback. Multiple ways to reach our team.',
    status: 'active' as const
  }
];

export async function seedStaticPages() {
  try {
    // Check if static pages already exist
    const [existingCount] = await db
      .select({ count: count() })
      .from(staticPages);

    // Only seed if no pages exist (fresh deployment)
    if (existingCount.count === 0) {
      console.log('🌱 Seeding default static pages...');
      
      await db.insert(staticPages).values(DEFAULT_STATIC_PAGES);
      
      console.log(`✅ ${DEFAULT_STATIC_PAGES.length} static pages seeded successfully`);
    } else {
      console.log('ℹ️  Static pages already exist, skipping seeding');
    }
  } catch (error) {
    console.error('❌ Error seeding static pages:', error);
    throw error;
  }
}