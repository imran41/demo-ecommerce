'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/context/StoreContext';
import { productService } from '@/services/productService';
import { 
  Search, ShoppingCart, Heart, User, LogOut, Menu, X, 
  ChevronDown, LayoutDashboard, History, Settings, Package
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, cart, wishlist, isAdmin } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const router = useRouter();
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  // Calculate quantities
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistItemCount = wishlist.length;

  // Load recent searches
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('recent_searches');
      if (stored) setRecentSearches(JSON.parse(stored));
    }
  }, []);

  // Handle clicking outside dropdowns to close them
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchFocused(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const results = await productService.getProducts({ search: searchQuery });
        setSuggestions(results.slice(0, 5));
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e, queryText) => {
    if (e) e.preventDefault();
    const query = (queryText || searchQuery).trim();
    if (!query) return;

    // Save to recent searches
    const updated = [query, ...recentSearches.filter(q => q !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));

    setSearchQuery(query);
    setSearchFocused(false);
    setMobileMenuOpen(false);
    router.push(`/products?search=${encodeURIComponent(query)}`);
  };

  const clearRecentSearch = (e, query) => {
    e.stopPropagation();
    const updated = recentSearches.filter(q => q !== query);
    setRecentSearches(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
            A
          </span>
          <span className="text-xl font-black bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent tracking-tight">
            Apex<span className="text-indigo-600">Store</span>
          </span>
        </Link>

        {/* Search Bar - Desktop */}
        <div ref={searchRef} className="hidden md:block relative w-full max-w-md mx-8">
          <form onSubmit={(e) => handleSearchSubmit(e)} className="relative">
            <input
              type="text"
              placeholder="Search premium products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          </form>

          {/* Search Dropdown Panel */}
          <AnimatePresence>
            {searchFocused && (searchQuery.trim().length > 0 || recentSearches.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden p-2"
              >
                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className="mb-2">
                    <h4 className="text-xxs uppercase tracking-wider text-slate-400 font-bold px-3 py-1.5">Products</h4>
                    {suggestions.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => {
                          setSearchFocused(false);
                          router.push(`/product/${product.id}`);
                        }}
                        className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <img src={product.images[0]} alt={product.name} className="h-8 w-8 object-cover rounded-lg bg-slate-100" />
                        <div className="truncate">
                          <p className="text-xs font-semibold text-slate-800 truncate">{product.name}</p>
                          <p className="text-xxs text-slate-400 font-medium capitalize">{product.category} • {product.brand}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Recent Searches */}
                {recentSearches.length > 0 && searchQuery.trim().length === 0 && (
                  <div>
                    <h4 className="text-xxs uppercase tracking-wider text-slate-400 font-bold px-3 py-1.5">Recent Searches</h4>
                    {recentSearches.map((query, index) => (
                      <div
                        key={index}
                        onClick={() => handleSearchSubmit(null, query)}
                        className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <History className="h-3.5 w-3.5 text-slate-400" />
                          {query}
                        </span>
                        <button
                          onClick={(e) => clearRecentSearch(e, query)}
                          className="text-slate-400 hover:text-slate-650 p-0.5 hover:bg-slate-200/50 rounded-md"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {suggestions.length === 0 && searchQuery.trim().length >= 2 && (
                  <div className="p-4 text-center text-xs text-slate-400 font-medium">
                    No suggestions found for "{searchQuery}"
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Links and Actions */}
        <nav className="flex items-center gap-4">
          
          {/* Shop Link */}
          <Link href="/products" className="hidden sm:block text-sm font-semibold text-slate-650 hover:text-indigo-650 transition-colors">
            Shop
          </Link>

          {/* Divider */}
          <span className="hidden sm:block h-4 w-px bg-slate-200"></span>

          {/* Wishlist */}
          <Link href="/profile?tab=wishlist" className="relative p-2 text-slate-600 hover:text-rose-500 hover:bg-slate-50 rounded-xl transition-colors">
            <Heart className="h-5 w-5" />
            <AnimatePresence>
              {wishlistItemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute top-0 right-0 h-4 min-w-4 px-1 flex items-center justify-center bg-rose-500 text-[10px] font-black text-white rounded-full border-2 border-white"
                >
                  {wishlistItemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* Cart */}
          <Link href="/cart" className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors">
            <ShoppingCart className="h-5 w-5" />
            <AnimatePresence>
              {cartItemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute top-0 right-0 h-4 min-w-4 px-1 flex items-center justify-center bg-indigo-600 text-[10px] font-black text-white rounded-full border-2 border-white"
                >
                  {cartItemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* User Account / Dropdown */}
          <div ref={userMenuRef} className="relative">
            {user ? (
              <>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100 hover:border-slate-200"
                >
                  <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown panel */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden p-1.5"
                    >
                      <div className="px-3 py-2 border-b border-slate-50 mb-1">
                        <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</p>
                      </div>

                      {isAdmin && (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-650 rounded-xl transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4 text-indigo-500" />
                          Admin Panel
                        </Link>
                      )}

                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <User className="h-4 w-4 text-slate-400" />
                        My Profile
                      </Link>

                      <Link
                        href="/profile?tab=orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <Package className="h-4 w-4 text-slate-400" />
                        My Orders
                      </Link>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                          router.push('/login');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                      >
                        <LogOut className="h-4 w-4 text-rose-500" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-md shadow-indigo-100"
              >
                <User className="h-3.5 w-3.5" />
                <span>Log In</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-650 hover:bg-slate-50 rounded-xl transition-colors"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-100 bg-white overflow-hidden"
          >
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={(e) => handleSearchSubmit(e)} className="relative">
                <input
                  type="text"
                  placeholder="Search premium products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:outline-none"
                />
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              </form>

              <div className="flex flex-col gap-2">
                <Link
                  href="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Shop All Products
                </Link>
                
                {user ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/profile?tab=orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-3 py-2.5 text-sm font-bold text-indigo-650 hover:bg-indigo-50 rounded-xl transition-colors"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                        router.push('/login');
                      }}
                      className="w-full px-3 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 px-3 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-750 rounded-xl transition-colors shadow-md"
                  >
                    <User className="h-4 w-4" />
                    Log In / Sign Up
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
