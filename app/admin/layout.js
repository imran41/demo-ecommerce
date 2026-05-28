'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import Link from 'next/link';
import { 
  LayoutDashboard, ShoppingBag, PlusCircle, ShoppingCart, 
  Users, FolderHeart, BadgePercent, Star, LogOut, ShieldAlert,
  ChevronRight, Menu, X
} from 'lucide-react';

const ADMIN_LINKS = [
  { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Manage Products', icon: ShoppingBag },
  { href: '/admin/add-product', label: 'Add Product', icon: PlusCircle },
  { href: '/admin/orders', label: 'Manage Orders', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customer Directory', icon: Users },
  { href: '/admin/categories', label: 'Categories', icon: FolderHeart },
  { href: '/admin/coupons', label: 'Promo Coupons', icon: BadgePercent },
  { href: '/admin/reviews', label: 'Review Moderation', icon: Star }
];

export default function AdminLayout({ children }) {
  const { user, authLoading, isAdmin } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Protection Check
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      // We will render an Access Denied view below, instead of auto redirecting, for better UX
    }
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-900 text-white">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Access Denied View
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-8 text-center space-y-6 text-white backdrop-blur-md shadow-2xl">
          <ShieldAlert className="h-16 w-16 text-rose-500 mx-auto" />
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold tracking-tight">Administrative Access Denied</h2>
            <p className="text-xxs text-slate-400 font-medium">This route is protected. Only developers and administrators can access the Apex Store dashboard.</p>
          </div>
          <div className="flex gap-3 pt-2">
            <Link
              href="/login?redirect=/admin/dashboard"
              className="flex-1 h-10 bg-indigo-650 hover:bg-indigo-750 text-white font-bold text-xs rounded-xl flex items-center justify-center transition-colors"
            >
              Log In as Admin
            </Link>
            <Link
              href="/"
              className="flex-1 h-10 border border-white/10 hover:bg-white/5 text-white font-bold text-xs rounded-xl flex items-center justify-center transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans">
      
      {/* 1. Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 shrink-0">
        {/* Brand header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-2">
          <span className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow">A</span>
          <span className="text-sm font-black tracking-tight text-white">Apex <span className="text-indigo-400">Admin</span></span>
        </div>

        {/* Links list */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {ADMIN_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-indigo-605 bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-rose-455 hover:bg-rose-950/20 hover:text-rose-400 transition-all"
          >
            <LogOut className="h-4.5 w-4.5" />
            Exit Dashboard
          </Link>
        </div>
      </aside>

      {/* 2. Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header toolbar */}
        <header className="h-16 bg-slate-900 border-b border-slate-805 flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile Sidebar toggle */}
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 text-slate-400 hover:bg-slate-800 rounded-xl"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:inline-block">Management Portal</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xxs font-bold text-slate-400">Admin Session:</span>
            <span className="text-xxs font-black bg-indigo-650/30 text-indigo-300 border border-indigo-505/30 px-2.5 py-1 rounded-lg">
              {user.name}
            </span>
          </div>
        </header>

        {/* Page children container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-950">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar overlay drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div onClick={() => setMobileSidebarOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

          {/* Drawer content */}
          <div className="relative w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full z-10">
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-805">
              <span className="text-sm font-black text-white">Apex Admin</span>
              <button onClick={() => setMobileSidebarOpen(false)} className="p-1 rounded bg-slate-800 text-slate-400">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {ADMIN_LINKS.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
