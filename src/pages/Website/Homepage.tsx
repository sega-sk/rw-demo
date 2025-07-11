import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, Heart, MapPin, Phone, Mail, Play, Pause } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import ContactModal from '../../components/UI/ContactModal';
import SearchModal from '../../components/Website/SearchModal';
import WebsiteHeader from '../../components/Website/WebsiteHeader';
import WebsiteFooter from '../../components/Website/WebsiteFooter';
import SEOHead from '../../components/UI/SEOHead';
import OptimizedImage from '../../components/UI/OptimizedImage';
import ResponsiveImage from '../../components/UI/ResponsiveImage';

// Homepage component - Enhanced by SeGa_cc
export default function Homepage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  
  // Touch/swipe state for mobile
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch products for slider
  const { data: productsData } = useApi(
    () => apiService.getProducts({ limit: 8, sort: '-created_at' }),
    { 
      immediate: true,
      cacheKey: 'homepage-products',
      cacheTTL: 10 * 60 * 1000, // 10 minutes for homepage
      staleWhileRevalidate: true
    }
  );

  // Use API data
  const products = productsData?.rows || [];

  // Create slides array with hero slide + product slides
  const slides = [
    {
      type: 'hero',
      title: 'REEL WHEELS',
      subtitle: 'EXPERIENCE',
      description: 'Make your next party one to remember. Our collection of famous film and TV vehicles and memorabilia provides the perfect backdrop to any event.',
      buttonText: 'VIEW "THE COLLECTION"',
      image: '/reel wheel hero_first slide.webp',
      video: null
    },
    ...products.slice(0, 8).map(product => ({
      type: 'product',
      id: product.id,
      title: product.title,
      subtitle: product.subtitle || '',
      image: product.images[0] || '/vdp hero (2).webp',
      video: product.video_url || null,
      slug: product.slug
    }))
  ];

  // Touch/swipe handlers for mobile
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(false);
  };

  const onTouchMove = (e) => {
    if (!touchStart) return;
    setTouchEnd(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !isDragging) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
    setIsDragging(false);
  };
  // Auto-advance slides
  useEffect(() => {
    if (isPlaying && !isHovered && !isDragging) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 4000); // Changed to 4 seconds

      return () => clearInterval(timer);
    }
  }, [slides.length, isPlaying, isHovered, isDragging]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleViewDetails = (slug) => {
    navigate(`/catalog/vehicle/${slug}`);
  };

  const handleViewCollection = () => {
    navigate('/catalog');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <SEOHead
        title="Reel Wheels Experience - Authentic Movie Vehicle Rentals & Memorabilia"
        description="Rent iconic movie vehicles like the Batmobile, DeLorean, and Ecto-1. Premium collection of authentic film cars and memorabilia for events, parties, and productions."
        keywords="movie car rental, Batmobile rental, DeLorean rental, film vehicle rental, movie memorabilia, Hollywood cars, event rentals"
        url="https://reelwheelsexperience.com/"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Reel Wheels Experience",
          "description": "Premium movie vehicle rental and memorabilia collection for events and productions",
          "url": "https://reelwheelsexperience.com",
          "telephone": "+1-971-416-6074",
          "email": "contact@reelwheelsexperience.com",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "US"
          },
          "sameAs": [
            "https://dealertower.com"
          ],
          "serviceType": "Vehicle Rental Service",
          "areaServed": "United States"
        }}
      />
      
      {/* Header & Navigation */}
      <WebsiteHeader 
        onSearchClick={() => setShowSearchModal(true)}
        variant="dark"
        className="homepage-header"
      />

      {/* Hero Slider */}
      <div 
        className="homepage-hero-slider relative overflow-hidden" 
        style={{ perspective: '1000px' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Cinematic overlay effect */}
        <div className="slide-overlay"></div>
        
        {/* Hollywood light rays overlay */}
        <div className="hollywood-rays"></div>
        
        <div className="slider-container relative w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            role={index === currentSlide ? 'img' : 'presentation'}
            aria-label={index === currentSlide ? slide.title : undefined}
            style={{
              transform: index === currentSlide 
                ? 'rotateY(0deg) translateZ(0px)' 
                : index < currentSlide 
                  ? 'rotateY(-90deg) translateZ(-400px)' 
                  : 'rotateY(90deg) translateZ(-400px)',
              transformOrigin: index < currentSlide ? 'right center' : 'left center',
              backfaceVisibility: 'hidden'
            }}
          >
            {slide.video ? (
              <div className="w-full h-full relative overflow-hidden">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload={index === 0 ? 'auto' : 'none'}
                  className="w-full h-full object-cover min-h-full min-w-full"
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  poster={slide.image}
                  aria-label={`Video for ${slide.title}`}
                >
                  <source src={slide.video} type="video/mp4" />
                  {/* Fallback to image if video fails */}
                  <OptimizedImage
                    src={slide.image} 
                    alt={slide.title}
                    size="hero"
                    priority={index === 0}
                    className="w-full h-full object-cover min-h-full min-w-full"
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
              </div>
            ) : (
              <div className="w-full h-full relative overflow-hidden">
                <ResponsiveImage
                  src={slide.image} 
                  alt={slide.title}
                  priority={index === 0}
                  sizes={{ mobile: 'large', tablet: 'hero', desktop: 'hero' }}
                  className="w-full h-full object-cover min-h-full min-w-full"
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
              </div>
            )}
            <div className="absolute inset-0">              
              <div className="relative z-10 h-full flex items-center justify-center text-center px-4 main-hero-slide-content">
                <div className="max-w-4xl mx-auto">
                  {slide.type === 'hero' ? (
                    <>
                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-bebas mb-2 tracking-[0.2em] drop-shadow-2xl whitespace-nowrap text-white transform scale-x-[0.7] origin-center first-h1">
                      {slide.title}
                    </h1>
                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-bebas mb-12 tracking-[0.4em] drop-shadow-xl whitespace-nowrap text-white transform scale-x-[0.8] origin-center first-h2">
                      {slide.subtitle}
                    </h2>
                      <button 
                        onClick={handleViewCollection}
                        className="hero-button first-btn"
                      >
                        {slide.buttonText}
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Product slide content positioned in top right */}
                      <div className="absolute top-8 right-8 md:top-8 md:right-8 lg:top-12 lg:right-12 max-w-md">
                        <div className="product-slide-title bg-opacity-95 backdrop-blur-sm p-6 md:p-8 rounded-lg shadow-xl">
                          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bebas mb-4 text-gray-900 leading-tight tracking-wide">
                            {slide.title}
                          </h2>
                          <button 
                            onClick={() => handleViewDetails(slide.slug)}
                            className="bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-all font-inter uppercase tracking-wider"
                          >
                            VIEW DETAILS
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-4 z-20">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
            className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Play className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
          
          {/* Slide Dots */}
          <div className="flex space-x-2" role="tablist" aria-label="Slide navigation">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              role="tab"
              aria-selected={index === currentSlide}
              aria-label={`Go to slide ${index + 1}`}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
          </div>
        </div>
        
        {/* Navigation Arrows with 3D Effect */}
        <button
          onClick={prevSlide}
          aria-label="Previous slide"
          className="hidden md:block absolute left-8 top-1/2 -translate-y-1/2 z-30 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-4 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 group"
        >
          <ChevronLeft className="h-6 w-6 group-hover:scale-110 transition-transform" aria-hidden="true" />
        </button>
        
        <button
          onClick={nextSlide}
          aria-label="Next slide"
          className="hidden md:block absolute right-8 top-1/2 -translate-y-1/2 z-30 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-4 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 group"
        >
          <ChevronRight className="h-6 w-6 group-hover:scale-110 transition-transform" aria-hidden="true" />
        </button>
        
        {/* Mobile Swipe Indicator */}
        <div className="md:hidden absolute bottom-20 left-1/2 -translate-x-1/2 text-white text-xs opacity-70 text-center">
          <div className="flex items-center space-x-2">
            <ChevronLeft className="h-3 w-3" />
            <span>Swipe to navigate</span>
            <ChevronRight className="h-3 w-3" />
          </div>
        </div>
      </div>

      {/* Trending Models Section */}
      <section className="homepage-trending-models bg-white text-black py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bebas text-center mb-8 md:mb-16">TRENDING MODELS</h2>
          
          <TrendingModelsSlider products={products} navigate={navigate} />

          {/* See All Models Button */}
          <div className="text-center mt-8 md:mt-12">
            <button 
              onClick={handleViewCollection}
              className="bg-gray-900 text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors font-inter font-medium"
            >
              SEE ALL MODELS
            </button>
          </div>
        </div>
      </section>

      {/* About Section with proper background */}
      <section 
        className="homepage-about-section relative py-16 md:py-24 text-white"
        style={{
          backgroundImage: 'url(/bg1.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
            <div>
              <p className="text-yellow-600 text-sm font-medium mb-4 tracking-wider font-inter">THE REEL WHEELS EXPERIENCE</p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bebas mb-6 leading-tight">ABOUT US</h2>
              <p className="text-lg md:text-xl leading-relaxed font-inter text-gray-200">
                Make your next party one to remember. Our collection of famous film and TV vehicles and memorabilia provides the perfect backdrop to any event. Bring the Batman to your birthday, the Batmobile to your bar mitzvah, or Ferris' Ferrari. Go Back to the Future for your birthday. From the A-Team to Wayne's World, Reel Wheels Experience delivers the magic of Hollywood to your front door.
              </p>
            </div>
            <div className="flex items-center justify-center lg:justify-end flex-col">
              <img 
                src="/logo-color.webp" 
                alt="Reel Wheels Experience" 
                className="max-w-md lg:max-w-lg m-30"
              />
              <div className="flex mt-6">
              <button 
                onClick={handleViewCollection}
                className="bg-yellow-700 text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors font-inter font-medium mt-6"
              >
                See "The Collection"
              </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section with proper background and design */}
      <section 
        className="homepage-contact-form py-16 md:py-24 bg-white"
      >
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Contact Form */}
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-gray-100">
              <h2 className="text-3xl md:text-4xl font-bebas mb-8 text-gray-900 text-center lg:text-left">GET IN TOUCH</h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">First Name*</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 font-inter bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Last Name*</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 font-inter bg-white transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Email*</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 font-inter bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Phone*</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 font-inter bg-white transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Comments</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 font-inter bg-white transition-all resize-none"
                    placeholder="Tell us about your event or inquiry..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-yellow-600 text-white px-8 py-4 rounded-lg hover:bg-yellow-500 transition-colors font-inter font-medium text-lg"
                >
                  SEND MESSAGE
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="text-gray-900">
              <h2 className="text-4xl md:text-5xl font-bebas mb-6 leading-tight text-center lg:text-left">WE APPRECIATE YOUR FEEDBACK</h2>
              <p className="text-lg md:text-xl text-gray-600 mb-8 font-inter leading-relaxed text-center lg:text-left">
                We'd love to hear from you! Whether you have a question about our services, need support, or just want to say hello — our team is here to help.
              </p>
              <div className="space-y-6 text-lg font-inter mb-8">
                <div className="flex items-center group">
                  <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center mr-4 group-hover:bg-yellow-500 transition-colors">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wide">Phone</p>
                    <a href="tel:+19714166074" className="font-semibold text-gray-900 hover:text-yellow-600 transition-colors">
                      (971) 416-6074
                    </a>
                  </div>
                </div>
                <div className="flex items-center group">
                  <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center mr-4 group-hover:bg-yellow-500 transition-colors">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wide">Email</p>
                    <a href="mailto:contact@reelwheelsexperience.com" className="font-semibold text-gray-900 hover:text-yellow-600 transition-colors">
                      contact@reelwheelsexperience.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <WebsiteFooter className="homepage-footer" />

      {/* Contact Modal */}
      <ContactModal 
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />

      {/* Search Modal */}
      <SearchModal 
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />
    </div>
  );
}

// Trending Models Slider Component
function TrendingModelsSlider({ products, navigate }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const itemsPerSlide = isMobile ? 1 : 4;
  const trendingProducts = products.slice(0, 12); // Use actual products from API
  const totalSlides = Math.ceil(trendingProducts.length / itemsPerSlide);

  // Auto-advance slides every 4 seconds
  useEffect(() => {
    if (totalSlides > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
      }, 4000);

      return () => clearInterval(timer);
    }
  }, [totalSlides]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (slideIndex) => {
    setCurrentSlide(slideIndex);
  };

  // Show message if no products available
  if (trendingProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 font-inter">No products available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Slider Container */}
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {Array.from({ length: totalSlides }).map((_, slideIndex) => (
            <div key={slideIndex} className="w-full flex-shrink-0">
              <div className={`grid gap-4 md:gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-4'}`}>
                {trendingProducts
                  .slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide)
                  .map((product, index) => (
                    <div 
                      key={product.id} 
                      className={`text-center cursor-pointer group ${isMobile ? 'mx-auto max-w-sm' : ''}`}
                      onClick={() => navigate(`/catalog/${product.product_types[0] || 'vehicle'}/${product.slug}`)}
                    >
                      <div className="relative overflow-hidden">
                        <OptimizedImage
                          src={product.images[0] || 'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'}
                          alt={product.title}
                          size="card"
                          className={`w-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-lg ${isMobile ? 'h-64' : 'h-40 md:h-48'}`}
                        />
                      </div>
                      <div className="p-4">
                        <h3 className={`font-bold font-inter group-hover:text-blue-600 transition-colors leading-tight ${isMobile ? 'text-lg' : 'text-sm md:text-base'}`}>{product.title}</h3>
                        {isMobile && (
                          <p className="text-sm text-gray-600 mt-2 font-inter">{product.subtitle}</p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={prevSlide}
            className={`absolute top-1/2 -translate-y-1/2 bg-white shadow-lg text-gray-800 p-3 rounded-full hover:bg-gray-50 transition-all z-10 border ${isMobile ? 'left-2' : 'left-0 -translate-x-4'}`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextSlide}
            className={`absolute top-1/2 -translate-y-1/2 bg-white shadow-lg text-gray-800 p-3 rounded-full hover:bg-gray-50 transition-all z-10 border ${isMobile ? 'right-2' : 'right-0 translate-x-4'}`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {totalSlides > 1 && (
        <div className={`flex justify-center space-x-2 ${isMobile ? 'mt-6' : 'mt-8'}`}>
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`rounded-full transition-all ${isMobile ? 'w-2 h-2' : 'w-3 h-3'} ${
                index === currentSlide 
                  ? 'bg-gray-900' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}