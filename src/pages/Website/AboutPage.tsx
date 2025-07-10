import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Heart, Phone, Mail, MapPin, Users, Award, Clock, Star } from 'lucide-react';
import SearchModal from '../../components/Website/SearchModal';
import { useFavorites } from '../../contexts/FavoritesContext';
import WebsiteHeader from '../../components/Website/WebsiteHeader';
import WebsiteFooter from '../../components/Website/WebsiteFooter';
import SEOHead from '../../components/UI/SEOHead';
import OptimizedImage from '../../components/UI/OptimizedImage';

export default function AboutPage() {
  const navigate = useNavigate();
  const [showSearchModal, setShowSearchModal] = useState(false);

  const teamMembers = [
    {
      name: 'John Smith',
      role: 'Founder & CEO',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2',
      description: 'Hollywood veteran with 20+ years in film production and vehicle coordination.'
    },
    {
      name: 'Sarah Johnson',
      role: 'Creative Director',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2',
      description: 'Expert in memorabilia authentication and movie prop restoration.'
    },
    {
      name: 'Mike Rodriguez',
      role: 'Operations Manager',
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2',
      description: 'Logistics specialist ensuring safe delivery and setup of all vehicles.'
    }
  ];

  const stats = [
    { icon: Users, number: '500+', label: 'Happy Customers' },
    { icon: Award, number: '50+', label: 'Iconic Vehicles' },
    { icon: Clock, number: '15+', label: 'Years Experience' },
    { icon: Star, number: '4.9', label: 'Average Rating' }
  ];

  const milestones = [
    {
      year: '2008',
      title: 'Company Founded',
      description: 'Started with a single DeLorean and a dream to bring movie magic to events.'
    },
    {
      year: '2012',
      title: 'First Major Event',
      description: 'Provided vehicles for a major Hollywood premiere, establishing our reputation.'
    },
    {
      year: '2016',
      title: 'Collection Expansion',
      description: 'Acquired iconic vehicles from Batman, Ghostbusters, and other franchises.'
    },
    {
      year: '2020',
      title: 'Digital Transformation',
      description: 'Launched online platform making our collection accessible nationwide.'
    },
    {
      year: '2024',
      title: 'Premium Experience',
      description: 'Introduced white-glove service and expanded memorabilia collection.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="About Us - Reel Wheels Experience | Movie Vehicle Rental Experts"
        description="Learn about Reel Wheels Experience, the premier provider of authentic movie vehicles and memorabilia. 15+ years of bringing Hollywood magic to events nationwide."
        keywords="about reel wheels experience, movie vehicle rental company, film car experts, Hollywood vehicle collection, movie memorabilia specialists"
        url="https://reelwheelsexperience.com/about"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "mainEntity": {
            "@type": "Organization",
            "name": "Reel Wheels Experience",
            "description": "Premier provider of authentic movie vehicles and memorabilia for events and productions",
            "foundingDate": "2008",
            "numberOfEmployees": "15-50",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "US"
            }
          }
        }}
      />
      
      {/* Header & Navigation */}
      <WebsiteHeader 
        onSearchClick={() => setShowSearchModal(true)}
        variant="dark"
        className="about-header"
      />

      {/* Hero Section */}
      <section 
        className="about-hero relative py-20 md:py-32 text-white"
        style={{
          backgroundImage: 'url(/about-us-section-background.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-bebas mb-6 leading-tight">ABOUT US</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-inter text-gray-200">
            Bringing the magic of Hollywood to your doorstep with authentic movie vehicles and memorabilia
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="about-story py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bebas mb-6 text-gray-900">OUR STORY</h2>
              <div className="space-y-6 text-lg leading-relaxed font-inter text-gray-700">
                <p>
                  Founded in 2008 by a group of passionate film enthusiasts and automotive experts, Reel Wheels Experience began with a simple mission: to make the impossible possible by bringing iconic movie vehicles directly to fans and event organizers.
                </p>
                <p>
                  What started as a single DeLorean time machine has grown into the most comprehensive collection of screen-used and replica vehicles in the industry. From Batman's sleek Batmobile to the ghostbusting Ecto-1, we've assembled an unparalleled fleet that spans decades of cinematic history.
                </p>
                <p>
                  Today, we're proud to serve customers nationwide, providing not just vehicles but complete experiences that transform ordinary events into extraordinary memories. Every rental comes with our commitment to authenticity, safety, and the kind of white-glove service that makes dreams come true.
                </p>
              </div>
            </div>
            <div className="relative">
              <OptimizedImage
                src="/vdp hero (2).webp" 
                alt="Our Collection" 
                size="large"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="about-stats py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bebas mb-4 text-gray-900">BY THE NUMBERS</h2>
            <p className="text-xl text-gray-600 font-inter">Our impact in the entertainment industry</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bebas text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-inter">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="about-timeline py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bebas mb-4 text-gray-900">OUR JOURNEY</h2>
            <p className="text-xl text-gray-600 font-inter">Key milestones in our company's evolution</p>
          </div>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-yellow-600 hidden md:block"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:text-right md:pr-8' : 'md:text-left md:pl-8'}`}>
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                      <div className="text-2xl font-bebas text-yellow-600 mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 font-inter">{milestone.title}</h3>
                      <p className="text-gray-600 font-inter">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="hidden md:flex w-2/12 justify-center">
                    <div className="w-4 h-4 bg-yellow-600 rounded-full border-4 border-white shadow-lg"></div>
                  </div>
                  <div className="w-full md:w-5/12"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="about-team py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bebas mb-4 text-gray-900">MEET THE TEAM</h2>
            <p className="text-xl text-gray-600 font-inter">The passionate people behind the magic</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <OptimizedImage
                  src={member.image} 
                  alt={member.name}
                  size="card"
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 font-inter">{member.name}</h3>
                  <div className="text-yellow-600 font-medium mb-3 font-inter">{member.role}</div>
                  <p className="text-gray-600 font-inter">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Values Section */}
      <section className="about-mission py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="relative">
            <div>
              <img 
                src="/logo black and white.webp" 
                alt="Reel Wheels Experience" 
                className="mb-4"
              />
              <h2 className="text-4xl md:text-5xl font-bebas mb-6 text-gray-900">OUR MISSION</h2>
              <p className="text-lg leading-relaxed font-inter text-gray-700 mb-8">
                To preserve and share the magic of cinema by providing authentic, high-quality movie vehicles and memorabilia that create unforgettable experiences for fans, collectors, and event organizers worldwide.
              </p>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Star className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2 font-inter">Authenticity</h3>
                    <p className="text-gray-600 font-inter">Every vehicle and piece of memorabilia is carefully authenticated and maintained to the highest standards.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2 font-inter">Customer Experience</h3>
                    <p className="text-gray-600 font-inter">We go above and beyond to ensure every interaction exceeds expectations and creates lasting memories.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Award className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2 font-inter">Excellence</h3>
                    <p className="text-gray-600 font-inter">From vehicle maintenance to customer service, we maintain the highest standards in everything we do.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Modal */}
      <SearchModal 
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />

      {/* Footer */}
      <WebsiteFooter className="about-footer" />
    </div>
  );
}