import { db } from './index';
import { staticPages } from '../shared/schema';

async function seedStaticPages() {
  try {
    // Check if there are existing pages first
    const existingPages = await db.select().from(staticPages);
    
    if (existingPages.length === 0) {
      console.log('No static pages found. Creating default pages...');
      
      // Define default pages
      const defaultPages = [
        {
          title: 'About Us',
          slug: 'about-us',
          content: `<h1>About Gaming Portal</h1>
<p>Welcome to Gaming Portal, your ultimate destination for online gaming entertainment!</p>
<p>We are a passionate team of gamers and developers dedicated to providing the best gaming experience on the web. Our platform offers a wide variety of games across multiple genres, ensuring there's something for everyone.</p>
<h2>Our Mission</h2>
<p>Our mission is to create an inclusive and engaging gaming community where players of all skill levels can enjoy quality games, share experiences, and connect with fellow gaming enthusiasts.</p>
<h2>What We Offer</h2>
<ul>
<li>Carefully curated selection of high-quality games</li>
<li>Regular updates with new and exciting titles</li>
<li>User-friendly interface for seamless navigation</li>
<li>Community features to connect with other gamers</li>
<li>Responsive design for gaming on any device</li>
</ul>
<p>Join us on this gaming adventure and discover why thousands of players choose Gaming Portal as their go-to gaming platform!</p>`,
          pageType: 'about',
          status: 'active',
          metaTitle: 'About Us | Gaming Portal',
          metaDescription: 'Learn about Gaming Portal, our mission, and what we offer to the gaming community. Discover why we are the ultimate destination for online gaming entertainment.'
        },
        {
          title: 'Contact Us',
          slug: 'contact-us',
          content: `<h1>Contact Us</h1>
<p>We'd love to hear from you! Whether you have a question, feedback, or just want to say hello, please don't hesitate to reach out to us.</p>
<h2>Get in Touch</h2>
<p>Email: support@gamingportal.com</p>
<p>Phone: +1 (555) 123-4567</p>
<p>Hours of Operation: Monday - Friday, 9:00 AM - 6:00 PM EST</p>
<h2>Send Us a Message</h2>
<p>Use the form below to send us a message and we'll get back to you as soon as possible:</p>
<div>[Contact form would be implemented here]</div>
<h2>Follow Us</h2>
<p>Stay connected with us on social media for the latest news, game releases, and community events:</p>
<ul>
<li>Twitter: @GamingPortal</li>
<li>Facebook: /GamingPortalOfficial</li>
<li>Instagram: @gaming_portal</li>
<li>Discord: GamingPortal Community</li>
</ul>
<p>We value your feedback and are committed to providing the best possible gaming experience!</p>`,
          pageType: 'contact',
          status: 'active',
          metaTitle: 'Contact Us | Gaming Portal',
          metaDescription: 'Get in touch with the Gaming Portal team. We are here to help with any questions, feedback, or inquiries you might have about our gaming platform.'
        },
        {
          title: 'Privacy Policy',
          slug: 'privacy-policy',
          content: `<h1>Privacy Policy</h1>
<p>Last Updated: May 1, 2025</p>
<p>This Privacy Policy describes how Gaming Portal ("we", "us", or "our") collects, uses, and shares your personal information when you visit our website or use our services.</p>
<h2>Information We Collect</h2>
<p>We collect several types of information from and about users of our website, including:</p>
<ul>
<li>Personal information such as name, email address, and user preferences</li>
<li>Account information created when you register</li>
<li>Game activity and performance statistics</li>
<li>Device and browser information</li>
<li>IP address and location data</li>
</ul>
<h2>How We Use Your Information</h2>
<p>We use the information we collect to:</p>
<ul>
<li>Provide, maintain, and improve our services</li>
<li>Personalize your experience and deliver content relevant to your interests</li>
<li>Process transactions and send related information</li>
<li>Send notifications, updates, and support messages</li>
<li>Analyze usage patterns and improve our website</li>
</ul>
<h2>Sharing Your Information</h2>
<p>We may share your information with:</p>
<ul>
<li>Service providers who perform services on our behalf</li>
<li>Partners with whom we offer co-branded services</li>
<li>Law enforcement or other parties when required by law or to protect our rights</li>
</ul>
<h2>Your Privacy Rights</h2>
<p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
<ul>
<li>Access to your personal information</li>
<li>Correction of inaccurate data</li>
<li>Deletion of your data</li>
<li>Restrictions on processing</li>
</ul>
<p>To exercise any of these rights, please contact us using the information provided in the Contact Us section.</p>
<h2>Changes to This Policy</h2>
<p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.</p>`,
          pageType: 'privacy',
          status: 'active',
          metaTitle: 'Privacy Policy | Gaming Portal',
          metaDescription: 'Read our privacy policy to understand how Gaming Portal collects, uses, and protects your personal information when you use our website and services.'
        },
        {
          title: 'Terms of Service',
          slug: 'terms-of-service',
          content: `<h1>Terms of Service</h1>
<p>Last Updated: May 1, 2025</p>
<p>Welcome to Gaming Portal. By accessing or using our website, you agree to be bound by these Terms of Service ("Terms"). Please read them carefully.</p>
<h2>Acceptance of Terms</h2>
<p>By accessing or using our services, you agree to these Terms and our Privacy Policy. If you do not agree to these Terms, you may not use our services.</p>
<h2>User Accounts</h2>
<p>To access certain features of our website, you may be required to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to:</p>
<ul>
<li>Provide accurate and complete information</li>
<li>Update your information as necessary</li>
<li>Protect your account security</li>
<li>Notify us immediately of any unauthorized access</li>
</ul>
<h2>User Content</h2>
<p>Our services may allow you to post, submit, or transmit content. By providing content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, and display such content.</p>
<h2>Prohibited Activities</h2>
<p>You agree not to:</p>
<ul>
<li>Violate any laws or regulations</li>
<li>Infringe on the rights of others</li>
<li>Interfere with the proper functioning of our services</li>
<li>Attempt to access areas of our systems not intended for public use</li>
<li>Use our services for unauthorized commercial purposes</li>
</ul>
<h2>Termination</h2>
<p>We reserve the right to suspend or terminate your access to our services at any time for any reason, including violation of these Terms.</p>
<h2>Disclaimer of Warranties</h2>
<p>Our services are provided "as is" without warranties of any kind, either express or implied.</p>
<h2>Limitation of Liability</h2>
<p>We shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.</p>
<h2>Changes to Terms</h2>
<p>We may modify these Terms at any time. Your continued use of our services following any changes constitutes your acceptance of the modified Terms.</p>`,
          pageType: 'terms',
          status: 'active',
          metaTitle: 'Terms of Service | Gaming Portal',
          metaDescription: 'Review Gaming Portal terms of service agreement. These terms outline the rules, guidelines, and policies that govern your use of our gaming platform.'
        },
        {
          title: 'Cookie Policy',
          slug: 'cookie-policy',
          content: `<h1>Cookie Policy</h1>
<p>Last Updated: May 1, 2025</p>
<p>This Cookie Policy explains how Gaming Portal ("we", "us", or "our") uses cookies and similar technologies on our website.</p>
<h2>What Are Cookies?</h2>
<p>Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to the website owners.</p>
<h2>Types of Cookies We Use</h2>
<p>We use the following types of cookies:</p>
<ul>
<li><strong>Essential Cookies:</strong> These cookies are necessary for the website to function properly and cannot be switched off in our systems.</li>
<li><strong>Performance Cookies:</strong> These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site.</li>
<li><strong>Functionality Cookies:</strong> These cookies enable the website to provide enhanced functionality and personalization.</li>
<li><strong>Targeting Cookies:</strong> These cookies may be set through our site by our advertising partners to build a profile of your interests.</li>
</ul>
<h2>How to Manage Cookies</h2>
<p>Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience.</p>
<h2>Third-Party Cookies</h2>
<p>In addition to our own cookies, we may also use various third-party cookies to report usage statistics, deliver advertisements, and so on.</p>
<h2>Changes to This Policy</h2>
<p>We may update our Cookie Policy from time to time. We will notify you of any changes by posting the new Cookie Policy on this page and updating the "Last Updated" date.</p>
<h2>Contact Us</h2>
<p>If you have any questions about our Cookie Policy, please contact us.</p>`,
          pageType: 'cookie-policy',
          status: 'active',
          metaTitle: 'Cookie Policy | Gaming Portal',
          metaDescription: 'Learn about how Gaming Portal uses cookies and similar technologies on our website, what types of cookies we use, and how you can manage your cookie preferences.'
        },
        {
          title: 'Frequently Asked Questions',
          slug: 'faq',
          content: `<h1>Frequently Asked Questions</h1>
<p>Find answers to commonly asked questions about Gaming Portal.</p>
<h2>General Questions</h2>
<h3>What is Gaming Portal?</h3>
<p>Gaming Portal is an online platform that offers a wide variety of browser-based games that you can play instantly without downloads.</p>
<h3>Is Gaming Portal free to use?</h3>
<p>Yes, the majority of our games are free to play. Some premium games or features may require a subscription or one-time purchase.</p>
<h3>Do I need to create an account to play games?</h3>
<p>While you can play many games as a guest, creating an account allows you to save your progress, earn achievements, participate in leaderboards, and access exclusive features.</p>
<h2>Technical Support</h2>
<h3>What devices can I use to play games on Gaming Portal?</h3>
<p>Our platform is compatible with most modern web browsers on desktops, laptops, tablets, and smartphones.</p>
<h3>Why are some games not loading properly?</h3>
<p>This could be due to several factors, including your internet connection, browser settings, or device compatibility. Try refreshing the page, clearing your cache, or switching to a different browser.</p>
<h3>How do I report a bug or technical issue?</h3>
<p>You can report bugs or technical issues through our Contact Us page or by emailing support@gamingportal.com.</p>
<h2>Account Management</h2>
<h3>How do I reset my password?</h3>
<p>Click on the "Forgot Password" link on the login page and follow the instructions sent to your registered email address.</p>
<h3>Can I change my username?</h3>
<p>Currently, usernames cannot be changed after account creation. Please choose your username carefully.</p>
<h3>How do I delete my account?</h3>
<p>To delete your account, go to your Account Settings and select the "Delete Account" option. Please note that this action is irreversible.</p>
<h2>Games and Features</h2>
<h3>How often are new games added?</h3>
<p>We add new games regularly, typically several times per month. Check our homepage or follow our social media channels for announcements about new releases.</p>
<h3>How do game ratings work?</h3>
<p>Users can rate games on a scale of 1 to 5 stars. The overall rating for each game is an average of all user ratings.</p>
<h3>Can I suggest a game to be added to the platform?</h3>
<p>Yes! We welcome game suggestions. Please use the "Suggest a Game" form on our Contact Us page.</p>`,
          pageType: 'faq',
          status: 'active',
          metaTitle: 'Frequently Asked Questions | Gaming Portal',
          metaDescription: 'Find answers to commonly asked questions about Gaming Portal, including account management, technical support, games, and features.'
        }
      ];
      
      // Insert default pages
      for (const page of defaultPages) {
        await db.insert(staticPages).values({
          ...page,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      console.log('Default static pages created successfully!');
    } else {
      console.log(`Found ${existingPages.length} existing static pages. Skipping seed.`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding static pages:', error);
    process.exit(1);
  }
}

seedStaticPages();