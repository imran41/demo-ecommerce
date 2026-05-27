'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { productService } from '@/services/productService';
import ProductCard from '@/components/ProductCard';
import QuickViewModal from '@/components/QuickViewModal';
import { ProductCardSkeleton } from '@/components/SkeletonLoader';
import { 
  SlidersHorizontal, LayoutGrid, List, ChevronDown, 
  X, Check, RotateCcw, ChevronLeft, ChevronRight 
} from 'lucide-react';

const ITEMS_PER_PAGE = 6;

function ProductListingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  
  // Layout toggles
  const [layout, setLayout] = useState('grid'); // grid or list
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Active Filter state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [maxPrice, setMaxPrice] = useState(2000);
  const [selectedRating, setSelectedRating] = useState('All');
  const [availability, setAvailability] = useState('All'); // All, in-stock, out-of-stock
  const [sortBy, setSortBy] = useState('newest');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Sync search param on change
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category') || 'All');
  }, [searchParams]);

  // Load initial filter helpers
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const cats = await productService.getCategories();
        const brs = await productService.getBrands();
        setCategories(cats);
        setBrands(brs);
      } catch (err) {
        console.error('Error loading filters:', err);
      }
    };
    loadFilters();
  }, []);

  // Fetch products with active filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const filters = {
          search: search || undefined,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          brand: selectedBrand !== 'All' ? selectedBrand : undefined,
          maxPrice: parseFloat(maxPrice) || undefined,
          rating: selectedRating !== 'All' ? selectedRating : undefined,
          availability: availability !== 'All' ? availability : undefined,
          sortBy
        };
        const results = await productService.getProducts(filters);
        setProducts(results);
        setCurrentPage(1); // Reset page on filter change
      } catch (err) {
        console.error('Error fetching filtered products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, selectedCategory, selectedBrand, maxPrice, selectedRating, availability, sortBy]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedBrand('All');
    setMaxPrice(2000);
    setSelectedRating('All');
    setAvailability('All');
    setSortBy('newest');
    router.push('/products');
  };

  // Pagination calculation
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const indexOfLastProduct = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstProduct = indexOfLastProduct - ITEMS_PER_PAGE;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Browse Premium Catalog</h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">Showing {products.length} refined items</p>
        </div>

        {/* Search Input bar */}
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            placeholder="Filter current view..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-4 pr-10 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:bg-white focus:outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-3 text-slate-400 hover:text-slate-650">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Listing controls */}
      <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="flex lg:hidden items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700"
        >
          <SlidersHorizontal className="h-4 w-4 text-slate-500" />
          Filters
        </button>

        {/* Desktop Sorting */}
        <div className="hidden lg:flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Sort By:</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-9 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="newest">New Arrivals</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <ChevronDown className="absolute right-3 top-3 h-3.5 w-3.5 text-slate-450 pointer-events-none" />
          </div>
        </div>

        {/* Layout toggle */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setLayout('grid')}
            className={`p-2 rounded-xl border transition-colors ${
              layout === 'grid' ? 'bg-white border-slate-200 text-indigo-600 shadow-sm' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <LayoutGrid className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={() => setLayout('list')}
            className={`p-2 rounded-xl border transition-colors ${
              layout === 'list' ? 'bg-white border-slate-200 text-indigo-600 shadow-sm' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <List className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* 3. Main Grid layout: Sidebar + Cards */}
      <div className="flex gap-8 items-start">
        
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block w-64 shrink-0 bg-white border border-slate-100 rounded-3xl p-6 space-y-6 sticky top-20 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-sm font-black text-slate-900 uppercase tracking-tight">Active Filters</span>
            <button
              onClick={handleResetFilters}
              className="text-xxs font-bold text-indigo-650 hover:underline flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>

          {/* Category */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Category</h4>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xxs font-bold transition-all border ${
                    selectedCategory === cat
                      ? 'bg-indigo-650 border-indigo-650 text-white'
                      : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat === 'All' ? 'All Categories' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Brand */}
          <div className="space-y-3 border-t border-slate-50 pt-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Brand</h4>
            <div className="flex flex-wrap gap-1.5">
              {brands.map((br) => (
                <button
                  key={br}
                  onClick={() => setSelectedBrand(br)}
                  className={`px-3 py-1.5 rounded-xl text-xxs font-bold transition-all border ${
                    selectedBrand === br
                      ? 'bg-indigo-650 border-indigo-650 text-white'
                      : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {br === 'All' ? 'All Brands' : br}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3 border-t border-slate-50 pt-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Max Price</h4>
              <span className="text-xs font-black text-indigo-600">${maxPrice}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
            />
          </div>

          {/* Availability */}
          <div className="space-y-3 border-t border-slate-50 pt-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Availability</h4>
            <div className="flex flex-col gap-2">
              {[
                { name: 'All Products', value: 'All' },
                { name: 'In Stock Only', value: 'in-stock' },
                { name: 'Out of Stock', value: 'out-of-stock' }
              ].map((item) => (
                <label key={item.value} className="flex items-center gap-2.5 text-xs font-medium text-slate-600 cursor-pointer">
                  <input
                    type="radio"
                    name="availability"
                    checked={availability === item.value}
                    onChange={() => setAvailability(item.value)}
                    className="accent-indigo-600 h-4 w-4"
                  />
                  <span>{item.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-3 border-t border-slate-50 pt-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Customer Rating</h4>
            <div className="flex flex-col gap-2">
              {['All', '4.5', '4.0', '3.5'].map((r) => (
                <label key={r} className="flex items-center gap-2.5 text-xs font-medium text-slate-600 cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    checked={selectedRating === r}
                    onChange={() => setSelectedRating(r)}
                    className="accent-indigo-600 h-4 w-4"
                  />
                  <span>{r === 'All' ? 'Any Rating' : `${r} ★ & Above`}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Products List Grid */}
        <div className="flex-1 space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
              <SlidersHorizontal className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700">No matching products found</h3>
              <p className="text-xs text-slate-450 mt-1 max-w-xs mx-auto">Try loosening your search keywords or resetting active filter panels.</p>
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              {/* Layout switcher list/grid rendering */}
              {layout === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickView={setQuickViewProduct}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {currentProducts.map((product) => {
                    const price = parseFloat(product.price);
                    const discount = parseFloat(product.discount || 0);
                    const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;

                    return (
                      <div
                        key={product.id}
                        className="flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-slate-100 bg-white hover:shadow-lg transition-all p-4 gap-5 items-center"
                      >
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-32 w-32 object-cover rounded-xl bg-slate-50 shrink-0"
                        />
                        <div className="flex-1 space-y-1.5 text-center sm:text-left">
                          <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-widest">{product.brand}</span>
                          <h3 className="text-sm font-bold text-slate-800">{product.name}</h3>
                          <p className="text-xxs text-slate-400 line-clamp-2 max-w-md">{product.description}</p>
                          <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                            <span className="text-sm font-black text-slate-900">${finalPrice.toFixed(2)}</span>
                            {discount > 0 && (
                              <span className="text-xs font-semibold text-slate-400 line-through">${price.toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
                          <button
                            onClick={() => router.push(`/product/${product.id}`)}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 text-center"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => setQuickViewProduct(product)}
                            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-bold text-center"
                          >
                            Quick View
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 4. Pagination panel */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 border-t border-slate-55 pt-6 mt-8">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4.5 w-4.5" />
                  </button>
                  
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => paginate(idx + 1)}
                      className={`h-9 w-9 rounded-xl text-xs font-black transition-all ${
                        currentPage === idx + 1
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'border border-slate-200 hover:bg-slate-50 text-slate-650'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4.5 w-4.5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Quick View Drawer */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}

export default function ProductListingPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex justify-center py-24">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-650 border-t-transparent rounded-full"></div>
      </div>
    }>
      <ProductListingContent />
    </Suspense>
  );
}
