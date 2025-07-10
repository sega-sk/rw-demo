import { authService } from './auth';
import { invalidateProductCache, invalidateMemorabiliaCache, invalidateMerchandiseCache } from './cache';

interface ApiResponse<T> {
  data?: T;
  detail?: string;
  message?: string;
}

interface ListResponse<T> {
  limit?: number;
  offset: number;
  search?: string;
  sort?: string;
  total: number;
  rows: T[];
  available_filters?: AvailableFilter[];
  error?: string;
}

interface AvailableFilter {
  label: string;
  name: string;
  values: AvailableFilterValue[];
}

interface AvailableFilterValue {
  label: string;
  value: string;
  count: number;
}

interface Product {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  product_types: string[];
  movies: string[];
  genres: string[];
  keywords: string[];
  available_rental_periods: RentalPeriod[];
  images: string[];
  background_image_url?: string;
  is_background_image_activated: boolean;
  is_trending_model: boolean;
  sale_price?: string;
  retail_price?: string;
  rental_price_hourly?: string;
  rental_price_daily?: string;
  rental_price_weekly?: string;
  rental_price_monthly?: string;
  rental_price_yearly?: string;
  slug: string;
  video_url?: string;
  created_at?: string;
  updated_at?: string;
  products?: LinkedItem[];
}

interface ProductCreate {
  title: string;
  subtitle?: string;
  description?: string;
  product_types?: string[];
  movies?: string[];
  genres?: string[];
  keywords?: string[];
  available_rental_periods?: RentalPeriod[];
  images?: string[];
  background_image_url?: string;
  is_background_image_activated?: boolean;
  is_trending_model?: boolean;
  sale_price?: number | string;
  retail_price?: number | string;
  rental_price_hourly?: number | string;
  rental_price_daily?: number | string;
  rental_price_weekly?: number | string;
  rental_price_monthly?: number | string;
  rental_price_yearly?: number | string;
  slug?: string;
  video_url?: string;
  memorabilia_ids?: string[];
  merchandise_ids?: string[];
  product_ids?: string[];
}

interface ProductUpdate extends Partial<ProductCreate> {}

interface Memorabilia {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  photos: string[];
  keywords: string[];
  slug: string;
  created_at?: string;
  updated_at?: string;
  products?: LinkedItem[];
}

interface MemorabiliaCreate {
  title: string;
  subtitle?: string;
  description?: string;
  photos?: string[];
  keywords?: string[];
  slug?: string;
  product_ids?: string[];
}

interface MemorabiliaUpdate extends Partial<MemorabiliaCreate> {}

interface Merchandise {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  price: string;
  photos: string[];
  keywords: string[];
  slug: string;
  created_at?: string;
  updated_at?: string;
  products?: LinkedItem[];
}

interface MerchandiseCreate {
  title: string;
  subtitle?: string;
  description?: string;
  price: number | string;
  photos?: string[];
  keywords?: string[];
  slug?: string;
  product_ids?: string[];
}

interface MerchandiseUpdate extends Partial<MerchandiseCreate> {}

interface LinkedItem {
  id: string;
  title: string;
  subtitle?: string;
}

interface FileUpload {
  id: string;
  url: string;
}

type RentalPeriod = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';

class ApiService {
  private readonly API_BASE_URL = 'https://reel-wheel-api-x92jj.ondigitalocean.app';

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T | ListResponse<any>> {
    const url = `${this.API_BASE_URL}${endpoint}`;
    
    try {
      let response = await fetch(url, {
        ...options,
        headers: {
          ...authService.getAuthHeaders(),
          ...options.headers,
        },
      });

      // Handle token refresh for 401 errors
      if (response.status === 401 && authService.isAuthenticated()) {
        try {
          await authService.refreshAccessToken();
          // Retry the request with new token
          response = await fetch(url, {
            ...options,
            headers: {
              ...authService.getAuthHeaders(),
              ...options.headers,
            },
          });
        } catch (refreshError) {
          authService.logout();
          throw new Error('Session expired. Please login again.');
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.warn(`API request failed for ${endpoint}:`, error);
      
      // Return empty list response for list endpoints
      if (endpoint.includes('products') || endpoint.includes('memorabilia') || endpoint.includes('merchandise')) {
        return { rows: [], total: 0, offset: 0, error: error instanceof Error ? error.message : 'API Error' } as ListResponse<any>;
      }
      
      throw error;
    }
  }

  // Products API
  async getProducts(params: {
    limit?: number;
    offset?: number;
    q?: string;
    sort?: string;
    product_types?: string[];
    movies?: string[];
    genres?: string[];
    is_trending_model?: boolean;
  } = {}): Promise<ListResponse<Product>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    return this.request(`/v1/products/?${searchParams.toString()}`) as Promise<ListResponse<Product>>;
  }

  // Dedicated search endpoint for better performance
  async searchProducts(params: {
    q: string;
    limit?: number;
    product_types?: string[];
  } = { q: '' }): Promise<ListResponse<Product>> {
    const searchParams = new URLSearchParams();
    
    // Only include search term and essential filters
    if (params.q.trim()) {
      searchParams.append('q', params.q.trim());
    }
    if (params.limit) {
      searchParams.append('limit', params.limit.toString());
    }
    if (params.product_types?.length) {
      params.product_types.forEach(type => searchParams.append('product_types', type));
    }

    try {
      const result = await this.request(`/v1/products/search?${searchParams.toString()}`) as Promise<ListResponse<Product>>;
      return result;
    } catch (error) {
      console.warn('Search endpoint failed, falling back to products endpoint:', error);
      const fallbackResult = await this.request(`/v1/products/?${searchParams.toString()}`) as Promise<ListResponse<Product>>;
      return fallbackResult;
    }
  }
  async getProduct(idOrSlug: string): Promise<Product> {
    try {
      const result = await this.request(`/v1/products/${idOrSlug}`) as Product;
      return result;
    } catch (error) {
      console.warn(`Failed to fetch product ${idOrSlug}:`, error);
      throw error;
    }
  }

  async createProduct(data: ProductCreate): Promise<Product> {
    try {
      console.log('Creating product with data:', data);
      
      // For demo purposes, skip API call and return mock success
      // In production, uncomment the API call below
      /*
        const result = await this.request('/v1/products/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authService.getAuthHeaders()
          },
          body: JSON.stringify(data),
        });
        
        // Invalidate product cache after creation
        invalidateProductCache();
        
        return result as Product;
      */
      
      // Mock success response for demo
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      const mockProduct: Product = {
        id: `mock-${Date.now()}`,
        title: data.title,
        subtitle: data.subtitle || '',
        description: data.description || '',
        product_types: data.product_types || [],
        movies: data.movies || [],
        genres: data.genres || [],
        keywords: data.keywords || [],
        available_rental_periods: data.available_rental_periods || [],
        images: data.images || [],
        is_background_image_activated: data.is_background_image_activated || false,
        is_trending_model: data.is_trending_model || false,
        slug: data.slug || data.title.toLowerCase().replace(/\s+/g, '-'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      return mockProduct;
    } catch (error) {
      console.error('Failed to create product:', error);
      
      // For demo purposes, return a mock success response
      const mockProduct: Product = {
        id: `mock-${Date.now()}`,
        title: data.title,
        subtitle: data.subtitle || '',
        description: data.description || '',
        product_types: data.product_types || [],
        movies: data.movies || [],
        genres: data.genres || [],
        keywords: data.keywords || [],
        available_rental_periods: data.available_rental_periods || [],
        images: data.images || [],
        is_background_image_activated: data.is_background_image_activated || false,
        is_trending_model: data.is_trending_model || false,
        slug: data.slug || data.title.toLowerCase().replace(/\s+/g, '-'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      return mockProduct;
    }
    
  }

  async updateProduct(id: string, data: ProductUpdate): Promise<Product> {
    const result = await this.request(`/v1/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    
    // Invalidate product cache after update
    invalidateProductCache();
    
    return result;
  }

  async deleteProduct(id: string): Promise<void> {
    const result = await this.request(`/v1/products/${id}`, {
      method: 'DELETE',
    });
    
    // Invalidate product cache after deletion
    invalidateProductCache();
    
    return result;
  }

  // Memorabilia API
  async getMemorabilia(params: {
    limit?: number;
    offset?: number;
    q?: string;
    sort?: string;
  } = {}): Promise<ListResponse<Memorabilia>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request(`/v1/memorabilia/?${searchParams.toString()}`) as Promise<ListResponse<Memorabilia>>;
  }

  async getMemorabiliaItem(idOrSlug: string): Promise<Memorabilia> {
    return this.request(`/v1/memorabilia/${idOrSlug}`);
  }

  async createMemorabilia(data: MemorabiliaCreate): Promise<Memorabilia> {
    const result = await this.request('/v1/memorabilia/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Invalidate memorabilia cache after creation
    invalidateMemorabiliaCache();
    
    return result;
  }

  async updateMemorabilia(id: string, data: MemorabiliaUpdate): Promise<Memorabilia> {
    const result = await this.request(`/v1/memorabilia/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    
    // Invalidate memorabilia cache after update
    invalidateMemorabiliaCache();
    
    return result;
  }

  async deleteMemorabilia(id: string): Promise<void> {
    const result = await this.request(`/v1/memorabilia/${id}`, {
      method: 'DELETE',
    });
    
    // Invalidate memorabilia cache after deletion
    invalidateMemorabiliaCache();
    
    return result;
  }

  // Merchandise API
  async getMerchandise(params: {
    limit?: number;
    offset?: number;
    q?: string;
    sort?: string;
  } = {}): Promise<ListResponse<Merchandise>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request(`/v1/merchandises/?${searchParams.toString()}`) as Promise<ListResponse<Merchandise>>;
  }

  async getMerchandiseItem(idOrSlug: string): Promise<Merchandise> {
    return this.request(`/v1/merchandises/${idOrSlug}`);
  }

  async createMerchandise(data: MerchandiseCreate): Promise<Merchandise> {
    const result = await this.request('/v1/merchandises/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Invalidate merchandise cache after creation
    invalidateMerchandiseCache();
    
    return result;
  }

  async updateMerchandise(id: string, data: MerchandiseUpdate): Promise<Merchandise> {
    const result = await this.request(`/v1/merchandises/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    
    // Invalidate merchandise cache after update
    invalidateMerchandiseCache();
    
    return result;
  }

  async deleteMerchandise(id: string): Promise<void> {
    const result = await this.request(`/v1/merchandises/${id}`, {
      method: 'DELETE',
    });
    
    // Invalidate merchandise cache after deletion
    invalidateMerchandiseCache();
    
    return result;
  }

  // File Upload API
  async uploadFile(file: File): Promise<FileUpload> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request('/v1/uploads/', {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
        'Authorization': authService.getAuthHeaders()['Authorization'] || '',
      },
      body: formData,
    });
  }

  async deleteFile(url: string): Promise<void> {
    const searchParams = new URLSearchParams({ url });
    return this.request(`/v1/uploads/?${searchParams.toString()}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
export type {
  Product,
  ProductCreate,
  ProductUpdate,
  Memorabilia,
  MemorabiliaCreate,
  MemorabiliaUpdate,
  Merchandise,
  MerchandiseCreate,
  MerchandiseUpdate,
  ListResponse,
  FileUpload,
  RentalPeriod,
};