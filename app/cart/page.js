'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, X, Tag } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { 
    user, cart, updateCartQuantity, removeFromCart, 
    cartSubtotal, cartDiscount, cartShipping, cartTax, cartTotal,
    couponCode, applyCoupon, removeCoupon
  } = useStore();

  const [promoCode, setPromoCode] = useState('');

  const handleCouponSubmit = (e) => {
    e.preventDefault();
    if (!promoCode) return;
    const success = applyCoupon(promoCode);
    if (success) {
      setPromoCode('');
    }
  };

  const handleCheckoutRedirect = () => {
    if (user) {
      router.push('/checkout');
    } else {
      router.push('/login?redirect=/checkout');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="h-16 w-16 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-slate-100 shadow-inner">
          <ShoppingBag className="h-7 w-7" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Your shopping cart is empty</h2>
          <p className="text-xs text-slate-400 font-medium">Add premium customizable peripherals, sound gear or smart wear to begin.</p>
        </div>
        <Link
          href="/products"
          className="inline-flex h-11 px-6 rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold items-center justify-center transition-colors shadow-lg shadow-indigo-100"
        >
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header */}
      <div className="border-b border-slate-100 pb-5">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Your Shopping Cart</h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">Review items and discounts before checking out</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* Left: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 gap-4 items-center justify-between"
            >
              {/* Product Thumbnail */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-20 w-20 object-cover rounded-xl bg-slate-50 border border-slate-100/50 shrink-0"
                />
                <div>
                  <h3 className="text-xs font-bold text-slate-850 line-clamp-1">{item.name}</h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xs font-black text-slate-950">${item.price.toFixed(2)}</span>
                    {item.discount > 0 && (
                      <span className="text-[10px] text-slate-400 line-through">${item.originalPrice.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quantity Changer */}
              <div className="flex items-center gap-4 justify-between w-full sm:w-auto pt-4 sm:pt-0 border-t border-slate-50 sm:border-0">
                <div className="flex items-center border border-slate-205 rounded-xl overflow-hidden bg-slate-50/50">
                  <button
                    onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                    className="p-1.5 text-slate-500 hover:bg-slate-100"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="px-3 text-xs font-bold text-slate-800">{item.quantity}</span>
                  <button
                    onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                    className="p-1.5 text-slate-500 hover:bg-slate-100"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                {/* Subtotal of item */}
                <div className="text-right">
                  <span className="text-xs font-black text-slate-950">${(item.price * item.quantity).toFixed(2)}</span>
                </div>

                {/* Remove item */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Summary invoice + Promos */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Coupon Codes Panel */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Tag className="h-4 w-4 text-indigo-500" />
              Apply Discount Coupon
            </h3>

            {couponCode ? (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-emerald-800">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  Active: {couponCode} ({couponDiscount}% Off)
                </span>
                <button onClick={removeCoupon} className="p-0.5 hover:bg-emerald-150 rounded text-emerald-500">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleCouponSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. SAVE10, WELCOME20"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 h-10 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 rounded-xl bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-bold transition-colors"
                >
                  Apply
                </button>
              </form>
            )}
            
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
              Use codes <span className="font-bold text-indigo-500">WELCOME20</span> for 20% discount, or <span className="font-bold text-indigo-500">SAVE10</span> for 10% discount.
            </p>
          </div>

          {/* Invoice pricing list */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Order summary</h3>
            
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-500 font-semibold">
                <span>Subtotal</span>
                <span>${cartSubtotal.toFixed(2)}</span>
              </div>
              {cartDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount</span>
                  <span>-${cartDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500 font-semibold">
                <span>Delivery Charge</span>
                <span>{cartShipping === 0 ? 'FREE' : `$${cartShipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-semibold">
                <span>Estimated Tax (18% GST)</span>
                <span>${cartTax.toFixed(2)}</span>
              </div>
              
              <div className="border-t border-slate-100 pt-3 flex justify-between text-base font-black text-slate-900">
                <span>Total Amount</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckoutRedirect}
              className="w-full h-12 rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100 mt-2"
            >
              Proceed to Checkout
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
