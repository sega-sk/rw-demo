import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import { apiService } from '../../services/api';
import { useApi, useMutation } from '../../hooks/useApi';
import OptimizedImage from '../../components/UI/OptimizedImage';
import { formatPrice } from '../../utils/priceUtils';

// Status color mapping
const statusColors = {
  Active: 'success',
  Inactive: 'error',
  Pending: 'warning',
  Disabled: 'error',
  Enabled: 'success',
} as const;

export default function ProductList() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllItems, setShowAllItems] = useState(false);
  const itemsPerPage = 5;

  // Fetch products from API
  const { data: productsData, loading, execute: refetchProducts } = useApi(
    () => apiService.getProducts({
      q: searchTerm,
      limit: showAllItems ? 100 : itemsPerPage * 10, // Get more items for pagination
      sort: sortBy === 'name' ? 'title' : sortBy === 'date' ? '-created_at' : sortBy,
    }),
    { 
      immediate: true,
      cacheKey: `product-list-${searchTerm}-${sortBy}`,
      cacheTTL: 2 * 60 * 1000, // 2 minutes for admin data
      staleWhileRevalidate: true
    }
  );

  // Delete product mutation
  const { mutate: deleteProduct, loading: deleting } = useMutation(
    (id: string) => apiService.deleteProduct(id)
  );

  // Transform API data to match component expectations
  const allProducts = productsData?.rows?.map(product => ({
    id: product.id,
    name: product.title,
    subtitle: product.subtitle || '',
    category: product.product_types.join(', ') || 'Product',
    status: 'Active', // You can add status field to API or determine based on other fields
    added: product.created_at ? new Date(product.created_at).toLocaleDateString() : 'N/A',
    image: product.images[0] || 'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    price: product.retail_price || product.sale_price || '0',
    slug: product.slug,
    product_types: product.product_types
  })) || [];

  // Enhanced filtering functionality
  const filteredProducts = allProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Enhanced pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = showAllItems ? filteredProducts : filteredProducts.slice(startIndex, endIndex);

  // Search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      refetchProducts();
      setCurrentPage(1); // Reset to first page when search changes
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, sortBy]);

  // Navigation handlers
  const handleAddProduct = () => {
    navigate('/admin/products');
    console.log('Navigating to add product page, isAuthenticated:', isAuthenticated);
  };

  const handleEditProduct = (product: any) => {
    console.log('Edit product:', product.id);
    navigate(`/admin/products?edit=${product.id}`);
  };

  const handleDeleteProduct = async (product: any) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      try {
        await deleteProduct(product.id);
        refetchProducts(); // Refresh the list after deletion
      } catch (error) {
        console.error('Failed to delete product:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  const handleViewProduct = (product: any) => {
    const type = product.product_types[0] || 'vehicle';
    navigate(`/catalog/${type}/${product.slug}`);
  };

  const handleViewAllItems = () => {
    setShowAllItems(!showAllItems);
  };

  // Enhanced pagination handlers
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // Generate page numbers for pagination
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
    <div className="p-6">
      {/* Page Title matching breadcrumb */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product list</h1>
        
        <div className="flex items-center justify-between mb-4">
          {/* Enhanced button with hover effects */}
          <Button icon={Plus} onClick={handleAddProduct} className="btn-hover">
            Add Product
          </Button>
          
          {/* Stats */}
          <div className="text-sm text-gray-600">
            {loading ? 'Loading...' : `${filteredProducts.length} products total`}
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search here..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="name">Sort by Name</option>
            <option value="category">Sort by Category</option>
            <option value="date">Sort by Date</option>
            <option value="price">Sort by Price</option>
          </select>

          <Button variant="outline" icon={Filter}>
            Filter
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Enhanced Products Table */}
      {!loading && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Added
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentProducts.map((product) => (
                <tr key={product.id} className="table-row-hover">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <OptimizedImage 
                          src={product.image} 
                          alt={product.name}
                          size="thumbnail"
                          className="h-12 w-12 rounded-lg object-cover" 
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.subtitle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatPrice(product.price)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={statusColors[product.status as keyof typeof statusColors]}>
                      {product.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.added}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {/* Enhanced action buttons */}
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewProduct(product)}
                        className="btn-hover text-blue-600 hover:text-blue-800"
                      >
                        View
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        icon={Edit}
                        onClick={() => handleEditProduct(product)}
                        className="btn-hover"
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        icon={Trash2}
                        onClick={() => handleDeleteProduct(product)}
                        className="btn-hover text-red-600 hover:text-red-800"
                        loading={deleting}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* No Results State */}
          {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found.</p>
              <Button 
                onClick={handleAddProduct} 
                className="mt-4"
                icon={Plus}
              >
                Add Your First Product
              </Button>
            </div>
          )}

          {/* Enhanced Pagination */}
          {!showAllItems && filteredProducts.length > 0 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button 
                  variant="outline" 
                  onClick={handlePreviousPage} 
                  disabled={currentPage === 1}
                  className="btn-hover"
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleNextPage} 
                  disabled={currentPage === totalPages}
                  className="btn-hover"
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(endIndex, filteredProducts.length)}</span> of{' '}
                    <span className="font-medium">{filteredProducts.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className="btn-hover"
                    >
                      Previous
                    </Button>
                    {getPageNumbers().map((page) => (
                      <Button 
                        key={page}
                        variant={currentPage === page ? "primary" : "outline"}
                        size="sm" 
                        onClick={() => handlePageClick(page)}
                        className="btn-hover"
                      >
                        {page}
                      </Button>
                    ))}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="btn-hover"
                    >
                      Next
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced View All Items */}
          {filteredProducts.length > itemsPerPage && (
            <div className="bg-gray-50 px-6 py-4 text-center">
              <Button 
                variant="outline" 
                onClick={handleViewAllItems}
                className="btn-hover"
              >
                {showAllItems ? 'Show Paginated View' : 'View All Items'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}