import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ChevronDown, ChevronUp } from 'lucide-react';

// FAQ data
const faqData = [
  {
    category: 'Account & Registration',
    questions: [
      {
        question: 'How do I create an account?',
        answer: 'To create an account, click on the "Sign Up" button in the top right corner of the website. Fill in your details including username, email address, and password. Follow the verification process via email, and you\'re all set!'
      },
      {
        question: 'Is registration required to play games?',
        answer: 'No, you can play most games without registering. However, creating an account allows you to save your progress, earn achievements, participate in leaderboards, and access exclusive content.'
      },
      {
        question: 'I forgot my password. How do I reset it?',
        answer: 'Click on "Login" and then select "Forgot Password". Enter your registered email address, and we\'ll send you instructions to reset your password.'
      },
      {
        question: 'Can I change my username?',
        answer: 'Yes, you can change your username in your account settings. Go to your profile, click on "Edit Profile", and update your username. Note that you can only change your username once every 30 days.'
      }
    ]
  },
  {
    category: 'Games & Gameplay',
    questions: [
      {
        question: 'Why won\'t some games load on my device?',
        answer: 'Games may not load due to several reasons: your browser might be outdated, you might need to enable JavaScript, or the game might require a specific plugin like WebGL. For mobile devices, some games might not be compatible with your device. Try updating your browser or switching to a different device.'
      },
      {
        question: 'How do I save my game progress?',
        answer: 'Game progress is automatically saved if you\'re logged in. For some games, you might need to reach specific checkpoints for progress to be saved. Always ensure you\'re logged in before playing to maintain your progress across sessions.'
      },
      {
        question: 'Are all games free to play?',
        answer: 'Most games on our platform are free to play. Some games may offer in-game purchases for additional features, levels, or cosmetic items. Premium games will clearly indicate their status before you start playing.'
      },
      {
        question: 'Can I play games offline?',
        answer: 'Most games on our platform require an internet connection to play. However, some games may have offline modes or downloadable versions that you can play without an internet connection.'
      },
      {
        question: 'How do I report a bug in a game?',
        answer: 'If you encounter a bug, please report it through the "Report Issue" button available on each game page. Provide as many details as possible, including your device, browser, and steps to reproduce the bug.'
      }
    ]
  },
  {
    category: 'Technical Support',
    questions: [
      {
        question: 'What are the system requirements for playing games?',
        answer: 'The system requirements vary by game. Most browser games require a modern web browser with JavaScript enabled and sufficient RAM. For more demanding games, you might need a device with WebGL support, a decent processor, and graphics capabilities.'
      },
      {
        question: 'The game is lagging or running slowly. What can I do?',
        answer: 'Try closing other applications and browser tabs, clear your browser cache, or lower the game\'s quality settings if available. Ensure your internet connection is stable and consider using a wired connection instead of Wi-Fi for better performance.'
      },
      {
        question: 'Which browsers are supported?',
        answer: 'We support all modern browsers, including Chrome, Firefox, Safari, and Edge. For the best experience, we recommend using the latest version of Chrome or Firefox. Internet Explorer is not fully supported.'
      },
      {
        question: 'Can I play games on my mobile device?',
        answer: 'Yes, many of our games are mobile-friendly. Look for the "Mobile Compatible" label on the game card. For the best mobile gaming experience, we recommend using our mobile app available on iOS and Android.'
      }
    ]
  },
  {
    category: 'Payments & Subscriptions',
    questions: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept various payment methods including credit/debit cards (Visa, MasterCard, American Express), PayPal, and in some regions, Google Pay and Apple Pay. For certain regions, we also support local payment methods.'
      },
      {
        question: 'Is my payment information secure?',
        answer: 'Yes, all payment information is securely processed through PCI-compliant payment processors. We do not store your full credit card details on our servers.'
      },
      {
        question: 'How do I cancel my subscription?',
        answer: 'To cancel your subscription, go to your account settings, select "Subscriptions", and click on "Cancel Subscription". You\'ll continue to have access to premium features until the end of your current billing period.'
      },
      {
        question: 'Can I get a refund for in-game purchases?',
        answer: 'Refund policies vary by game and type of purchase. Generally, consumable in-game items (like virtual currency) are not refundable once used. For other issues, please contact our support team within 14 days of purchase.'
      }
    ]
  },
  {
    category: 'Privacy & Security',
    questions: [
      {
        question: 'Is my personal information safe?',
        answer: 'We take data protection seriously and implement industry-standard security measures to protect your personal information. For more details, please review our Privacy Policy.'
      },
      {
        question: 'Do you share my information with third parties?',
        answer: 'We only share your information with third parties as outlined in our Privacy Policy, such as with game developers to provide services, or with analytics providers to improve our platform. We never sell your personal data to advertisers.'
      },
      {
        question: 'How can I disable cookies?',
        answer: 'You can manage cookie preferences through the "Cookie Settings" option in the footer of our website. Note that disabling certain cookies may affect the functionality of the site.'
      },
      {
        question: 'How do you protect children\'s privacy?',
        answer: 'We comply with children\'s privacy protection laws including COPPA. We do not knowingly collect personal information from children under 13 without parental consent. Parents can review and request deletion of their child\'s information by contacting us.'
      }
    ]
  }
];

// FAQ item component
const FAQItem = ({ question, answer, isOpen, toggleOpen }: { question: string, answer: string, isOpen: boolean, toggleOpen: () => void }) => {
  return (
    <div className="border-b border-gray-200 py-4">
      <button
        className="flex justify-between items-center w-full text-left font-medium text-gray-900 dark:text-white"
        onClick={toggleOpen}
      >
        <span>{question}</span>
        <span className="ml-6 flex-shrink-0">
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </span>
      </button>
      {isOpen && (
        <div className="mt-2 pr-12">
          <p className="text-gray-600 dark:text-gray-300">{answer}</p>
        </div>
      )}
    </div>
  );
};

// FAQ category component
const FAQCategory = ({ category, questions }: { category: string, questions: { question: string, answer: string }[] }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">{category}</h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {questions.map((item, index) => (
          <FAQItem
            key={index}
            question={item.question}
            answer={item.answer}
            isOpen={openIndex === index}
            toggleOpen={() => toggleQuestion(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter questions based on search term
  const filteredFAQs = searchTerm
    ? faqData.map(category => ({
        ...category,
        questions: category.questions.filter(
          q => q.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
               q.answer.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(category => category.questions.length > 0)
    : faqData;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-center text-foreground">Frequently Asked Questions</h1>
            
            {/* Search */}
            <div className="mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for questions..."
                  className="w-full p-4 pl-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg 
                  className="absolute left-4 top-4 h-5 w-5 text-gray-400" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
            </div>
            
            {/* FAQ Categories */}
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((category, index) => (
                <FAQCategory 
                  key={index} 
                  category={category.category} 
                  questions={category.questions} 
                />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  No questions found matching "{searchTerm}". Try a different search term.
                </p>
              </div>
            )}
            
            {/* Still need help section */}
            <div className="mt-12 bg-primary/10 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Still Need Help?</h2>
              <p className="mb-6 text-foreground">
                Can't find the answer you're looking for? Our support team is here to help.
              </p>
              <a 
                href="/contact" 
                className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}