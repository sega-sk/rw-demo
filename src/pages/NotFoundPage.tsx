import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, Film } from 'lucide-react';
import SEOHead from '../components/UI/SEOHead';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white flex items-center justify-center relative overflow-hidden">
      <SEOHead
        title="404 - Page Not Found | Reel Wheels Experience"
        description="The page you're looking for doesn't exist. Return to our collection of iconic movie vehicles and memorabilia."
        url="https://reelwheelsexperience.com/404"
      />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 text-6xl opacity-10 animate-pulse">
          🎬
        </div>
        <div className="absolute top-40 right-20 text-4xl opacity-10 animate-bounce" style={{ animationDelay: '1s' }}>
          🚗
        </div>
        <div className="absolute bottom-32 left-20 text-5xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}>
          🦇
        </div>
        <div className="absolute bottom-20 right-10 text-3xl opacity-10 animate-bounce" style={{ animationDelay: '0.5s' }}>
          ⭐
        </div>
        <div className="absolute top-1/2 left-1/4 text-4xl opacity-10 animate-pulse" style={{ animationDelay: '1.5s' }}>
          🎭
        </div>
        <div className="absolute top-1/3 right-1/3 text-5xl opacity-10 animate-bounce" style={{ animationDelay: '2.5s' }}>
          🚀
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl md:text-[12rem] font-bebas font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 leading-none tracking-wider drop-shadow-2xl">
            404
          </h1>
        </div>

        {/* Movie Film Strip Effect */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <Film className="h-16 w-16 text-yellow-500 animate-spin" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-0 bg-yellow-500 opacity-20 rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bebas mb-4 text-white tracking-wide">
            SCENE NOT FOUND
          </h2>
          <p className="text-lg md:text-xl text-gray-300 font-inter leading-relaxed max-w-2xl mx-auto">
            Looks like this page took a wrong turn at the DeLorean time circuits. 
            The page you're looking for doesn't exist in our movie universe.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="group bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center space-x-3 font-inter"
          >
            <Home className="h-5 w-5 group-hover:animate-bounce" />
            <span>RETURN TO HOMEPAGE</span>
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="group bg-transparent border-2 border-white text-white hover:bg-white hover:text-black px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-3 font-inter"
          >
            <ArrowLeft className="h-5 w-5 group-hover:animate-pulse" />
            <span>GO BACK</span>
          </button>
        </div>

        {/* Quick Links */}
        <div className="border-t border-gray-700 pt-8">
          <p className="text-gray-400 mb-4 font-inter">Or explore our collection:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/catalog')}
              className="text-yellow-400 hover:text-yellow-300 transition-colors font-inter hover:underline"
            >
              Browse Vehicles
            </button>
            <span className="text-gray-600">•</span>
            <button
              onClick={() => navigate('/about')}
              className="text-yellow-400 hover:text-yellow-300 transition-colors font-inter hover:underline"
            >
              About Us
            </button>
            <span className="text-gray-600">•</span>
            <button
              onClick={() => navigate('/favorites')}
              className="text-yellow-400 hover:text-yellow-300 transition-colors font-inter hover:underline"
            >
              Your Favorites
            </button>
          </div>
        </div>

        {/* Fun Movie Quote */}
        <div className="mt-8 p-6 bg-black bg-opacity-50 rounded-lg border border-gray-700">
          <blockquote className="text-gray-300 italic font-inter">
            "Roads? Where we're going, we don't need roads... but we do need the right URL!"
          </blockquote>
          <cite className="text-yellow-400 text-sm font-inter mt-2 block">- Doc Brown (probably)</cite>
        </div>
      </div>

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
    </div>
  );
}