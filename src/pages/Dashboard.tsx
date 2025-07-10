import React, { useEffect, useState } from 'react';
import { Package, Star, ShoppingBag, TrendingUp, Users, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { useApi } from '../hooks/useApi';
import { dummyProducts } from '../data/dummyData';
import OptimizedImage from '../components/UI/OptimizedImage';
import { formatPrice } from '../utils/priceUtils';

export default function Dashboard() {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalMemorabilia: 0,
    totalMerchandise: 0,
    totalValue: 0,
  });

  const [recentProducts, setRecentProducts] = useState<any[]>([]);

  // Fetch dashboard data
  const { data: productsData, loading: productsLoading } = useApi(
    () => isAuthenticated ? apiService.getProducts({ limit: 5, sort: '-created_at' }) : Promise.resolve({ rows: [], total: 0, offset: 0 }),
    { 
      immediate: isAuthenticated,
      cacheKey: 'dashboard-products',
      cacheTTL: 2 * 60 * 1000, // 2 minutes for dashboard
      staleWhileRevalidate: true
    }
  );

  const { data: memorabiliaData, loading: memorabiliaLoading } = useApi(
    () => apiService.getMemorabilia({ limit: 5 }),
    { 
      immediate: true,
      cacheKey: 'dashboard-memorabilia',
      cacheTTL: 2 * 60 * 1000,
      staleWhileRevalidate: true
    }
  );

  const { data: merchandiseData, loading: merchandiseLoading } = useApi(
    () => apiService.getMerchandise({ limit: 5 }),
    { 
      immediate: true,
      cacheKey: 'dashboard-merchandise',
      cacheTTL: 2 * 60 * 1000,
      staleWhileRevalidate: true
    }
  );

  useEffect(() => {
    // Use API data if available, otherwise use dummy data
    const products = productsData?.rows?.length > 0 ? productsData.rows : dummyProducts;
    const memorabilia = memorabiliaData?.rows?.length > 0 ? memorabiliaData.rows : [];
    const merchandise = merchandiseData?.rows?.length > 0 ? merchandiseData.rows : [];
    
    if (products || memorabilia || merchandise) {
      // Calculate total value from products
      const totalValue = products.reduce((sum, product) => {
        const price = parseFloat(product.retail_price || product.sale_price || 0);
        return sum + price;
      }, 0);

      setStats({
        totalProducts: productsData?.total || products.length,
        totalMemorabilia: memorabiliaData?.total || memorabilia.length,
        totalMerchandise: merchandiseData?.total || merchandise.length,
        totalValue,
      });

      // Set recent products with proper image handling
      setRecentProducts(
        products.slice(0, 5).map((product, index) => ({
          id: product.id,
          name: product.title,
          subtitle: product.subtitle || '',
          category: product.product_types.join(', ') || 'Product',
          status: 'Active',
          price: formatPrice(parseFloat(product.retail_price || product.sale_price || 0)),
          image: product.images[0] || 'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
          slug: product.slug,
          product_types: product.product_types
        }))
      );
    }
  }, [productsData, memorabiliaData, merchandiseData]);

  const handleViewProduct = (product: any) => {
    const type = product.product_types[0] || 'vehicle';
    window.open(`/catalog/${type}/${product.slug}`, '_blank');
  };


  const dashboardStats = [
    { 
      name: 'Total Products', 
      value: stats.totalProducts.toString(), 
      change: '+4.75%', 
      changeType: 'positive', 
      icon: Package 
    },
    { 
      name: 'Total Memorabilia', 
      value: stats.totalMemorabilia.toString(), 
      change: '+54.02%', 
      changeType: 'positive', 
      icon: Star 
    },
    { 
      name: 'Total Merchandise', 
      value: stats.totalMerchandise.toString(), 
      change: '-1.39%', 
      changeType: 'negative', 
      icon: ShoppingBag 
    },
    { 
      name: 'Total Value', 
      value: formatPrice(stats.totalValue), 
      change: '+12.5%', 
      changeType: 'positive', 
      icon: DollarSign 
    },
  ];

  const isLoading = productsLoading || memorabiliaLoading || merchandiseLoading;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-6 w-6 bg-gray-300 rounded"></div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((item) => (
          <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg card-hover">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <item.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{item.value}</div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        item.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Products */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Products</h3>
        </div>
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentProducts.map((product) => (
                <tr key={product.id} className="table-row-hover">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <OptimizedImage 
                          src={product.image} 
                          alt={product.name}
                          size="thumbnail"
                          className="h-10 w-10 rounded-lg object-cover" 
                        />
                      </div>
                      <div className="ml-4">
                        <div 
                          className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => handleViewProduct(product)}
                        >
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">{product.subtitle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}