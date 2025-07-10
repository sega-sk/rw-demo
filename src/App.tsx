/**
 * Reel Wheels Experience - Main App Component
 * Developed by SeGa_cc for DealerTower
 * 
 * Features:
 * - Movie vehicle rental platform
 * - Admin dashboard for inventory management
 * - Responsive design with optimized images
 * - Advanced caching and performance optimization
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoginPage from './components/Auth/LoginPage';
import Layout from './components/Layout/Layout'; 
import Dashboard from './pages/Dashboard';
import AddProduct from './pages/Products/AddProduct';
import ProductList from './pages/Products/ProductList';
import MemorabiliaList from './pages/Memorabilia/MemorabiliaList';
import MerchandiseList from './pages/Merchandise/MerchandiseList';
import ProfilePage from './pages/Profile/ProfilePage';

// Main website components
import Homepage from './pages/Website/Homepage';
import CatalogPage from './pages/Website/CatalogPage';
import ProductDetailPage from './pages/Website/ProductDetailPage';
import MemorabiliaPage from './pages/Website/MemorabiliaPage';
import MerchandisePage from './pages/Website/MerchandisePage';
import FavoritesPage from './pages/Website/FavoritesPage';
import AboutPage from './pages/Website/AboutPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <Router>
          <Routes>
            {/* Main Website Routes */}
            <Route path="/" element={<Homepage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/catalog/:productType" element={<CatalogPage />} />
            <Route path="/catalog/:productType/:slug" element={<ProductDetailPage />} />
            <Route path="/product/:productType/:slug" element={<ProductDetailPage />} />
            <Route path="/memorabilia" element={<MemorabiliaPage />} />
            <Route path="/memorabilia/:productType/:slug" element={<MemorabiliaPage />} />
            <Route path="/merchandise" element={<MerchandisePage />} />
            <Route path="/merchandise/:productType/:slug" element={<MerchandisePage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/about" element={<AboutPage />} />
            
            {/* Admin Login Route - Public Access */}
            <Route path="/admin" element={<LoginPage />} />
            <Route path="/admin/login" element={<LoginPage />} />

            {/* Protected Admin Dashboard Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute>
                <Layout title="Dashboard"><Dashboard /></Layout>
              </ProtectedRoute> 
            } />
            
            <Route path="/admin/products" element={
              <ProtectedRoute>
                <Layout title="Add Product" breadcrumb={['Dashboard', 'Add Product']}>
                  <div className="w-full">
                    <AddProduct />
                  </div>
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/product-list" element={
              <ProtectedRoute>
                <Layout title="Products List" breadcrumb={['Dashboard', 'Product list']}><ProductList /></Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/memorabilia" element={
              <ProtectedRoute>
                <Layout title="Memorabilia List" breadcrumb={['Dashboard', 'Memorabilia']}><MemorabiliaList /></Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/merchandise" element={
              <ProtectedRoute>
                <Layout title="Merchandise" breadcrumb={['Dashboard', 'Merchandise']}><MerchandiseList /></Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/profile" element={
              <ProtectedRoute>
                <Layout title="Profile Settings" breadcrumb={['Dashboard', 'Profile']}><ProfilePage /></Layout>
              </ProtectedRoute>
            } />
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;