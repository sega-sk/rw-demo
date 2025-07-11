import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Sidebar from './Sidebar';
import Header from './Header';
import { Menu } from 'lucide-react';

interface LayoutProps {
  title: string;
  breadcrumb?: string[];
  children: React.ReactNode;
}

export default function Layout({ title, breadcrumb, children }: LayoutProps) {
  console.log('Layout component rendered with title:', title);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Developer Attribution - SeGa_cc */}
      <Helmet>
        <title>{title} - Reel Wheels Experience Admin</title>
        <meta name="description" content={`${title} page for Reel Wheels Experience admin dashboard`} />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={`https://reelwheelsexperience.com/admin${window.location.pathname.replace('/admin', '')}`} />
      </Helmet>
      
      <div className="flex h-screen bg-gray-50">
        {/* Mobile sidebar toggle */}
        <div className="md:hidden fixed top-4 left-4 z-50">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md bg-white shadow-md text-gray-600 hover:text-gray-900"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
        
        {/* Sidebar */}
        <div className={`fixed md:static inset-y-0 left-0 z-40 transition-transform duration-300 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          <Sidebar className="admin-sidebar h-full" onClose={() => setSidebarOpen(false)} />
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header className="admin-header" title={title} breadcrumb={breadcrumb || []} />
          <main className="admin-main-content flex-1 overflow-auto w-full">
            {children}
        </main>
        {/* Enhanced Footer with DealerTower link - Updated by SeGa */}
        <footer className="admin-footer bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              © 2025 Reel Wheels Experience. All rights reserved.
            </div>
            <div>
              Made by{' '}
              <a 
                href="https://dealertower.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                DealerTower
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
    </>
  );
}