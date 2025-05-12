import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-500 mb-8">Last updated: May 10, 2025</p>
              
              <p>
                At GameZone, we take your privacy seriously. This Privacy Policy explains how we collect, use, 
                disclose, and safeguard your information when you visit our website or use our gaming platform.
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, 
                please do not access the site.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>
              
              <h3 className="text-xl font-medium mt-6 mb-3">Personal Data</h3>
              <p>
                We may collect personal identification information from Users in a variety of ways, including, 
                but not limited to, when Users visit our site, register on the site, place an order, subscribe 
                to the newsletter, respond to a survey, fill out a form, and in connection with other activities, 
                services, features or resources we make available on our Site. Users may be asked for, as appropriate:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name</li>
                <li>Email address</li>
                <li>Username</li>
                <li>Date of birth (to verify age restrictions)</li>
                <li>Payment information (for purchases)</li>
              </ul>
              
              <h3 className="text-xl font-medium mt-6 mb-3">Usage Data</h3>
              <p>
                We may also collect information about how the Service is accessed and used ("Usage Data"). 
                This Usage Data may include information such as your computer's Internet Protocol address 
                (e.g., IP address), browser type, browser version, the pages of our Service that you visit, 
                the time and date of your visit, the time spent on those pages, unique device identifiers, 
                and other diagnostic data.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
              <p>
                We use the information we collect in various ways, including to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, operate, and maintain our website</li>
                <li>Improve, personalize, and expand our website</li>
                <li>Understand and analyze how you use our website</li>
                <li>Develop new products, services, features, and functionality</li>
                <li>Communicate with you, either directly or through one of our partners, for customer service, updates, and other website-related purposes</li>
                <li>Send you emails</li>
                <li>Find and prevent fraud</li>
                <li>Process your payments and provide requested services</li>
                <li>Recommend games based on your preferences and playing history</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Cookies</h2>
              <p>
                We use cookies and similar tracking technologies to track activity on our Service and hold certain information. 
                Cookies are files with a small amount of data which may include an anonymous unique identifier. 
                Cookies are sent to your browser from a website and stored on your device.
              </p>
              <p>
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. 
                However, if you do not accept cookies, you may not be able to use some portions of our Service.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Third-Party Services</h2>
              <p>
                We may employ third-party companies and individuals to facilitate our Service 
                ("Service Providers"), to provide the Service on our behalf, to perform Service-related services, 
                or to assist us in analyzing how our Service is used.
              </p>
              <p>
                These third parties have access to your Personal Data only to perform these tasks on our behalf 
                and are obligated not to disclose or use it for any other purpose.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Data Security</h2>
              <p>
                We value your trust in providing us your Personal Information, thus we are striving to use 
                commercially acceptable means of protecting it. But remember that no method of transmission 
                over the internet, or method of electronic storage is 100% secure and reliable, and we cannot 
                guarantee its absolute security.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Children's Privacy</h2>
              <p>
                Our Service does not address anyone under the age of 13. We do not knowingly collect personally 
                identifiable information from anyone under the age of 13. If you are a parent or guardian and you 
                are aware that your child has provided us with Personal Data, please contact us. If we become aware 
                that we have collected Personal Data from children without verification of parental consent, we take 
                steps to remove that information from our servers.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Your Data Protection Rights</h2>
              <p>
                Depending on your location and applicable laws, you may have certain rights regarding your personal information, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>The right to access – You have the right to request copies of your personal data.</li>
                <li>The right to rectification – You have the right to request that we correct any information you believe is inaccurate or complete information you believe is incomplete.</li>
                <li>The right to erasure – You have the right to request that we erase your personal data, under certain conditions.</li>
                <li>The right to restrict processing – You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
                <li>The right to object to processing – You have the right to object to our processing of your personal data, under certain conditions.</li>
                <li>The right to data portability – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
                the new Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy.
              </p>
              <p>
                You are advised to review this Privacy Policy periodically for any changes. Changes to this 
                Privacy Policy are effective when they are posted on this page.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us:
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