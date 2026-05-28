'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { productService } from '@/services/productService';
import { cloudinaryService } from '@/services/cloudinaryService';
import { useStore } from '@/context/StoreContext';
import { ArrowLeft, Save, Upload, X, Sparkles, RefreshCcw } from 'lucide-react';

export default function AddProductPage() {
  const router = useRouter();
  const { showToast } = useStore();

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('0');
  const [category, setCategory] = useState('Audio');
  const [brand, setBrand] = useState('');
  const [stock, setStock] = useState('10');
  const [sku, setSku] = useState('');
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState('active'); // active, draft

  // Image Upload States
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  // Generate a random SKU helper
  const handleGenerateSKU = () => {
    const brandCode = (brand || 'GEN').substring(0, 3).toUpperCase().padEnd(3, 'X');
    const catCode = category.substring(0, 3).toUpperCase();
    const rand = Math.floor(100 + Math.random() * 900);
    setSku(`${brandCode}-${catCode}-${rand}`);
  };

  const handleImageSelect = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const urls = await cloudinaryService.uploadMultipleImages(files);
      setImages(prev => [...prev, ...urls]);
      showToast(`${urls.length} images processed successfully.`, 'success');
    } catch (err) {
      showToast('Image upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) return showToast('Name is required.', 'error');
    if (!description.trim()) return showToast('Description is required.', 'error');
    if (!price || parseFloat(price) <= 0) return showToast('Please enter a valid price.', 'error');
    if (!brand.trim()) return showToast('Brand is required.', 'error');
    if (!sku.trim()) return showToast('SKU is required.', 'error');
    if (images.length === 0) return showToast('Please upload at least one image.', 'error');

    setIsSaving(true);
    try {
      const productData = {
        name,
        description,
        price: parseFloat(price),
        discount: parseFloat(discount) || 0,
        category,
        brand,
        stock: parseInt(stock) || 0,
        sku,
        images,
        featured,
        status
      };

      await productService.createProduct(productData);
      showToast('Product created successfully!', 'success');
      router.push('/admin/products');
    } catch (err) {
      showToast(err.message || 'Failed to create product.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back button */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Cancel & Return
        </button>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Add New Product</h1>
        <p className="text-xxs text-slate-400 font-semibold mt-1">Insert a new item listing into the catalog</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Form Details */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-sm text-slate-350">
          <h2 className="text-xs font-black text-white uppercase tracking-wider">Product Specifications</h2>

          {/* Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Keychron Q5 Pro Keyboard"
              className="w-full text-xs h-10 px-3 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail specs, features, material build..."
              rows="6"
              className="w-full text-xs p-3 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            ></textarea>
          </div>

          {/* Pricing grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Price ($ USD)</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="199.99"
                className="w-full text-xs h-10 px-3 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Discount (% Off)</label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="10"
                className="w-full text-xs h-10 px-3 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Brand, Stock, Category grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs h-10 px-3 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none cursor-pointer"
              >
                <option value="Audio">Audio</option>
                <option value="Peripherals">Peripherals</option>
                <option value="Wearables">Wearables</option>
                <option value="Cameras">Cameras</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. AuraSound"
                className="w-full text-xs h-10 px-3 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Initial Stock Units</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="10"
                className="w-full text-xs h-10 px-3 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Right Column: SKU, Image uploads, switches */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* SKU Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm text-slate-350">
            <h3 className="text-xs font-black text-white uppercase tracking-wider">SKU Code</h3>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="AS-MAX-101"
                className="flex-1 text-xs h-10 px-3 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase"
                required
              />
              <button
                type="button"
                onClick={handleGenerateSKU}
                className="px-3 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                <RefreshCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Image Upload Gallery Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm text-slate-350">
            <h3 className="text-xs font-black text-white uppercase tracking-wider">Product Gallery</h3>
            
            {/* Upload Selector */}
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-indigo-500 rounded-2xl p-6 cursor-pointer hover:bg-slate-950/20 transition-all text-center">
              <Upload className="h-6 w-6 text-slate-450 mb-2" />
              <span className="text-[10px] font-bold text-slate-400">SELECT IMAGE FILE(S)</span>
              <span className="text-[8px] text-slate-500 uppercase mt-0.5">Supports PNG, JPG, JPEG</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                disabled={uploading}
              />
            </label>

            {/* Uploading indicator */}
            {uploading && (
              <div className="flex items-center justify-center gap-2 text-xxs font-bold text-indigo-400">
                <svg className="animate-spin h-3.5 w-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Processing media uploads...</span>
              </div>
            )}

            {/* Thumbnail previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 pt-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square border border-slate-800 rounded-xl overflow-hidden group">
                    <img src={img} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-0.5 rounded-md bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Visibility and Featured panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm text-slate-350">
            <h3 className="text-xs font-black text-white uppercase tracking-wider">Visibility & Promotion</h3>

            {/* Status Option */}
            <div className="flex items-center justify-between">
              <label className="text-xxs font-bold text-slate-400 uppercase">Product Status</label>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setStatus('active')}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    status === 'active' ? 'bg-indigo-600 text-white' : 'text-slate-500'
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('draft')}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    status === 'draft' ? 'bg-indigo-600 text-white' : 'text-slate-500'
                  }`}
                >
                  Draft
                </button>
              </div>
            </div>

            {/* Featured toggle */}
            <div className="flex items-center justify-between border-t border-slate-800/50 pt-3">
              <div>
                <label className="text-xxs font-bold text-slate-400 uppercase block">Feature Product</label>
                <span className="text-[8px] text-slate-500 block mt-0.5">Showcase on Home page collections</span>
              </div>
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="accent-indigo-650 h-4.5 w-4.5 cursor-pointer"
              />
            </div>

            {/* Submit save button */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/10 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving Product...
                </>
              ) : (
                <>
                  <Save className="h-4.5 w-4.5" />
                  Save Product
                </>
              )}
            </button>
          </div>

        </div>

      </form>
    </div>
  );
}
