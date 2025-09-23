import { db } from "@db";
import { webmasterTools } from '@shared/schema';

export async function seedWebmasterTools() {
  console.log('🌱 Seeding default webmaster tools...');

  try {
    // Check if webmaster tools already exist
    const existingTools = await db.select().from(webmasterTools);
    
    if (existingTools.length > 0) {
      console.log('ℹ️  Webmaster tools already exist, skipping seeding');
      return;
    }

    const webmasterToolsData = [
      {
        name: 'google_search_console',
        displayName: 'Google Search Console',
        description: 'Monitor and optimize your website\'s presence in Google Search results. Track search performance, submit sitemaps, and identify crawling issues.',
        verificationUrl: 'https://search.google.com/search-console',
        icon: 'google',
        helpUrl: 'https://support.google.com/webmasters/answer/9008080',
        priority: 1,
        status: 'active' as const,
        verificationStatus: 'not_verified' as const,
        isEnabled: true
      },
      {
        name: 'bing_webmaster_tools',
        displayName: 'Bing Webmaster Tools',
        description: 'Improve your website\'s performance on Bing and Yahoo search engines. Monitor crawl errors, submit URLs, and analyze search traffic.',
        verificationUrl: 'https://www.bing.com/webmasters',
        icon: 'bing',
        helpUrl: 'https://www.bing.com/webmasters/help/how-to-verify-ownership-of-your-site-afcfefc6',
        priority: 2,
        status: 'active' as const,
        verificationStatus: 'not_verified' as const,
        isEnabled: true
      },
      {
        name: 'yandex_webmaster',
        displayName: 'Yandex Webmaster',
        description: 'Optimize your website for Yandex search engine. Monitor indexing status, analyze search queries, and improve site performance for Russian market.',
        verificationUrl: 'https://webmaster.yandex.com/',
        icon: 'yandex',
        helpUrl: 'https://yandex.com/support/webmaster/service/rights.html',
        priority: 3,
        status: 'active' as const,
        verificationStatus: 'not_verified' as const,
        isEnabled: true
      },
      {
        name: 'baidu_webmaster_tools',
        displayName: 'Baidu Webmaster Tools',
        description: 'Optimize your website for Baidu search engine. Essential for reaching Chinese audiences and improving visibility in China.',
        verificationUrl: 'https://ziyuan.baidu.com/',
        icon: 'baidu',
        helpUrl: 'https://ziyuan.baidu.com/college/articleinfo?id=267',
        priority: 4,
        status: 'active' as const,
        verificationStatus: 'not_verified' as const,
        isEnabled: true
      },
      {
        name: 'google_analytics',
        displayName: 'Google Analytics',
        description: 'Track and analyze website traffic, user behavior, and conversion metrics. Get detailed insights into your audience and website performance.',
        verificationUrl: 'https://analytics.google.com/',
        icon: 'analytics',
        helpUrl: 'https://support.google.com/analytics/answer/1008080',
        priority: 5,
        status: 'active' as const,
        verificationStatus: 'not_verified' as const,
        isEnabled: true
      },
      {
        name: 'google_tag_manager',
        displayName: 'Google Tag Manager',
        description: 'Manage and deploy marketing tags without modifying code. Simplify tag management and improve website performance.',
        verificationUrl: 'https://tagmanager.google.com/',
        icon: 'tag',
        helpUrl: 'https://support.google.com/tagmanager/answer/6103696',
        priority: 6,
        status: 'active' as const,
        verificationStatus: 'not_verified' as const,
        isEnabled: true
      },
      {
        name: 'facebook_domain_verification',
        displayName: 'Facebook Domain Verification',
        description: 'Verify your domain with Facebook to gain control over link editing and to protect against unauthorized use of your domain.',
        verificationUrl: 'https://business.facebook.com/settings/brand-safety',
        icon: 'facebook',
        helpUrl: 'https://developers.facebook.com/docs/sharing/domain-verification/',
        priority: 7,
        status: 'active' as const,
        verificationStatus: 'not_verified' as const,
        isEnabled: true
      },
      {
        name: 'pinterest_site_verification',
        displayName: 'Pinterest Site Verification',
        description: 'Verify your website with Pinterest to access analytics, rich pins, and advertising features for your domain.',
        verificationUrl: 'https://business.pinterest.com/',
        icon: 'pinterest',
        helpUrl: 'https://help.pinterest.com/en/business/article/claim-your-website',
        priority: 8,
        status: 'active' as const,
        verificationStatus: 'not_verified' as const,
        isEnabled: true
      },
      {
        name: 'norton_safe_web',
        displayName: 'Norton Safe Web',
        description: 'Get your website reviewed by Norton to ensure it\'s safe for visitors. Display Norton Safe Web certification to build trust.',
        verificationUrl: 'https://safeweb.norton.com/',
        icon: 'shield',
        helpUrl: 'https://safeweb.norton.com/help',
        priority: 9,
        status: 'active' as const,
        verificationStatus: 'not_verified' as const,
        isEnabled: true
      },
      {
        name: 'alexa_site_verification',
        displayName: 'Alexa Site Verification',
        description: 'Verify your website with Alexa to access detailed analytics and website ranking information.',
        verificationUrl: 'https://www.alexa.com/',
        icon: 'alexa',
        helpUrl: 'https://support.alexa.com/hc/en-us/articles/219135887-Claiming-a-Site',
        priority: 10,
        status: 'active' as const,
        verificationStatus: 'not_verified' as const,
        isEnabled: true
      },
      {
        name: 'webmaster_360',
        displayName: '360 Webmaster Tools',
        description: 'Optimize your website for 360 Search (China). Monitor search performance and indexing status for Chinese market.',
        verificationUrl: 'https://zhanzhang.so.com/',
        icon: '360',
        helpUrl: 'https://zhanzhang.so.com/help',
        priority: 11,
        status: 'active' as const,
        verificationStatus: 'not_verified' as const,
        isEnabled: true
      },
      {
        name: 'seznam_webmaster',
        displayName: 'Seznam Webmaster',
        description: 'Optimize your website for Seznam search engine (Czech Republic). Monitor crawling and indexing for Czech market.',
        verificationUrl: 'https://www.seznam.cz/webmaster/',
        icon: 'seznam',
        helpUrl: 'https://napoveda.seznam.cz/cz/fulltext-hledani-v-internetu/',
        priority: 12,
        status: 'active' as const,
        verificationStatus: 'not_verified' as const,
        isEnabled: true
      }
    ];

    await db.insert(webmasterTools).values(webmasterToolsData);
    console.log(`✅ ${webmasterToolsData.length} webmaster tools seeded successfully`);

  } catch (error) {
    console.error('❌ Error seeding webmaster tools:', error);
    throw error;
  }
}