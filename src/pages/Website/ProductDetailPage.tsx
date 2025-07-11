import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, ArrowLeft, Expand, X, Grid } from 'lucide-react';
import { formatPriceWithSale } from '../../utils/priceUtils';
import { apiService } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import ContactModal from '../../components/UI/ContactModal';
import SearchModal from '../../components/Website/SearchModal';
import { useFavorites } from '../../contexts/FavoritesContext';
import WebsiteHeader from '../../components/Website/WebsiteHeader';
import WebsiteFooter from '../../components/Website/WebsiteFooter';
import SEOHead from '../../components/UI/SEOHead';
import OptimizedImage from '../../components/UI/OptimizedImage';

export default function ProductDetailPage() {
  const { productType, slug } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const { toggleFavorite, isFavorite } = useFavorites();

  // Fetch product details
  const { data: product, loading } = useApi(
    () => slug ? apiService.getProduct(slug) : Promise.reject('No slug provided'),
    { 
      immediate: !!slug,
      cacheKey: `product-${slug}`,
      cacheTTL: 5 * 60 * 1000,
      staleWhileRevalidate: true
    }
  );

  // Fetch related products
  const { data: relatedProductsData } = useApi(
    () => apiService.getProducts({ 
      product_types: product?.product_types || ['vehicle'],
      limit: 4 
    }),
    { 
      immediate: !!product,
      cacheKey: `related-${product?.id}`,
      cacheTTL: 10 * 60 * 1000,
      staleWhileRevalidate: true
    }
  );

  // Fetch memorabilia
  const { data: memorabiliaData } = useApi(
    () => apiService.getMemorabilia({ limit: 6 }),
    { 
      immediate: true,
      cacheKey: 'product-detail-memorabilia',
      cacheTTL: 10 * 60 * 1000,
      staleWhileRevalidate: true
    }
  );

  // Fetch merchandise
  const { data: merchandiseData } = useApi(
    () => apiService.getMerchandise({ limit: 6 }),
    { 
      immediate: true,
      cacheKey: 'product-detail-merchandise',
      cacheTTL: 10 * 60 * 1000,
      staleWhileRevalidate: true
    }
  );

  // Use API data if available, otherwise find from dummy data
  const currentProduct = product;
  const relatedProducts = relatedProductsData?.rows?.filter(p => p.id !== currentProduct?.id) || 
    [];
  
  // Use API data if available, otherwise use dummy data
  const memorabiliaItems = memorabiliaData?.rows?.slice(0, 6) || [];
  const merchandiseItems = merchandiseData?.rows?.slice(0, 6) || [];

  // Ensure we always have a valid images array
  const productImages = currentProduct?.images || [];
  const images = productImages.length > 0 ? productImages : [
    productImages[0] || '/vdp hero (2).webp',
    'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&dpr=2',
    'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&dpr=2',
    'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&dpr=2'
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const openGallery = (index: number) => {
    setGalleryIndex(index);
    setShowGallery(true);
  };

  const handleRelatedProductClick = (relatedProduct: any) => {
    const type = relatedProduct.product_types[0] || 'vehicle';
    navigate(`/catalog/${type}/${relatedProduct.slug}`);
  };

  const handleMemorabiliaClick = (item: any) => {
    navigate(`/memorabilia/${item.slug || item.id}`);
  };

  const handleMerchandiseClick = (item: any) => {
    navigate(`/merchandise/${item.slug || item.id}`);
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <WebsiteHeader 
          onSearchClick={() => setShowSearchModal(true)}
          variant="dark"
          className="product-detail-header"
        />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className="min-h-screen bg-white">
        <WebsiteHeader 
          onSearchClick={() => setShowSearchModal(true)}
          variant="dark"
          className="product-detail-header"
        />
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/catalog')}
              className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800"
            >
              Browse Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  const priceInfo = formatPriceWithSale(currentProduct.retail_price, currentProduct.sale_price);

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title={`${currentProduct.title} - Reel Wheels Experience`}
        description={currentProduct.description || `${currentProduct.title} - ${currentProduct.subtitle}`}
        keywords={`${currentProduct.title}, ${currentProduct.keywords?.join(', ')}, movie vehicle rental`}
        url={`https://reelwheelsexperience.com/catalog/${productType}/${slug}`}
        image={images[0]}
        type="product"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": currentProduct.title,
          "description": currentProduct.description,
          "image": images,
          "offers": {
            "@type": "Offer",
            "price": currentProduct.retail_price || "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          }
        }}
      />
      
      <WebsiteHeader 
        onSearchClick={() => setShowSearchModal(true)}
        variant="dark"
        className="product-detail-header"
      />

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        <button
          onClick={() => navigate('/catalog')}
          className="flex items-center text-blue-600 hover:text-blue-800 font-inter"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Catalog
        </button>
      </div>

      {/* Product Detail Main */}
      <div className="product-detail-main max-w-7xl mx-auto px-4 md:px-6 pb-12">
        {/* Main Product Image */}
        <div className="product-detail-main-slider relative w-full group cursor-zoom-in mb-8 overflow-hidden rounded-xl shadow-2xl" onClick={() => openGallery(currentImageIndex)}>
          {currentProduct.video_url && currentImageIndex === 0 ? (
            <div className="relative">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
                poster={images[0]}
              >
                <source src={currentProduct.video_url} type="video/mp4" />
                <OptimizedImage
                  src={images[0]} 
                  alt={currentProduct.title}
                  size="hero"
                  className="w-full h-full object-cover"
                />
              </video>
            </div>
          ) : (
            <OptimizedImage
              src={images[currentImageIndex]}
              alt={currentProduct.title}
              size="hero"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          )}
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="nav-arrows absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all z-20 backdrop-blur-sm transform hover:scale-110"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="nav-arrows absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all z-20 backdrop-blur-sm transform hover:scale-110"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Gallery Button */}
          <button
            onClick={(e) => { e.stopPropagation(); openGallery(currentImageIndex); }}
            className="gallery-controls absolute top-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all z-20 backdrop-blur-sm transform hover:scale-110"
          >
            <Expand className="h-5 w-5" />
          </button>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm z-20 backdrop-blur-sm">
            {currentImageIndex + 1} / {images.length}
          </div>

          {/* Hover Overlay */}
          <div className="product-hover-overlay absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100 z-10">
            <div className="text-white text-lg font-medium backdrop-blur-sm bg-black bg-opacity-30 px-4 py-2 rounded-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
              Click to view gallery
            </div>
          </div>
          
          {/* Cinematic border glow effect */}
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500 group-hover:shadow-blue-500/50 group-hover:shadow-2xl transition-all duration-500 rounded-xl pointer-events-none"></div>
        </div>

        {/* Thumbnails Slider and Product Info Row */}
        <div className="product-main-content grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Left Column: Thumbnails Slider */}
          <div className="lg:col-span-2">
            <ThumbnailSlider 
              images={images}
              currentImageIndex={currentImageIndex}
              onImageSelect={setCurrentImageIndex}
              productTitle={currentProduct.title}
            />
          </div>

          {/* Right Column: Product Title and Price */}
          <div className="lg:col-span-1">
            <h1 className="text-3xl md:text-4xl font-bebas text-gray-900 mb-2 leading-tight">
              {currentProduct.title}
            </h1>
            <p className="text-lg text-gray-600 mb-6 font-inter">{currentProduct.subtitle}</p>

            <div className="flex justify-end">
              <div className="price-container mb-6">
                {priceInfo.isCallForPrice ? (
                  <div className="call-for-price">Call for Price</div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <span className={`text-3xl font-bold ${priceInfo.isOnSale ? 'text-red-600' : 'text-gray-900'} font-inter`}>
                      {priceInfo.displayPrice}
                    </span>
                    {priceInfo.originalPrice && (
                      <span className="text-xl text-gray-500 line-through font-inter">
                        {priceInfo.originalPrice}
                      </span>
                    )}
                  </div>
                )}
              </div>
  
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => setShowContactModal(true)}
                  className="bg-gray-900 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-800 transition-colors font-inter"
                >
                  Get in Touch
                </button>
                <button
                  onClick={() => toggleFavorite(currentProduct.id)}
                  className={`flex items-center justify-center px-8 py-4 rounded-lg border-2 transition-colors font-inter ${
                    isFavorite(currentProduct.id)
                      ? 'border-red-500 text-red-500 bg-red-50'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <Heart className={`h-5 w-5 mr-2 ${isFavorite(currentProduct.id) ? 'fill-current' : ''}`} />
                  {isFavorite(currentProduct.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                </button>
              </div>
            </div>
          </div>
        

        {/* Product Description and Keywords */}
        {(currentProduct.description || currentProduct.keywords?.length > 0) && (
          <div className="mb-16-none">
            {currentProduct.description && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 font-inter">Description</h3>
                <p className="text-gray-700 leading-relaxed font-inter text-lg">{currentProduct.description}</p>
              </div>
            )}

            {/* Keywords */}
            {currentProduct.keywords?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 font-inter">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {currentProduct.keywords.map((keyword, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full font-inter">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Memorabilia and Merchandise Row Layout */}
        <div className="memorabilia-merchandise-row mt-16">

          {/* Merchandise Section */}
          {merchandiseItems.length > 0 && (
            <div>
              <div className="product-merchandise-wrapper flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-bebas text-gray-900">Merchandise</h2>
                <button
                  onClick={() => navigate('/merchandise')}
                  className="text-blue-600 hover:text-blue-800 font-medium font-inter"
                >
                  View All →
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {merchandiseItems.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => handleMerchandiseClick(item)}
                  >
                    <div className="relative overflow-hidden">
                      {item.photos[0] ? (
                        <OptimizedImage
                          src={item.photos[0]}
                          alt={item.title}
                          size="card"
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-900 flex items-center justify-center">
                          <span className="text-white text-lg font-bold">T-SHIRT</span>
                        </div>
                      )}
                      <div className="hidden absolute top-4 left-4 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                        MERCHANDISE
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-1 font-inter">{item.title}</h3>
                      <p className="text-sm text-gray-600 mb-2 font-inter">{item.subtitle}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900 font-inter">${item.price}</span>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {item.keywords.slice(0, 2).map((keyword, index) => (
                            <span key={index} className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded font-inter">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Memorabilia Section */}
          {memorabiliaItems.length > 0 && (
            <div className="product-memorabilia-wrapper mb-16 lg:mb-0">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-bebas text-gray-900">Movie Memorabilia</h2>
                <button
                  onClick={() => navigate('/memorabilia')}
                  className="text-blue-600 hover:text-blue-800 font-medium font-inter"
                >
                  View All →
                </button>
              </div>
              <div className="flex flex-col">
                {memorabiliaItems.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group flex"
                    onClick={() => handleMemorabiliaClick(item)}
                  >
                    <div className="relative overflow-hidden">
                      <OptimizedImage
                        src={item.photos[0] || '/memorabilia_balanced.webp'}
                        alt={item.title}
                        size="card"
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="hidden absolute top-4 left-4 bg-purple-500 text-white px-2 py-1 rounded text-xs font-medium">
                        MEMORABILIA
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-1 font-inter">{item.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 font-inter">{item.subtitle}</p>
                      <div className="flex flex-wrap gap-1">
                        {item.keywords.slice(0, 2).map((keyword, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded font-inter">
                            {keyword}
                          </span>
                        ))}
                        {item.keywords.length > 2 && (
                          <span className="text-xs text-gray-500 font-inter">
                            +{item.keywords.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl md:text-3xl font-bebas text-gray-900 mb-8">You Might be Interested</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleRelatedProductClick(relatedProduct)}
                >
                  <OptimizedImage
                    src={relatedProduct.images[0] || '/vdp hero (2).webp'}
                    alt={relatedProduct.title}
                    size="card"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-1 font-inter">{relatedProduct.title}</h3>
                    <p className="text-sm text-gray-600 font-inter">{relatedProduct.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
      </div>

        </div>

      {/* Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close Button */}
            <button
              onClick={() => setShowGallery(false)}
              className="absolute top-4 right-4 bg-white bg-opacity-20 text-white p-2 rounded-full hover:bg-opacity-30 transition-all z-10"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Main Image */}
            <div className="relative max-h-full">
              <OptimizedImage 
                src={images[galleryIndex]} 
                alt={`${currentProduct.title} ${galleryIndex + 1}`}
                size="fullscreen"
                className="max-w-full max-h-full object-contain"
              />
              
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setGalleryIndex((prev) => (prev - 1 + images.length) % images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 text-white p-3 rounded-full hover:bg-opacity-30 transition-all"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => setGalleryIndex((prev) => (prev + 1) % images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 text-white p-3 rounded-full hover:bg-opacity-30 transition-all"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 bg-black bg-opacity-50 p-2 rounded-lg">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setGalleryIndex(index)}
                  className={`w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                    index === galleryIndex ? 'border-white' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <OptimizedImage 
                    src={image} 
                    alt={`Thumbnail ${index + 1}`}
                    size="thumbnail"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Image Counter */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
              {galleryIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      <ContactModal 
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        productTitle={currentProduct.title}
        productPrice={priceInfo.displayPrice}
      />

      {/* Search Modal */}
      <SearchModal 
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />

      <WebsiteFooter className="product-detail-footer" />
    </div>
  );
}

// Thumbnail Slider Component
function ThumbnailSlider({ images, currentImageIndex, onImageSelect, productTitle }) {
  const [startIndex, setStartIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const visibleCount = 4; // Show 6 thumbnails at a time
  
  const canScrollLeft = startIndex > 0;
  const canScrollRight = startIndex + visibleCount < images.length;
  
  const scrollLeft = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setStartIndex(Math.max(0, startIndex - 1));
    setTimeout(() => setIsAnimating(false), 300);
  };
  
  const scrollRight = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setStartIndex(Math.min(images.length - visibleCount, startIndex + 1));
    setTimeout(() => setIsAnimating(false), 300);
  };
  
  // Auto-scroll to keep current image visible
  useEffect(() => {
    if (currentImageIndex < startIndex) {
      setStartIndex(currentImageIndex);
    } else if (currentImageIndex >= startIndex + visibleCount) {
      setStartIndex(currentImageIndex - visibleCount + 1);
    }
  }, [currentImageIndex, startIndex, visibleCount]);
  
  const visibleImages = images.slice(startIndex, startIndex + visibleCount);
  
  return (
    <div className="relative product-thumbnails-wrapper overflow-hidden">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 font-inter hidden">Product Gallery</h3>
      
      <div className="relative thumbnail-slider-container">
        {/* Scroll Left Button */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            disabled={isAnimating}
            className="thumbnail-slider-nav left absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-all transform hover:scale-110 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
        )}
        
        {/* Thumbnails Container */}
        <div className="thumbnail-slider-track flex space-x-3 px-8 transition-transform duration-300 ease-in-out">
          {visibleImages.map((image, index) => {
            const actualIndex = startIndex + index;
            return (
              <button
                key={actualIndex}
                onClick={() => onImageSelect(actualIndex)}
                className={`thumbnail-slider-item flex-shrink-0 w-20 h-16 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                  actualIndex === currentImageIndex 
                    ? 'border-blue-500 ring-2 ring-blue-200 scale-110 shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <OptimizedImage
                  src={image}
                  alt={`${productTitle} ${actualIndex + 1}`}
                  size="thumbnail"
                  className="w-full h-full object-cover transition-transform duration-300"
                />
              </button>
            );
          })}
        </div>
        
        {/* Scroll Right Button */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            disabled={isAnimating}
            className="thumbnail-slider-nav right absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-all transform hover:scale-110 disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        )}
      </div>
      
      {/* Image Counter */}
      <div className="text-center mt-3 text-sm text-gray-500 font-inter transition-opacity duration-300">
        {currentImageIndex + 1} of {images.length} images
      </div>
    </div>
  );
}