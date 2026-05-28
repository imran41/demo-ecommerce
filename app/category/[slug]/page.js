'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { productService } from '@/services/productService';
import ProductCard from '@/components/ProductCard';
import QuickViewModal from '@/components/QuickViewModal';
import { ProductCardSkeleton } from '@/components/SkeletonLoader';
import { ArrowLeft } from 'lucide-react';

export default function CategorySlugPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { slug } = params;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true);
      try {
        const decodedSlug = decodeURIComponent(slug);
        const results = await productService.getProducts({ category: decodedSlug });
        setProducts(results);
      } catch (err) {
        console.error('Error fetching category products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [slug]);

  const decodedCategoryName = decodeURIComponent(slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Shop Catalog
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-slate-100 pb-5">
        <span className="text-xxs font-black text-indigo-600 uppercase tracking-widest">Category Collection</span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1 capitalize">{decodedCategoryName} Gear</h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">Showing {products.length} products listed under "{decodedCategoryName}"</p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
          <h3 className="text-sm font-bold text-slate-700">No products found in this category</h3>
          <p className="text-xs text-slate-400 mt-1">Please explore our other tech gear or view our full catalog.</p>
          <Link
            href="/products"
            className="mt-4 inline-block px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-750 rounded-xl transition-colors"
          >
            Browse All Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={setQuickViewProduct}
            />
          ))}
        </div>
      )}

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
