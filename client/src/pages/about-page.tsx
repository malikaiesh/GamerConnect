import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">About Us</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="lead text-xl mb-6">
                Welcome to GameZone, your premier destination for online gaming entertainment and community.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
              <p>
                At GameZone, we're passionate about bringing high-quality gaming experiences to players around the world.
                Our mission is to create an inclusive gaming platform where everyone can find games they love, connect with
                fellow gamers, and stay informed about the latest in gaming news and trends.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Our Story</h2>
              <p>
                GameZone was founded in 2022 by a team of gaming enthusiasts who saw the need for a comprehensive online
                gaming platform that offered both casual and competitive gaming experiences. What started as a small
                collection of browser games has grown into a diverse library of titles across multiple genres and platforms.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Our Team</h2>
              <p>
                Our dedicated team consists of game developers, designers, content creators, and gaming industry veterans
                who work tirelessly to curate the best gaming experiences and create engaging content for our community.
                We're united by our love for games and our commitment to providing an exceptional platform for gamers of all types.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">What Sets Us Apart</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Quality Selection:</strong> We carefully curate our game library to ensure high-quality, entertaining experiences.</li>
                <li><strong>Community Focus:</strong> We foster a welcoming environment for gamers to connect, share, and compete.</li>
                <li><strong>Continuous Innovation:</strong> We're constantly improving our platform with new features and games.</li>
                <li><strong>Accessibility:</strong> We strive to make gaming accessible to everyone, regardless of skill level or experience.</li>
                <li><strong>Responsible Gaming:</strong> We promote healthy gaming habits and provide resources for balanced digital entertainment.</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Join Our Community</h2>
              <p>
                GameZone is more than just a gaming platform – it's a community of passionate gamers. We invite you to
                join us, explore our game library, participate in discussions, and become part of our growing family.
                Whether you're a casual player looking for fun ways to pass the time or a dedicated gamer seeking new
                challenges, GameZone has something for you.
              </p>
              
              <p className="mt-8">
                Thank you for being part of our journey. Game on!
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}