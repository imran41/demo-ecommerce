'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/context/StoreContext';
import { X, ShoppingCart, Heart, Minus, Plus, Check, Star } from 'lucide-react';

export default function QuickViewModal({ product, onClose }) {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const [selectedImage, setSelectedImage] = useState(product ? product.images[0] : '');
  const [qty, setQty] = useState(1);

  if (!product) return null;

  const isFav = isInWishlist(product.id);
  const price = parseFloat(product.price);
  const discount = parseFloat(product.discount || 0);
  const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;

  const handleQtyChange = (val) => {
    const newVal = qty + val;
    if (newVal >= 1 && newVal <= product.stock) {
      setQty(newVal);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, qty);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 flex flex-col md:flex-row z-10 max-h-[90vh] md:max-h-none"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-slate-150 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Left: Images */}
          <div className="md:w-1/2 p-6 flex flex-col justify-center bg-slate-50/50">
            <div className="aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center">
              <img
                src={selectedImage}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            
            {/* Gallery Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2.5 mt-4 justify-center">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(img)}
                    className={`h-14 w-14 rounded-xl overflow-hidden border-2 bg-white ${
                      selectedImage === img ? 'border-indigo-650' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto max-h-[50vh] md:max-h-[80vh]">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">
              {product.brand}
            </span>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mb-2">
              {product.name}
            </h2>

            {/* Ratings */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-slate-700">{(product.rating || 4.5).toFixed(1)}</span>
              </div>
              <span className="text-xs text-slate-350">•</span>
              <span className="text-xs font-semibold text-slate-500">Verified Buyer Reviews</span>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-500 leading-relaxed mb-5">
              {product.description}
            </p>

            {/* Price tag */}
            <div className="flex items-baseline gap-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
              <span className="text-2xl font-black text-slate-900">${finalPrice.toFixed(2)}</span>
              {discount > 0 && (
                <span className="text-sm font-semibold text-slate-400 line-through">${price.toFixed(2)}</span>
              )}
            </div>

            {/* Availability */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs font-bold text-slate-500">Availability:</span>
              {product.stock > 0 ? (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  In Stock ({product.stock} units available)
                </span>
              ) : (
                <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                  Out of Stock
                </span>
              )}
            </div>

            {product.stock > 0 && (
              <div className="mt-auto space-y-4">
                {/* Quantity and Wishlist */}
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-500">Quantity:</span>
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden h-10">
                    <button
                      onClick={() => handleQtyChange(-1)}
                      className="p-2.5 text-slate-500 hover:bg-slate-50"
                      disabled={qty <= 1}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-4 text-xs font-bold text-slate-800">{qty}</span>
                    <button
                      onClick={() => handleQtyChange(1)}
                      className="p-2.5 text-slate-500 hover:bg-slate-50"
                      disabled={qty >= product.stock}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`h-10 w-10 flex items-center justify-center rounded-xl border ${
                      isFav 
                        ? 'bg-rose-50 border-rose-200 text-rose-500' 
                        : 'border-slate-250 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Heart className={`h-4.5 w-4.5 ${isFav ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Add to Cart button */}
                <button
                  onClick={handleAddToCart}
                  className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-100"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart • ${(finalPrice * qty).toFixed(2)}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
