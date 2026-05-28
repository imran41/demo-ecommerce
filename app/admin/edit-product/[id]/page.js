'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { productService } from '@/services/productService';
import { cloudinaryService } from '@/services/cloudinaryService';
import { useStore } from '@/context/StoreContext';
import { ArrowLeft, Save, Upload, X, RefreshCcw } from 'lucide-react';

export default function EditProductPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { id } = params;

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
  const [status, setStatus] = useState('active');

  // Image Upload States
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [loadingProduct, setLoadingProduct] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch product details
  useEffect(() => {
    const loadProduct = async () => {
      setLoadingProduct(true);
      try {
        const prod = await productService.getProductById(id);
        setName(prod.name);
        setDescription(prod.description);
        setPrice(String(prod.price));
        setDiscount(String(prod.discount || 0));
        setCategory(prod.category);
        setBrand(prod.brand);
        setStock(String(prod.stock));
        setSku(prod.sku);
        setImages(prod.images);
        setFeatured(prod.featured || false);
        setStatus(prod.status || 'active');
      } catch (err) {
        console.error('Error fetching product:', err);
        showToast('Error loading product details.', 'error');
        router.push('/admin/products');
      } finally {
        setLoadingProduct(false);
      }
    };

    loadProduct();
  }, [id]);

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
      showToast(`${urls.length} images uploaded.`, 'success');
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

      await productService.updateProduct(id, productData);
      showToast('Product updated successfully!', 'success');
      router.push('/admin/products');
    } catch (err) {
      showToast(err.message || 'Failed to update product.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="flex justify-center items-center py-40">
        <div className="animate-spin h-7 w-7 border-3 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

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
        <h1 className="text-xl font-bold text-white tracking-tight">Edit Product</h1>
        <p className="text-xxs text-slate-400 font-semibold mt-1">Modify details for listing: "{name}"</p>
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
                className="w-full text-xs h-10 px-3 rounded-xl border border-slate-800 bg-slate-955 bg-slate-950 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Discount (% Off)</label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full text-xs h-10 px-3 rounded-xl border border-slate-800 bg-slate-955 bg-slate-950 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                className="w-full text-xs h-10 px-3 rounded-xl border border-slate-800 bg-slate-955 bg-slate-950 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stock Units</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full text-xs h-10 px-3 rounded-xl border border-slate-800 bg-slate-955 bg-slate-950 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
            
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-indigo-505 rounded-2xl p-6 cursor-pointer hover:bg-slate-955/20 transition-all text-center">
              <Upload className="h-6 w-6 text-slate-450 mb-2" />
              <span className="text-[10px] font-bold text-slate-400">UPLOAD ADDITIONAL MEDIA</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                disabled={uploading}
              />
            </label>

            {uploading && (
              <div className="flex items-center justify-center gap-2 text-xxs font-bold text-indigo-400 animate-pulse">
                <span>Processing media uploads...</span>
              </div>
            )}

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

            <div className="flex items-center justify-between border-t border-slate-800/50 pt-3">
              <div>
                <label className="text-xxs font-bold text-slate-400 uppercase block">Feature Product</label>
              </div>
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="accent-indigo-650 h-4.5 w-4.5 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/10 disabled:opacity-50"
            >
              {isSaving ? 'Updating Product...' : 'Commit Changes'}
            </button>
          </div>

        </div>

      </form>
    </div>
  );
}
