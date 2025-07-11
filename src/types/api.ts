export interface Product {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  salePrice?: number;
  category: string;
  status: 'active' | 'inactive' | 'pending';
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Memorabilia {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  connectionTags: string[];
  searchKeywords: string[];
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Merchandise {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  salePrice?: number;
  connectionTags: string[];
  searchKeywords: string[];
  fabricMeasurements?: string;
  sizeOptions?: string[];
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}