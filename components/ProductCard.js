'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStore } from '@/context/StoreContext';
import { Heart, ShoppingCart, Eye, Star } from 'lucide-react';

export default function ProductCard({ product, onQuickView }) {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const isFav = isInWishlist(product.id);

  // Math variables
  const price = parseFloat(product.price);
  const discount = parseFloat(product.discount || 0);
  const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;

  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-xl hover:border-slate-200/60 transition-all duration-355"
    >
      {/* Product Image and Overlay */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discount > 0 && (
            <span className="rounded-lg bg-indigo-650 px-2.5 py-1 text-center text-xxs font-black text-white shadow-sm uppercase tracking-wider">
              {discount}% OFF
            </span>
          )}
          {isOutOfStock ? (
            <span className="rounded-lg bg-slate-900/90 px-2.5 py-1 text-center text-xxs font-black text-white shadow-sm uppercase tracking-wider">
              SOLD OUT
            </span>
          ) : isLowStock ? (
            <span className="rounded-lg bg-amber-500 px-2.5 py-1 text-center text-xxs font-black text-white shadow-sm uppercase tracking-wider">
              ONLY {product.stock} LEFT
            </span>
          ) : null}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          className={`absolute top-3 right-3 z-10 p-2 rounded-xl border border-slate-100/50 backdrop-blur-md shadow-sm transition-all duration-300 ${
            isFav 
              ? 'bg-rose-500 text-white' 
              : 'bg-white/80 text-slate-455 hover:text-rose-505 hover:bg-white'
          }`}
        >
          <Heart className={`h-4.5 w-4.5 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Button - Revealed on hover */}
        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <button
            onClick={() => onQuickView(product)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-slate-800 text-xs font-bold shadow-lg hover:bg-indigo-600 hover:text-white transition-all transform translate-y-2 group-hover:translate-y-0 duration-300"
          >
            <Eye className="h-4 w-4" />
            Quick View
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col p-4.5">
        {/* Brand & Rating */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{product.brand}</span>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xxs font-bold text-slate-500">{(product.rating || 4.5).toFixed(1)}</span>
          </div>
        </div>

        {/* Product Title */}
        <Link href={`/product/${product.id}`} className="block mb-2">
          <h3 className="text-sm font-bold text-slate-850 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Price Tag */}
        <div className="flex items-baseline gap-2 mt-auto mb-4">
          <span className="text-base font-black text-slate-900">
            ${finalPrice.toFixed(2)}
          </span>
          {discount > 0 && (
            <span className="text-xs font-medium text-slate-400 line-through">
              ${price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        {isOutOfStock ? (
          <button
            disabled
            className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            Out of Stock
          </button>
        ) : (
          <button
            onClick={() => addToCart(product)}
            className="w-full py-2.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors duration-300"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Add to Cart
          </button>
        )}
      </div>
    </motion.div>
  );
}
