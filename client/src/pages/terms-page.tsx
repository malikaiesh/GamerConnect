import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-foreground">Terms of Service</h1>
            
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-gray-500 mb-8">Last updated: May 10, 2025</p>
              
              <p>
                Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the 
                GameZone website (the "Service") operated by GameZone ("us", "we", or "our").
              </p>
              <p>
                Your access to and use of the Service is conditioned on your acceptance of and compliance with 
                these Terms. These Terms apply to all visitors, users, and others who access or use the Service.
              </p>
              <p>
                By accessing or using the Service you agree to be bound by these Terms. If you disagree with 
                any part of the terms, then you may not access the Service.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Accounts</h2>
              <p>
                When you create an account with us, you must provide accurate, complete, and up-to-date information. 
                Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your 
                account on our Service.
              </p>
              <p>
                You are responsible for safeguarding the password that you use to access the Service and for any 
                activities or actions under your password, whether your password is with our Service or a third-party service.
              </p>
              <p>
                You agree not to disclose your password to any third party. You must notify us immediately upon 
                becoming aware of any breach of security or unauthorized use of your account.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">User Conduct</h2>
              <p>
                As a user of the Service, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the Service only for lawful purposes and in accordance with these Terms.</li>
                <li>Not use the Service in any way that violates any applicable local, state, national, or international law or regulation.</li>
                <li>Not attempt to probe, scan, or test the vulnerability of the Service or any related system or network.</li>
                <li>Not interfere with or disrupt the integrity or performance of the Service.</li>
                <li>Not engage in any abusive behavior, including harassment, bullying, or intimidation of other users.</li>
                <li>Not post or transmit any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable.</li>
                <li>Not upload or transmit any material that contains viruses, Trojan horses, worms, time bombs, or any other harmful programs or elements.</li>
                <li>Not attempt to gain unauthorized access to any portion or feature of the Service.</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Intellectual Property</h2>
              <p>
                The Service and its original content, features, and functionality are and will remain the exclusive 
                property of GameZone and its licensors. The Service is protected by copyright, trademark, and other 
                laws of both the United States and foreign countries. Our trademarks and trade dress may not be used 
                in connection with any product or service without the prior written consent of GameZone.
              </p>
              <p>
                Unless otherwise indicated, all game content available through the Service is owned by their respective 
                copyright owners and are protected by applicable copyright laws. You may not reproduce, distribute, 
                modify, create derivative works of, publicly display, publicly perform, republish, download, store, 
                or transmit any of the material on our Service, except as generally and ordinarily permitted through 
                the Service according to these Terms.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">User-Generated Content</h2>
              <p>
                Our Service may allow you to post, link, store, share and otherwise make available certain information, 
                text, graphics, videos, or other material ("Content"). You are responsible for the Content that you 
                post to the Service, including its legality, reliability, and appropriateness.
              </p>
              <p>
                By posting Content to the Service, you grant us the right and license to use, modify, perform, display, 
                reproduce, and distribute such Content on and through the Service. You retain any and all of your rights 
                to any Content you submit, post or display on or through the Service and you are responsible for protecting 
                those rights.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">In-Game Purchases and Virtual Currency</h2>
              <p>
                Some games on our Service may offer the opportunity to purchase virtual currency, items, or other goods 
                or services. All purchases made within the Service are final and non-refundable, except as required by 
                applicable law. We reserve the right to manage, regulate, control, modify, or eliminate virtual currency 
                or items at any time, with or without notice.
              </p>
              <p>
                We may cancel, suspend, or terminate your account and all related information and files if we suspect 
                transactions associated with your account to be fraudulent, abusive, or otherwise violative of these Terms.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Links To Other Web Sites</h2>
              <p>
                Our Service may contain links to third-party web sites or services that are not owned or controlled by GameZone.
              </p>
              <p>
                GameZone has no control over, and assumes no responsibility for, the content, privacy policies, or practices 
                of any third-party web sites or services. You further acknowledge and agree that GameZone shall not be 
                responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or 
                in connection with use of or reliance on any such content, goods or services available on or through any 
                such web sites or services.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Termination</h2>
              <p>
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason 
                whatsoever, including without limitation if you breach the Terms.
              </p>
              <p>
                Upon termination, your right to use the Service will immediately cease. If you wish to terminate your 
                account, you may simply discontinue using the Service, or you may delete your account through the Service.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Limitation Of Liability</h2>
              <p>
                In no event shall GameZone, nor its directors, employees, partners, agents, suppliers, or affiliates, 
                be liable for any indirect, incidental, special, consequential or punitive damages, including without 
                limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your access to or use of or inability to access or use the Service;</li>
                <li>Any conduct or content of any third party on the Service;</li>
                <li>Any content obtained from the Service; and</li>
                <li>Unauthorized access, use or alteration of your transmissions or content.</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Changes</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision 
                is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What 
                constitutes a material change will be determined at our sole discretion.
              </p>
              <p>
                By continuing to access or use our Service after those revisions become effective, you agree to be bound 
                by the revised terms. If you do not agree to the new terms, please stop using the Service.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>By email: legal@gamezone.com</li>
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