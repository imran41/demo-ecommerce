'use client';

import React, { useEffect, useState } from 'react';
import { productService } from '@/services/productService';
import { useStore } from '@/context/StoreContext';
import { FolderHeart, Plus, Trash2 } from 'lucide-react';

export default function AdminCategoriesPage() {
  const { showToast } = useStore();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState('');

  const loadCategories = async () => {
    setLoading(true);
    try {
      const all = await productService.getCategories();
      // Filter out 'All'
      setCategories(all.filter(c => c !== 'All'));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    
    const formatted = newCategory.trim();
    if (categories.includes(formatted)) {
      showToast('Category already exists.', 'error');
      return;
    }

    const updated = [...categories, formatted];
    setCategories(updated);
    setNewCategory('');
    showToast('New category added to catalog.', 'success');
  };

  const handleDeleteCategory = (cat) => {
    if (!window.confirm(`Are you sure you want to delete category "${cat}"?`)) return;
    const updated = categories.filter(c => c !== cat);
    setCategories(updated);
    showToast(`Category "${cat}" deleted.`, 'info');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Category Manager</h1>
        <p className="text-xxs text-slate-400 font-semibold mt-1">Configure active product categories in your catalog</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Column: Form */}
        <form onSubmit={handleAddCategory} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm text-slate-350">
          <h3 className="text-xs font-black text-white uppercase tracking-wider">Add New Category</h3>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category Name</label>
            <input
              type="text"
              placeholder="e.g. Smart Home Devices"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full text-xs h-10 px-3 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Save Category
          </button>
        </form>

        {/* Right Column: Listing */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="text-xs font-black text-white uppercase tracking-wider">Active Categories ({categories.length})</h3>

          {loading ? (
            <div className="text-center py-6">
              <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : categories.length === 0 ? (
            <p className="text-xs text-slate-500">No categories found.</p>
          ) : (
            <div className="divide-y divide-slate-800">
              {categories.map((cat) => (
                <div key={cat} className="flex justify-between items-center py-3">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <FolderHeart className="h-4 w-4 text-indigo-400" />
                    {cat}
                  </span>
                  
                  <button
                    onClick={() => handleDeleteCategory(cat)}
                    className="p-1 rounded bg-slate-855 bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
