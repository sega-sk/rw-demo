import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Heart, ArrowLeft, Trash2 } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import { apiService } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import SearchModal from '../../components/Website/SearchModal';
import SEOHead from '../../components/UI/SEOHead';
import WebsiteHeader from '../../components/Website/WebsiteHeader';
import WebsiteFooter from '../../components/Website/WebsiteFooter';
import OptimizedImage from '../../components/UI/OptimizedImage';
import { formatPriceWithSale } from '../../utils/priceUtils';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { favorites, removeFromFavorites } = useFavorites();
  const [showSearchModal, setShowSearchModal] = React.useState(false);

  // Fetch favorite products
  const { data: productsData } = useApi(
    () => apiService.getProducts({ limit: 200 }),
    { 
      immediate: true,
      cacheKey: 'favorites-products',
      cacheTTL: 5 * 60 * 1000,
      staleWhileRevalidate: true
    }
  );

  // Get favorite products from API data or dummy data
  const allProducts = productsData?.rows || [];
  const favoriteProducts = allProducts.filter(product => favorites.includes(product.id));


  const handleProductClick = (product: any) => {
    const type = product.product_types[0] || 'vehicle';
    navigate(`/catalog/${type}/${product.slug}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Your Favorites - Reel Wheels Experience"
        description="View and manage your favorite movie vehicles and memorabilia. Keep track of the items you love most from our collection."
        keywords="favorite movie vehicles, saved items, movie car wishlist, film vehicle favorites"
        url="https://reelwheelsexperience.com/favorites"
      />
      
      {/* Header & Navigation */}
      <WebsiteHeader 
        onSearchClick={() => setShowSearchModal(true)}
        variant="dark"
        className="favorites-header"
      />

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        <button
          onClick={() => navigate('/catalog')}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Catalog
        </button>
      </div>

      {/* Page Header */}
      <div className="favorites-page-header max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Your Favorites</h1>
        <p className="text-gray-600">
          {favoriteProducts.length} {favoriteProducts.length === 1 ? 'item' : 'items'} saved
        </p>
      </div>

      {/* Favorites Grid */}
      <div className="favorites-grid max-w-7xl mx-auto px-4 md:px-6 pb-12 md:pb-16">
        {favoriteProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {favoriteProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <OptimizedImage
                    src={product.images[0] || '/vdp hero (2).webp'}
                    alt={product.title}
                    size="card"
                    className="w-full h-48 md:h-64 object-cover cursor-pointer"
                    onClick={() => handleProductClick(product)}
                  />
                  <button 
                    onClick={() => removeFromFavorites(product.id)}
                    className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                  {product.sale_price && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                      SALE
                    </div>
                  )}
                </div>
                <div className="p-4 md:p-6">
                  <h3 
                    className="text-lg font-normal mb-2 font-inter cursor-pointer hover:text-blue-600"
                    style={{ color: '#636363' }}
                    onClick={() => handleProductClick(product)}
                  >
                    {product.title}
                  </h3>
                  <p className="text-sm mb-4 font-inter" style={{ color: '#636363' }}>{product.subtitle}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {(() => {
                        const priceInfo = formatPriceWithSale(product.retail_price, product.sale_price);
                        return (
                          <>
                            <span className={`${priceInfo.shouldUseSmallFont ? 'text-base' : 'text-lg'} font-inter ${priceInfo.isOnSale ? 'text-red-600' : 'font-normal'}`} 
                                  style={{ color: priceInfo.isOnSale ? '#dc2626' : '#636363' }}>
                              {priceInfo.displayPrice}
                            </span>
                            {priceInfo.originalPrice && (
                              <span className={`${priceInfo.shouldUseSmallFont ? 'text-base' : 'text-lg'} font-inter line-through`} style={{ color: '#636363' }}>
                                {priceInfo.originalPrice}
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                    <button
                      onClick={() => handleProductClick(product)}
                      className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="favorites-empty-state text-center py-12">
            <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-500 mb-6">Start browsing and save your favorite items!</p>
            <button
              onClick={() => navigate('/catalog')}
              className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800"
            >
              Browse Catalog
            </button>
          </div>
        )}
      </div>

      {/* Search Modal */}
      <SearchModal 
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />

      {/* Footer */}
      <WebsiteFooter className="favorites-footer" />
    </div>
  );
}