import React from 'react';
import { Phone, Mail } from 'lucide-react';
import OptimizedImage from '../UI/OptimizedImage';

interface WebsiteFooterProps {
  className?: string;
}

export default function WebsiteFooter({ className = '' }: WebsiteFooterProps) {
  return (
    <>
      {/* Developer Attribution - SeGa_cc */}
    <footer className={`website-footer bg-black text-white py-8 md:py-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-6 md:mb-8 hidden">
          <h2 className="text-2xl md:text-3xl font-bebas"><a href="/catalog">THE COLLECTION</a></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 text-left">
          <div>
            <div className="flex align-left text-left">
              <OptimizedImage
                src="/logo-color.webp" 
                alt="Reel Wheels Experience" 
                size="small"
                className="mb-4"
              />
            </div>
            <p className="text-xs md:text-sm text-gray-400 font-inter">
              Pellentesque ut rhoncus magna nec molestie enim nunc commodo purus sit
            </p>
            <div className="mt-4 space-y-2">
              <p className="text-xs md:text-sm text-gray-400 font-inter">
                <a href="tel:+19714166074" className="hover:text-white transition-colors flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  971-416-6074
                </a>
              </p>
              <p className="text-xs md:text-sm text-gray-400 font-inter">
                <a href="mailto:contact@reelwheelsexperience.com" className="hover:text-white transition-colors flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  contact@reelwheelsexperience.com
                </a>
              </p>
            </div>
          </div>
          <div className="hidden md:block">
            <h3 className="font-bold mb-4 font-inter text-center"><a href="./">HOMEPAGE</a></h3>
          </div>
          <div className="hidden md:block">
            <h3 className="font-bold mb-4 font-inter text-center"><a href="/catalog">SHOP</a></h3>
          </div>
          <div className="hidden md:block">
            <h3 className="font-bold mb-4 font-inter text-center"><a href="/about">ABOUT</a></h3>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-xs md:text-sm text-gray-400 font-inter">
          © COPYRIGHT • <a href="https://dealertower.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">DEALERTOWER</a>
        </div>
      </div>
    </footer>
    </>
  );
}