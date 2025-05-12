import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-500 mb-8">Last updated: May 10, 2025</p>
              
              <p>
                This Cookie Policy explains how GameZone ("we", "us", or "our") uses cookies and similar tracking 
                technologies on our website. This Cookie Policy should be read alongside our Privacy Policy, which 
                explains how we use personal information.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">What Are Cookies?</h2>
              <p>
                Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you 
                visit a website. Cookies are widely used to make websites work more efficiently and provide 
                information to the website owners.
              </p>
              <p>
                Cookies can be "persistent" or "session" cookies. Persistent cookies remain on your device when you go 
                offline, while session cookies are deleted as soon as you close your web browser.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Cookies</h2>
              <p>
                We use cookies for the following purposes:
              </p>
              
              <h3 className="text-xl font-medium mt-6 mb-3">Necessary Cookies</h3>
              <p>
                These cookies are essential for you to browse our website and use its features. The information collected 
                by these cookies relate to the operation of our website, for example, website scripting language and 
                security tokens to maintain secure areas of our website.
              </p>
              
              <h3 className="text-xl font-medium mt-6 mb-3">Analytical/Performance Cookies</h3>
              <p>
                These cookies allow us to recognize and count the number of visitors and to see how visitors move around 
                our website when they are using it. This helps us to improve the way our website works, for example, by 
                ensuring that users are finding what they are looking for easily.
              </p>
              
              <h3 className="text-xl font-medium mt-6 mb-3">Functionality Cookies</h3>
              <p>
                These cookies are used to recognize you when you return to our website. This enables us to personalize our 
                content for you, greet you by name, and remember your preferences (for example, your choice of language or region).
              </p>
              
              <h3 className="text-xl font-medium mt-6 mb-3">Targeting/Advertising Cookies</h3>
              <p>
                These cookies record your visit to our website, the pages you have visited, and the links you have followed. 
                We will use this information to make our website and the advertising displayed on it more relevant to your interests. 
                We may also share this information with third parties for this purpose.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Third-Party Cookies</h2>
              <p>
                In addition to our own cookies, we may also use various third-party cookies to report usage statistics of our 
                website, deliver advertisements on and through the website, and so on.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">What Specific Cookies Do We Use?</h2>
              
              <div className="overflow-x-auto mt-6">
                <table className="min-w-full divide-y divide-gray-200 border">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cookie Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">_ga</td>
                      <td className="px-6 py-4 text-sm text-gray-500">Used by Google Analytics to distinguish users.</td>
                      <td className="px-6 py-4 text-sm text-gray-500">2 years</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">_gid</td>
                      <td className="px-6 py-4 text-sm text-gray-500">Used by Google Analytics to distinguish users.</td>
                      <td className="px-6 py-4 text-sm text-gray-500">24 hours</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">_gat</td>
                      <td className="px-6 py-4 text-sm text-gray-500">Used by Google Analytics to throttle request rate.</td>
                      <td className="px-6 py-4 text-sm text-gray-500">1 minute</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">auth_token</td>
                      <td className="px-6 py-4 text-sm text-gray-500">Authenticates logged-in users across page requests.</td>
                      <td className="px-6 py-4 text-sm text-gray-500">Session</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">user_preferences</td>
                      <td className="px-6 py-4 text-sm text-gray-500">Stores user preferences such as theme selection and display settings.</td>
                      <td className="px-6 py-4 text-sm text-gray-500">1 year</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">recently_played</td>
                      <td className="px-6 py-4 text-sm text-gray-500">Tracks recently played games for recommendations.</td>
                      <td className="px-6 py-4 text-sm text-gray-500">30 days</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">cookie_consent</td>
                      <td className="px-6 py-4 text-sm text-gray-500">Records your cookie consent preferences.</td>
                      <td className="px-6 py-4 text-sm text-gray-500">1 year</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">How to Control Cookies</h2>
              <p>
                You can control and/or delete cookies as you wish. You can delete all cookies that are already on your 
                computer and you can set most browsers to prevent them from being placed. However, if you do this, you 
                may have to manually adjust some preferences every time you visit a site, and some services and 
                functionalities may not work.
              </p>
              <p>
                Most web browsers allow some control of most cookies through the browser settings. To find out more about 
                cookies, including how to see what cookies have been set, visit <a href="https://www.aboutcookies.org" className="text-primary hover:underline">www.aboutcookies.org</a> or 
                <a href="https://www.allaboutcookies.org" className="text-primary hover:underline">www.allaboutcookies.org</a>.
              </p>
              
              <h3 className="text-xl font-medium mt-6 mb-3">Managing Cookies in Popular Browsers</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Chrome:</strong> <a href="https://support.google.com/chrome/answer/95647" className="text-primary hover:underline">https://support.google.com/chrome/answer/95647</a></li>
                <li><strong>Firefox:</strong> <a href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences" className="text-primary hover:underline">https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences</a></li>
                <li><strong>Safari:</strong> <a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" className="text-primary hover:underline">https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac</a></li>
                <li><strong>Edge:</strong> <a href="https://support.microsoft.com/en-gb/help/4468242/microsoft-edge-browsing-data-and-privacy" className="text-primary hover:underline">https://support.microsoft.com/en-gb/help/4468242/microsoft-edge-browsing-data-and-privacy</a></li>
              </ul>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Changes to Our Cookie Policy</h2>
              <p>
                We may change this Cookie Policy from time to time. If we make significant changes in the way we treat your 
                personal information, or to the Cookie Policy, we will make this clear on our website or by contacting you directly.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
              <p>
                If you have any questions about our use of cookies or other technologies, please contact us:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>By email: privacy@gamezone.com</li>
                <li>By visiting the contact page on our website: <a href="/contact" className="text-primary hover:underline">Contact Us</a></li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}