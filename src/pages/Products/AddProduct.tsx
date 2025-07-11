import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, Plus, X, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/UI/Button';
import FormField from '../../components/Forms/FormField';
import Input from '../../components/Forms/Input';
import Textarea from '../../components/Forms/Textarea';
import Select from '../../components/Forms/Select';
import ImageUploader from '../../components/UI/ImageUploader';
import { apiService } from '../../services/api';
import { useApi, useMutation } from '../../hooks/useApi';
import type { ProductCreate, RentalPeriod } from '../../services/api';
import OptimizedImage from '../../components/UI/OptimizedImage';

// Product type options
const productTypes = [
  { value: '', label: 'Type Product Type' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'prop', label: 'Prop' },
  { value: 'costume', label: 'Costume' },
  { value: 'memorabilia', label: 'Memorabilia' },
];

// Rental period options
const rentalPeriods = [
  { value: '', label: 'Select Rental Period' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export default function AddProduct() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Add debug logging
  console.log('AddProduct component rendered', location.pathname, 'isAuthenticated:', isAuthenticated);
  
  // Form state
  const [formData, setFormData] = useState<ProductCreate>({
    title: '',
    subtitle: '',
    description: '',
    product_types: [],
    movies: [],
    genres: [],
    keywords: [],
    available_rental_periods: [],
    images: [],
    background_image_url: null,
    is_background_image_activated: false,
    is_trending_model: false,
    sale_price: null,
    retail_price: null,
    rental_price_hourly: null,
    rental_price_daily: null,
    rental_price_weekly: null,
    rental_price_monthly: null,
    rental_price_yearly: null,
    video_url: null,
    memorabilia_ids: [],
    merchandise_ids: [],
    product_ids: [],
  });

  const [newKeyword, setNewKeyword] = useState('');
  const [newGenre, setNewGenre] = useState('');
  const [newMovie, setNewMovie] = useState('');
  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');

  // API hooks
  const { data: memorabiliaData } = useApi(
    () => apiService.getMemorabilia({ limit: 20 }),
    { 
      immediate: true,
      cacheKey: 'add-product-memorabilia',
      cacheTTL: 5 * 60 * 1000,
      staleWhileRevalidate: true
    }
  );

  const { data: merchandiseData } = useApi(
    () => apiService.getMerchandise({ limit: 20 }),
    { 
      immediate: true,
      cacheKey: 'add-product-merchandise',
      cacheTTL: 5 * 60 * 1000,
      staleWhileRevalidate: true
    }
  );

  const { mutate: createProduct, loading: creating } = useMutation(
    (data: ProductCreate) => apiService.createProduct(data)
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayFieldAdd = (field: keyof ProductCreate, value: string, setValue: (value: string) => void) => {
    if (value.trim()) {
      const currentArray = formData[field] as string[];
      if (!currentArray.includes(value.trim())) {
        setFormData(prev => ({
          ...prev,
          [field]: [...currentArray, value.trim()]
        }));
        setValue('');
      }
    }
  };

  const handleArrayFieldRemove = (field: keyof ProductCreate, valueToRemove: string) => {
    const currentArray = formData[field] as string[];
    setFormData(prev => ({
      ...prev,
      [field]: currentArray.filter(item => item !== valueToRemove)
    }));
  };

  const handleRentalPeriodChange = (period: RentalPeriod) => {
    const currentPeriods = formData.available_rental_periods;
    if (currentPeriods.includes(period)) {
      setFormData(prev => ({
        ...prev,
        available_rental_periods: currentPeriods.filter(p => p !== period)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        available_rental_periods: [...currentPeriods, period]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Please login to add products');
      navigate('/admin/login');
      return;
    }
    
    console.log('Submitting product form with data:', JSON.stringify(formData, null, 2));
    
    try {
      // Clean up the data before sending
      const cleanedData = {
        ...formData,
        background_image_url: backgroundImages[0] || null,
        // Convert string prices to numbers or strings as expected by API
        sale_price: formData.sale_price ? formData.sale_price.toString() : null,
        retail_price: formData.retail_price ? formData.retail_price.toString() : null,
        rental_price_hourly: formData.rental_price_hourly ? formData.rental_price_hourly.toString() : null,
        rental_price_daily: formData.rental_price_daily ? formData.rental_price_daily.toString() : null,
        rental_price_weekly: formData.rental_price_weekly ? formData.rental_price_weekly.toString() : null,
        rental_price_monthly: formData.rental_price_monthly ? formData.rental_price_monthly.toString() : null,
        rental_price_yearly: formData.rental_price_yearly ? formData.rental_price_yearly.toString() : null,
        video_url: videoUrl.trim() || null,
      };

      const result = await createProduct(cleanedData);
      console.log('Product created successfully:', result);
      alert('Product created successfully!');
      navigate('/admin/product-list');
    } catch (error) {
      console.error('Failed to create product:', error);
      if (error instanceof Error && error.message.includes('Authentication')) {
        alert('Authentication expired. Please login again.');
        navigate('/admin/login');
      } else {
        alert('Failed to create product. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    navigate('/admin/product-list');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto product-form-container">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Add Product</h1>
          <p className="text-gray-600">
            Add new product details below - 
            <button 
              onClick={() => navigate('/admin/product-list')}
              className="text-blue-600 hover:text-blue-800 ml-1"
            >
              or go to listing
            </button>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="product-form">
          {/* Left Column - Product Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Information Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Product Information</h2>
              
              <div className="space-y-4">
                <FormField label="Product title" required>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter product title"
                    required
                  />
                </FormField>

                <FormField label="Subtitle">
                  <Input
                    name="subtitle"
                    value={formData.subtitle || ''}
                    onChange={handleInputChange}
                    placeholder="Enter subtitle"
                  />
                </FormField>

                {/* Keywords */}
                <FormField label="Search Keywords">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.keywords.map((keyword, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                          {keyword}
                          <button
                            type="button"
                            onClick={() => handleArrayFieldRemove('keywords', keyword)}
                            className="ml-2 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <Input
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        placeholder="Add keyword"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleArrayFieldAdd('keywords', newKeyword, setNewKeyword))}
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleArrayFieldAdd('keywords', newKeyword, setNewKeyword)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </FormField>

                {/* Product Types */}
                <FormField label="Product Types">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.product_types.map((type, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                          {type}
                          <button
                            type="button"
                            onClick={() => handleArrayFieldRemove('product_types', type)}
                            className="ml-2 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <Select
                      options={productTypes}
                      onChange={(e) => {
                        if (e.target.value) {
                          handleArrayFieldAdd('product_types', e.target.value, () => {});
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                </FormField>

                {/* Movies */}
                <FormField label="Movies">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.movies.map((movie, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                          {movie}
                          <button
                            type="button"
                            onClick={() => handleArrayFieldRemove('movies', movie)}
                            className="ml-2 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <Input
                        value={newMovie}
                        onChange={(e) => setNewMovie(e.target.value)}
                        placeholder="Add movie"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleArrayFieldAdd('movies', newMovie, setNewMovie))}
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleArrayFieldAdd('movies', newMovie, setNewMovie)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </FormField>

                {/* Genres */}
                <FormField label="Genres">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.genres.map((genre, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                          {genre}
                          <button
                            type="button"
                            onClick={() => handleArrayFieldRemove('genres', genre)}
                            className="ml-2 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <Input
                        value={newGenre}
                        onChange={(e) => setNewGenre(e.target.value)}
                        placeholder="Add genre"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleArrayFieldAdd('genres', newGenre, setNewGenre))}
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleArrayFieldAdd('genres', newGenre, setNewGenre)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </FormField>

                <FormField label="Description">
                  <Textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Product description..."
                  />
                </FormField>
              </div>
            </div>

            {/* Pricing Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Pricing Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <FormField label="Retail Price">
                  <Input
                    name="retail_price"
                    type="number"
                    value={formData.retail_price || ''}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </FormField>

                <FormField label="Sale Price">
                  <Input
                    name="sale_price"
                    type="number"
                    value={formData.sale_price || ''}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </FormField>
              </div>

              {/* Rental Periods */}
              <FormField label="Available Rental Periods">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.available_rental_periods.map((period, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                        {period}
                        <button
                          type="button"
                          onClick={() => handleArrayFieldRemove('available_rental_periods', period)}
                          className="ml-2 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <Select
                    options={rentalPeriods}
                    onChange={(e) => {
                      if (e.target.value) {
                        handleRentalPeriodChange(e.target.value as RentalPeriod);
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              </FormField>

              {/* Rental Prices */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <FormField label="Hourly Rate">
                  <Input
                    name="rental_price_hourly"
                    type="number"
                    value={formData.rental_price_hourly || ''}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </FormField>

                <FormField label="Daily Rate">
                  <Input
                    name="rental_price_daily"
                    type="number"
                    value={formData.rental_price_daily || ''}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </FormField>

                <FormField label="Weekly Rate">
                  <Input
                    name="rental_price_weekly"
                    type="number"
                    value={formData.rental_price_weekly || ''}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </FormField>

                <FormField label="Monthly Rate">
                  <Input
                    name="rental_price_monthly"
                    type="number"
                    value={formData.rental_price_monthly || ''}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </FormField>
              </div>

              {/* Video URL */}
              <FormField label="Product Video URL">
                <Input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Add a video URL to showcase this product with video background on homepage slider
                </p>
              </FormField>
            </div>
          </div>

          {/* Right Column - Images and Connected Items */}
          <div className="space-y-6">
            {/* Product Images */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h3>
              <ImageUploader 
                images={formData.images}
                onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
              />

              {/* Background for Product Page */}
              <div className="border-t pt-4 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700">Background for Product Page</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="is_background_image_activated"
                      checked={formData.is_background_image_activated}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {formData.is_background_image_activated && (
                  <div className="space-y-4">
                    <ImageUploader 
                      images={backgroundImages}
                      onImagesChange={setBackgroundImages}
                      maxImages={1}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Connected Memorabilia */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Connected Memorabilia</h3>
                <button 
                  type="button"
                  onClick={() => navigate('/admin/memorabilia')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View All
                </button>
              </div>
              
              {/* Use API data if available, otherwise use dummy data */}
              {(memorabiliaData?.rows || []).slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center space-x-3 mb-3">
                  <input
                    type="checkbox"
                    checked={formData.memorabilia_ids?.includes(item.id) || false}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData(prev => ({
                        ...prev,
                        memorabilia_ids: checked 
                          ? [...(prev.memorabilia_ids || []), item.id]
                          : (prev.memorabilia_ids || []).filter(id => id !== item.id)
                      }));
                    }}
                    className="rounded text-blue-600"
                  />
                  <OptimizedImage
                    src={item.photos[0] || 'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2'} 
                    alt={item.title}
                    size="thumbnail"
                    className="w-10 h-10 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                    <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Merchandise */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Merchandise</h3>
                <button 
                  type="button"
                  onClick={() => navigate('/admin/merchandise')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View All
                </button>
              </div>
              
              {/* Use API data if available, otherwise use dummy data */}
              {(merchandiseData?.rows || []).slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center space-x-3 mb-3">
                  <input
                    type="checkbox"
                    checked={formData.merchandise_ids?.includes(item.id) || false}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData(prev => ({
                        ...prev,
                        merchandise_ids: checked 
                          ? [...(prev.merchandise_ids || []), item.id]
                          : (prev.merchandise_ids || []).filter(id => id !== item.id)
                      }));
                    }}
                    className="rounded text-blue-600"
                  />
                  <div className="w-10 h-10 bg-black rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">T</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                    <p className="text-xs text-gray-500 truncate">${item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </form>
        {/* Form Actions */}
        <div className="mt-6 flex justify-end space-x-4">
          <Button variant="outline" type="button" onClick={handleCancel} className="btn-hover">
            Back to List
          </Button>
          <Button onClick={handleSubmit} loading={creating} className="btn-hover">
            Save Product
          </Button>
        </div>
      </div>
    </div>
  );
}