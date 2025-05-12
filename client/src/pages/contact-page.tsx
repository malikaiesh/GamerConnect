import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function ContactPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message Sent",
        description: "Thank you for contacting us. We'll get back to you soon!",
      });
      
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-center text-foreground">Contact Us</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">Email Us</h3>
                <p className="text-muted-foreground mb-4">For general inquiries and support</p>
                <a href="mailto:support@gamezone.com" className="text-primary hover:underline">
                  support@gamezone.com
                </a>
              </div>
              
              <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">Call Us</h3>
                <p className="text-muted-foreground mb-4">Monday to Friday, 9am to 5pm</p>
                <a href="tel:+18001234567" className="text-primary hover:underline">
                  +1 (800) 123-4567
                </a>
              </div>
              
              <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">Our Location</h3>
                <p className="text-muted-foreground mb-4">Visit our headquarters</p>
                <address className="not-italic text-primary">
                  123 Gaming Street<br/>
                  San Francisco, CA 94107
                </address>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-card text-card-foreground p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-6 text-foreground">Send Us a Message</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Your Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-1">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help you?"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-1">
                      Your Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us more about your inquiry..."
                      rows={5}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </div>
              
              <div className="bg-card text-card-foreground p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-6 text-foreground">Business Hours</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-primary mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-medium text-foreground">Customer Support</h4>
                      <p className="text-muted-foreground">
                        Monday - Friday: 9:00 AM - 5:00 PM (PST)<br />
                        Saturday - Sunday: Closed
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-primary mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-medium text-foreground">Technical Support</h4>
                      <p className="text-muted-foreground">
                        Monday - Friday: 8:00 AM - 8:00 PM (PST)<br />
                        Saturday: 10:00 AM - 4:00 PM (PST)<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4 text-foreground">Frequently Asked Questions</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-foreground">How do I reset my password?</h4>
                      <p className="text-muted-foreground text-sm mt-1">
                        Visit the login page and click on "Forgot Password" to receive reset instructions via email.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-foreground">How can I report a bug?</h4>
                      <p className="text-muted-foreground text-sm mt-1">
                        Please use the contact form and select "Bug Report" as the subject to help us address the issue promptly.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-foreground">Do you offer affiliate programs?</h4>
                      <p className="text-muted-foreground text-sm mt-1">
                        Yes! Please email our partnerships team at partners@gamezone.com for more information.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-foreground">How can I suggest a new game?</h4>
                      <p className="text-muted-foreground text-sm mt-1">
                        We welcome game suggestions! Please use our contact form with "Game Suggestion" as the subject.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}