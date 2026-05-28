'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { orderService } from '@/services/orderService';
import { paymentService } from '@/services/paymentService';
import { ArrowLeft, ShoppingBag, ShieldCheck } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { 
    user, cart, clearCart, 
    cartSubtotal, cartDiscount, cartShipping, cartTax, cartTotal, 
    showToast 
  } = useStore();

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      router.push('/cart');
    }
  }, [cart]);

  // Form fields state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('UPI'); // UPI, Card, Net Banking, Wallet, COD
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { name, phone, address, city, state, pincode } = formData;
    if (!name.trim()) return 'Name is required.';
    if (!phone.trim() || phone.trim().length < 10) return 'Please enter a valid 10-digit phone number.';
    if (!address.trim()) return 'Delivery address is required.';
    if (!city.trim()) return 'City is required.';
    if (!state.trim()) return 'State is required.';
    if (!pincode.trim() || pincode.trim().length < 6) return 'Please enter a valid 6-digit pincode.';
    return null;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    const err = validateForm();
    if (err) {
      showToast(err, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. If Cash on Delivery (COD) chosen
      if (paymentMethod === 'COD') {
        const orderData = {
          userId: user?.id || 'mock-customer-uuid',
          userName: formData.name,
          userEmail: user?.email || 'customer@ecommerce.com',
          products: cart,
          amount: cartTotal,
          paymentStatus: 'pending',
          paymentMethod: 'COD',
          shippingAddress: formData
        };

        const newOrder = await orderService.createOrder(orderData);
        showToast('Order placed successfully with Cash on Delivery!', 'success');
        clearCart();
        router.push(`/success?id=${newOrder.id}`);
      } else {
        // 2. Online Payment Gateway (Razorpay/Mock)
        const orderIdTemp = `ord-tmp-${Math.random().toString(36).substr(2, 9)}`;
        
        const paymentResult = await paymentService.processPayment({
          amount: cartTotal,
          orderId: orderIdTemp,
          customer: {
            name: formData.name,
            email: user?.email || 'customer@ecommerce.com',
            phone: formData.phone
          },
          callback: async (response) => {
            // Verification Callback
            if (response.success) {
              const orderData = {
                userId: user?.id || 'mock-customer-uuid',
                userName: formData.name,
                userEmail: user?.email || 'customer@ecommerce.com',
                products: cart,
                amount: cartTotal,
                paymentStatus: 'paid',
                paymentMethod: response.method || 'Online',
                shippingAddress: formData
              };

              const newOrder = await orderService.createOrder(orderData);
              showToast('Payment verified. Order logged!', 'success');
              clearCart();
              router.push(`/success?id=${newOrder.id}`);
            }
          }
        });
      }
    } catch (err) {
      console.error('Checkout error:', err);
      showToast(err.message || 'Payment or order creation failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-805 mb-2"
        >
          <ArrowLeft className="h-4 w-4" /> Return to Cart
        </button>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Checkout Order</h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">Specify your delivery address and choose a payment mode</p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Left Form: Delivery Address */}
        <div className="lg:col-span-2 space-y-6 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Shipping Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full text-xs h-10 px-3 rounded-xl border border-slate-205 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Receiver name"
                required
              />
            </div>
            
            {/* Phone Number */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full text-xs h-10 px-3 rounded-xl border border-slate-205 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="10-digit number"
                required
              />
            </div>

            {/* Address */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Street Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full text-xs h-10 px-3 rounded-xl border border-slate-205 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="House, Flat, Apartment, Area"
                required
              />
            </div>

            {/* City */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full text-xs h-10 px-3 rounded-xl border border-slate-205 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="City name"
                required
              />
            </div>

            {/* State */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full text-xs h-10 px-3 rounded-xl border border-slate-205 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="State name"
                required
              />
            </div>

            {/* Pincode */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                className="w-full text-xs h-10 px-3 rounded-xl border border-slate-205 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="6-digit PIN"
                maxLength="6"
                required
              />
            </div>
          </div>
        </div>

        {/* Right Form: Payment Option & Summary */}
        <div className="lg:col-span-1 space-y-6">
          {/* Payment option selector */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Select Payment Method</h3>
            
            <div className="space-y-2.5">
              {[
                { id: 'UPI', label: 'UPI (GPay / PhonePe / Paytm)' },
                { id: 'Card', label: 'Credit / Debit Card' },
                { id: 'COD', label: 'Cash on Delivery (COD)' }
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer hover:bg-slate-50 transition-colors ${
                    paymentMethod === opt.id ? 'border-indigo-650 bg-indigo-50/20' : 'border-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_opt"
                    checked={paymentMethod === opt.id}
                    onChange={() => setPaymentMethod(opt.id)}
                    className="accent-indigo-600 h-4 w-4"
                  />
                  <span className="text-xs font-bold text-slate-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Checkout final total summary card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Review Charges</h3>
            
            <div className="space-y-2.5 text-xs text-slate-500 font-semibold border-b border-slate-100 pb-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${cartSubtotal.toFixed(2)}</span>
              </div>
              {cartDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount</span>
                  <span>-${cartDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{cartShipping === 0 ? 'FREE' : `$${cartShipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18% Tax)</span>
                <span>${cartTax.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between text-base font-black text-slate-900">
              <span>Total Amount</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4.5 w-4.5" />
                  Place Order • ${cartTotal.toFixed(2)}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
