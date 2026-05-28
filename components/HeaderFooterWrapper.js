'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function HeaderFooterWrapper({ children }) {
  const pathname = usePathname();
  
  const isAdminRoute = pathname?.startsWith('/admin');
  const isAuthRoute = 
    pathname === '/login' || 
    pathname === '/signup' || 
    pathname === '/forgot-password';

  if (isAdminRoute || isAuthRoute) {
    return <div className="flex flex-col min-h-screen">{children}</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-white">{children}</main>
      <Footer />
    </div>
  );
}
