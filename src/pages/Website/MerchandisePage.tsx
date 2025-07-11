import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Filter, Heart, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiService } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import SearchModal from '../../components/Website/SearchModal';
import { useFavorites } from '../../contexts/FavoritesContext';
import WebsiteHeader from '../../components/Website/WebsiteHeader';
import WebsiteFooter from '../../components/Website/WebsiteFooter';
import SEOHead from '../../components/UI/SEOHead';
import Tooltip from '../../components/UI/Tooltip';
import OptimizedImage from '../../components/UI/OptimizedImage';

// Merchandise Card Component
function MerchandiseCard({ item, onItemClick, onFavoriteToggle, isFavorite }: {
  item: any,
  onItemClick: (item: any) => void,
  onFavoriteToggle: (itemId: string) => void,
  isFavorite: (itemId: string) => boolean
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Use item photos or fallback to demo images
  const images = item.photos?.length > 0 ? item.photos : [
    item.photos?.[0] || '/Back To The Future 35th Anniversary-mobile.webp',
    '/Back To The Future Bttf Airbrush.webp',
    '/Back To The Future 35th Anniversary _balanced.webp'
  ];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
      <div className="relative overflow-hidden rounded-lg">
        {item.photos[0] ? (
          <OptimizedImage
            src={images[currentImageIndex]}
            alt={item.title}
            size="card"
            className="w-full h-48 md:h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            onClick={() => onItemClick(item)}
          />
        ) : (
          <div className="w-full h-48 md:h-64 bg-gray-900 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <span className="text-white text-lg font-bold">T-SHIRT</span>
          </div>
        )}
        
        {/* Image Dots */}
        {images.length > 1 && (
          <div className="image-dots absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        )}
        
        <button 
          className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 hidden"
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle(item.id);
          }}
        >
          <Heart 
            className={`h-4 w-4 transition-colors ${
              isFavorite(item.id) ? 'text-red-500 fill-current' : 'text-gray-600'
            }`}
          />
        </button>
        
        <div className="absolute top-4 left-4 bg-green-500 text-white px-2 py-1 rounded text-sm font-medium">
          MERCHANDISE
        </div>
      </div>
      <div className="p-4 md:p-6" onClick={() => onItemClick(item)}>
        <h3 className="text-lg font-normal mb-2 font-inter" style={{ color: '#636363' }}>{item.title}</h3>
        <p className="text-sm mb-4 font-inter" style={{ color: '#636363' }}>{item.subtitle}</p>
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-green-600 font-inter">
            ${item.price}
          </div>
          <div className="flex items-center space-x-1">
            {item.keywords.slice(0, 2).map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded font-inter">
                {tag}
              </span>
            ))}
            {item.keywords.length > 2 && (
              <Tooltip 
                content={
                  <div className="max-w-xs">
                    <div className="font-medium mb-2">Additional Tags:</div>
                    <div className="flex flex-wrap gap-1">
                      {item.keywords.slice(2).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                }
                position="top"
              >
                <span className="text-xs text-gray-500 font-inter cursor-help hover:text-gray-700 transition-colors">
                  +{item.keywords.length - 2}
                </span>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MerchandisePage() {
  const { productType, slug } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    category: 'Any',
    priceRange: 'Any',
  });
  const [sortBy, setSortBy] = useState('Featured');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const { toggleFavorite, isFavorite } = useFavorites();

  // If we have a slug, redirect to a detail view (you can implement this later)
  useEffect(() => {
    if (slug) {
      // For now, redirect to merchandise main page
      navigate('/merchandise');
    }
  }, [slug, navigate]);

  // Fetch merchandise with filters
  const { data: merchandiseData, loading, execute: refetchMerchandise } = useApi(
    () => searchTerm.trim() 
      ? apiService.getMerchandise({
          q: searchTerm,
          limit: 100
        })
      : apiService.getMerchandise({
          sort: sortBy === 'Featured' ? '-created_at' : sortBy.toLowerCase(),
          limit: 100
        }),
    { 
      immediate: true,
      cacheKey: searchTerm.trim() 
        ? `search-merchandise-${searchTerm}` 
        : `merchandise-${JSON.stringify(selectedFilters)}-${sortBy}`,
      cacheTTL: searchTerm.trim() ? 30 * 1000 : 2 * 60 * 1000,
      staleWhileRevalidate: !searchTerm.trim(),
      skipCache: searchTerm.trim() && searchTerm.length < 3
    }
  );

  // Use API data if available, otherwise use dummy data
  const allItems = merchandiseData?.rows || [];

  // Apply client-side filtering for dummy data
  const filteredItems = allItems.filter(item => {
    const matchesSearch = !searchTerm || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subtitle?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriceRange = selectedFilters.priceRange === 'Any' || 
      (selectedFilters.priceRange === 'Under $50' && parseFloat(item.price) < 50) ||
      (selectedFilters.priceRange === '$50-$100' && parseFloat(item.price) >= 50 && parseFloat(item.price) <= 100) ||
      (selectedFilters.priceRange === 'Over $100' && parseFloat(item.price) > 100);

    return matchesSearch && matchesPriceRange;
  });

  // Apply sorting
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'Featured':
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      case 'Price: Low to High':
        return parseFloat(a.price || '0') - parseFloat(b.price || '0');
      case 'Price: High to Low':
        return parseFloat(b.price || '0') - parseFloat(a.price || '0');
      case 'Newest':
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      case 'A-Z':
        return a.title.localeCompare(b.title);
      case 'Z-A':
        return b.title.localeCompare(a.title);
      default:
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = sortedItems.slice(startIndex, endIndex);

  // Refetch when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      refetchMerchandise();
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedFilters, sortBy]);

  const handleItemClick = (item: any) => {
    // For now, just show an alert or you can implement a detail modal
    alert(`${item.title} - $${item.price}\n\nContact us to purchase this item!`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Movie Merchandise - Reel Wheels Experience"
        description="Shop our collection of movie-themed merchandise. T-shirts, hoodies, and collectibles from your favorite films."
        keywords="movie merchandise, film t-shirts, movie collectibles, cinema apparel, Hollywood merchandise"
        url="https://reelwheelsexperience.com/merchandise"
      />
      
      <WebsiteHeader 
        onSearchClick={() => setShowSearchModal(true)}
        variant="dark"
        className="merchandise-header"
      />

      <div className="merchandise-page-header bg-gray-50 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <h1 className="text-5xl font-bebas text-gray-900 mb-4" style={{ fontSize: '48px' }}>Merchandise</h1>
          <p className="text-gray-600 font-inter">Movie-themed apparel and collectibles</p>
        </div>
      </div>

      <div className="merchandise-filters-search max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search merchandise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full border border-gray-300 bg-white py-4 pl-12 pr-6 text-base focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200 font-inter transition-all shadow-sm"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white p-2 rounded-full hover:bg-gray-800 transition-colors">
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="hidden md:flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <select
                value={selectedFilters.category}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, category: e.target.value }))}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 min-w-[140px] font-inter shadow-sm"
              >
                <option value="Any">Any Category</option>
                <option value="T-Shirts">T-Shirts</option>
                <option value="Hoodies">Hoodies</option>
                <option value="Accessories">Accessories</option>
                <option value="Collectibles">Collectibles</option>
              </select>
              <span className="absolute left-4 -top-2 bg-white px-1 text-xs text-gray-500 font-inter">Category</span>
              <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={selectedFilters.priceRange}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 min-w-[140px] font-inter shadow-sm"
              >
                <option value="Any">Any Price</option>
                <option value="Under $50">Under $50</option>
                <option value="$50-$100">$50-$100</option>
                <option value="Over $100">Over $100</option>
              </select>
              <span className="absolute left-4 -top-2 bg-white px-1 text-xs text-gray-500 font-inter">Price Range</span>
              <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 font-inter">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 font-inter shadow-sm bg-white"
            >
              <option value="Featured">Featured</option>
              <option value="Price: Low to High">Price: Low to High</option>
              <option value="Price: High to Low">Price: High to Low</option>
              <option value="Newest">Newest</option>
              <option value="A-Z">A-Z</option>
              <option value="Z-A">Z-A</option>
            </select>
          </div>
        </div>

        <div className="mb-6 hidden md:block">
          <p className="text-gray-600 font-inter text-lg">{sortedItems.length} Items found</p>
        </div>

        {loading ? (
          <div className="merchandise-grid flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <div className="merchandise-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {currentItems.map((item) => (
              <MerchandiseCard
                key={item.id}
                item={item}
                onItemClick={handleItemClick}
                onFavoriteToggle={toggleFavorite}
                isFavorite={isFavorite}
              />
            ))}
          </div>
        )}

        {sortedItems.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg font-inter">No merchandise items found matching your criteria.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="merchandise-pagination flex justify-center mt-8 md:mt-12">
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-inter"
              >
                ‹
              </button>
              
              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-lg text-sm font-inter ${
                    page === currentPage
                      ? 'bg-green-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button 
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-inter"
              >
                ›
              </button>
            </div>
          </div>
        )}

        <div className="text-center mt-4 text-sm text-gray-600 font-inter">
          Showing results {startIndex + 1}-{Math.min(endIndex, sortedItems.length)} of {sortedItems.length}
        </div>
      </div>

      <SearchModal 
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />

      <WebsiteFooter className="merchandise-footer mt-12 md:mt-16" />
    </div>
  );
}