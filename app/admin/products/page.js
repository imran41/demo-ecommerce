'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { productService } from '@/services/productService';
import { useStore } from '@/context/StoreContext';
import { PlusCircle, Edit2, Trash2, ShieldAlert, Sparkles, Filter } from 'lucide-react';

export default function AdminProductsPage() {
  const { showToast } = useStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [categories, setCategories] = useState([]);

  // Fetch all products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const list = await productService.getProducts({ status: 'All' });
      setProducts(list);
      
      const cats = await productService.getCategories();
      setCategories(cats);
    } catch (err) {
      console.error('Error loading products:', err);
      showToast('Error loading products list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete product "${name}"?`)) return;

    try {
      await productService.deleteProduct(id);
      showToast(`Product "${name}" deleted.`, 'info');
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      showToast('Failed to delete product.', 'error');
    }
  };

  const handleToggleStatus = async (product) => {
    const nextStatus = product.status === 'active' ? 'draft' : 'active';
    try {
      await productService.updateProduct(product.id, {
        ...product,
        status: nextStatus
      });
      showToast(`Product status changed to "${nextStatus}".`, 'success');
      // Update local state
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: nextStatus } : p));
    } catch (err) {
      showToast('Failed to update status.', 'error');
    }
  };

  const handleToggleFeatured = async (product) => {
    const nextFeatured = !product.featured;
    try {
      await productService.updateProduct(product.id, {
        ...product,
        featured: nextFeatured
      });
      showToast(nextFeatured ? 'Product added to featured list.' : 'Product removed from featured list.', 'success');
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, featured: nextFeatured } : p));
    } catch (err) {
      showToast('Failed to update featured status.', 'error');
    }
  };

  // Filter products locally by category
  const filteredProducts = categoryFilter === 'All' 
    ? products 
    : products.filter(p => p.category.toLowerCase() === categoryFilter.toLowerCase());

  return (
    <div className="space-y-6">
      
      {/* Header tool bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Catalog Management</h1>
          <p className="text-xxs text-slate-400 font-semibold mt-1">Manage stock counts, draft listings and feature highlights</p>
        </div>

        <Link
          href="/admin/add-product"
          className="h-10 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/10 self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" /> Add New Product
        </Link>
      </div>

      {/* Category selector filter */}
      <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-4 rounded-3xl">
        <Filter className="h-4 w-4 text-slate-450 shrink-0" />
        <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider shrink-0">Filter Catalog:</span>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xxs font-bold transition-all ${
                categoryFilter === cat 
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-850 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products table */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin h-7 w-7 border-3 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl text-slate-500 text-xs">
          No products found matching category filter.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-950/40 text-[10px] font-black uppercase tracking-wider text-slate-450 border-b border-slate-805">
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Featured</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-805">
                {filteredProducts.map((product) => {
                  const isLowStock = product.stock > 0 && product.stock <= 5;
                  const isOutOfStock = product.stock === 0;

                  return (
                    <tr key={product.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Image */}
                      <td className="px-6 py-3.5 shrink-0">
                        <img
                          src={product.images[0]}
                          alt=""
                          className="h-10 w-10 object-cover rounded-lg bg-slate-800 border border-slate-800"
                        />
                      </td>

                      {/* Title & Brand */}
                      <td className="px-6 py-3.5 max-w-[200px]">
                        <h4 className="font-bold text-white truncate">{product.name}</h4>
                        <span className="text-[10px] text-indigo-400 font-bold uppercase mt-0.5 block">{product.brand}</span>
                      </td>

                      {/* SKU */}
                      <td className="px-6 py-3.5 font-semibold text-slate-450 uppercase">{product.sku}</td>

                      {/* Price */}
                      <td className="px-6 py-3.5 font-bold text-white">
                        ${(product.price * (1 - (product.discount || 0) / 100)).toFixed(2)}
                        {product.discount > 0 && (
                          <span className="text-[10px] text-slate-450 font-medium block line-through">${product.price.toFixed(2)}</span>
                        )}
                      </td>

                      {/* Stock indicator badge */}
                      <td className="px-6 py-3.5">
                        {isOutOfStock ? (
                          <span className="text-[9px] font-bold text-rose-400 bg-rose-950/30 border border-rose-900/50 px-2 py-0.5 rounded-md flex items-center gap-1 w-max">
                            <ShieldAlert className="h-3 w-3" /> Out of stock
                          </span>
                        ) : isLowStock ? (
                          <span className="text-[9px] font-bold text-amber-400 bg-amber-950/30 border border-amber-900/50 px-2 py-0.5 rounded-md flex items-center gap-1 w-max animate-pulse">
                            Only {product.stock} left
                          </span>
                        ) : (
                          <span className="font-bold text-slate-100">{product.stock} Units</span>
                        )}
                      </td>

                      {/* Status toggle */}
                      <td className="px-6 py-3.5">
                        <button
                          onClick={() => handleToggleStatus(product)}
                          className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border transition-all ${
                            product.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/25 hover:bg-emerald-950/50'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          {product.status}
                        </button>
                      </td>

                      {/* Featured status toggle */}
                      <td className="px-6 py-3.5 text-center">
                        <button
                          onClick={() => handleToggleFeatured(product)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            product.featured 
                              ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30'
                              : 'border-slate-800 text-slate-600 hover:text-slate-400'
                          }`}
                        >
                          <Sparkles className="h-4 w-4" />
                        </button>
                      </td>

                      {/* Action buttons */}
                      <td className="px-6 py-3.5 text-right space-x-2 shrink-0">
                        <Link
                          href={`/admin/edit-product/${product.id}`}
                          className="inline-flex p-2 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Link>
                        
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
