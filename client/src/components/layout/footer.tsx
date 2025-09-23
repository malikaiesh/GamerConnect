import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { SiteSetting } from '@shared/schema';

export function Footer() {
  const { data: settings } = useQuery<SiteSetting>({
    queryKey: ['/api/settings'],
  });

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              {settings?.siteLogo && !settings?.useTextLogo ? (
                <img 
                  src={settings.siteLogo} 
                  alt={settings.siteTitle || 'Game Zone'} 
                  className="h-10 w-auto" 
                />
              ) : (
                <>
                  <i className="ri-gamepad-line text-primary text-3xl"></i>
                  <span 
                    className="text-2xl font-bold font-poppins"
                    style={settings?.textLogoColor ? { color: settings.textLogoColor } : {}}
                  >
                    {settings?.siteTitle ? settings.siteTitle : 'Game'}
                  </span>
                </>
              )}
            </div>
            <p className="text-gray-400 mb-4">
              Your ultimate destination for free online gaming and gaming news.
            </p>
            <div className="flex space-x-4">
              {settings?.socialFacebook && (
                <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <i className="ri-facebook-fill text-xl"></i>
                </a>
              )}
              {settings?.socialTwitter && (
                <a href={settings.socialTwitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <i className="ri-twitter-fill text-xl"></i>
                </a>
              )}
              {settings?.socialInstagram && (
                <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <i className="ri-instagram-fill text-xl"></i>
                </a>
              )}
              {settings?.socialYoutube && (
                <a href={settings.socialYoutube} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <i className="ri-youtube-fill text-xl"></i>
                </a>
              )}
              {settings?.socialDiscord && (
                <a href={settings.socialDiscord} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <i className="ri-discord-fill text-xl"></i>
                </a>
              )}
              {settings?.socialWhatsapp && (
                <a href={settings.socialWhatsapp} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <i className="ri-whatsapp-line text-xl"></i>
                </a>
              )}
              {settings?.socialTiktok && (
                <a href={settings.socialTiktok} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <i className="ri-tiktok-line text-xl"></i>
                </a>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold font-montserrat mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-400 hover:text-white transition-colors">
                  Browse Games
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-400 hover:text-white transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/top-games" className="text-gray-400 hover:text-white transition-colors">
                  Top Rated
                </Link>
              </li>
              <li>
                <Link href="/new-games" className="text-gray-400 hover:text-white transition-colors">
                  New Games
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/refer-earn" className="text-gray-400 hover:text-white transition-colors">
                  🎯 Refer & Earn
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold font-montserrat mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="text-gray-400 hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold font-montserrat mb-4">Gaming Features</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/verification" className="text-gray-400 hover:text-white transition-colors">
                  Get Verified
                </Link>
              </li>
              <li>
                <Link href="/pricing-plans" className="text-gray-400 hover:text-white transition-colors">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link href="/find-friends" className="text-gray-400 hover:text-white transition-colors">
                  Find Friends
                </Link>
              </li>
              <li>
                <Link href="/rooms" className="text-gray-400 hover:text-white transition-colors">
                  Join Rooms
                </Link>
              </li>
              <li>
                <Link href="/tournaments" className="text-gray-400 hover:text-white transition-colors">
                  Tournaments
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-gray-400 hover:text-white transition-colors">
                  Gaming Events
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold font-montserrat mb-4">Download App</h3>
            <p className="text-gray-400 mb-4">
              Get the best gaming experience with our mobile app
            </p>
            <div className="space-y-3">
              {settings?.footerAppStoreLink ? (
                <a href={settings.footerAppStoreLink} target="_blank" rel="noopener noreferrer" className="flex items-center bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                  <i className="ri-app-store-fill text-2xl mr-3"></i>
                  <div>
                    <div className="text-xs">Download on the</div>
                    <div className="text-sm font-semibold">App Store</div>
                  </div>
                </a>
              ) : null}
              
              {settings?.footerGooglePlayLink ? (
                <a href={settings.footerGooglePlayLink} target="_blank" rel="noopener noreferrer" className="flex items-center bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                  <i className="ri-google-play-fill text-2xl mr-3"></i>
                  <div>
                    <div className="text-xs">Get it on</div>
                    <div className="text-sm font-semibold">Google Play</div>
                  </div>
                </a>
              ) : null}
              
              {settings?.footerAmazonLink ? (
                <a href={settings.footerAmazonLink} target="_blank" rel="noopener noreferrer" className="flex items-center bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                  <i className="ri-amazon-fill text-2xl mr-3"></i>
                  <div>
                    <div className="text-xs">Available at</div>
                    <div className="text-sm font-semibold">Amazon</div>
                  </div>
                </a>
              ) : null}
              
              {!settings?.footerAppStoreLink && !settings?.footerGooglePlayLink && !settings?.footerAmazonLink && (
                <p className="text-gray-500 text-sm">No mobile apps available yet</p>
              )}
            </div>
          </div>
        </div>
        
        
        <div className="border-t border-gray-800 pt-6 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              {settings?.footerCopyright ? (
                <span dangerouslySetInnerHTML={{ __html: settings.footerCopyright.replace(/\{year\}/g, new Date().getFullYear().toString()) }} />
              ) : (
                <>&copy; {new Date().getFullYear()} {settings?.siteTitle || 'Gaming Portal'}. All rights reserved.</>
              )}
            </p>
            <div className="flex space-x-6 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-gray-400 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-gray-400 transition-colors">
                Terms
              </Link>
              <Link href="/cookies" className="hover:text-gray-400 transition-colors">
                Cookies
              </Link>
              <Link href="/sitemap" className="hover:text-gray-400 transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
