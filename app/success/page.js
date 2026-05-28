'use client';

import React, { useState, useEffect, Suspense, use } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { orderService } from '@/services/orderService';
import Link from 'next/link';
import { CheckCircle2, ChevronRight, Package, MapPin, ClipboardList, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

const TRACKING_STEPS = [
  { status: 'Pending', label: 'Order Placed', desc: 'We have received your purchase request.' },
  { status: 'Confirmed', label: 'Order Confirmed', desc: 'Seller has accepted the transaction.' },
  { status: 'Processing', label: 'Processing', desc: 'Item is being inspected and prepared.' },
  { status: 'Packed', label: 'Packed & Boxed', desc: 'Package is sealed and labeled for dispatch.' },
  { status: 'Shipped', label: 'Shipped Out', desc: 'Package in transit via logistics partner.' },
  { status: 'Out for delivery', label: 'Out for Delivery', desc: 'Courier is heading to your address.' },
  { status: 'Delivered', label: 'Package Delivered', desc: 'Delivered at doorstep. Enjoy your tech!' }
];

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Trigger confetti on mount
  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  }, []);

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const ord = await orderService.getOrderById(id);
        setOrder(ord);
      } catch (err) {
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Order not found</h2>
        <p className="text-xs text-slate-450">We couldn't retrieve the details for order ID "{id}".</p>
        <Link href="/" className="inline-block text-xs font-bold text-indigo-650 hover:underline">
          Return to home page
        </Link>
      </div>
    );
  }

  // Find active index in tracking timeline
  const activeIndex = TRACKING_STEPS.findIndex(step => step.status.toLowerCase() === order.orderStatus.toLowerCase());
  const isCancelled = order.orderStatus === 'Cancelled';

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      
      {/* 1. Header Banner */}
      <div className="text-center space-y-4 bg-emerald-50/50 border border-emerald-100 rounded-3xl p-8 max-w-2xl mx-auto shadow-sm">
        <CheckCircle2 className="h-12 w-12 text-emerald-555 mx-auto" />
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Order Placed Successfully!</h1>
          <p className="text-xs text-slate-500 font-semibold">Thank you for shopping at Apex. Your invoice summary is below.</p>
        </div>
        <p className="text-xxs font-black text-emerald-700 bg-emerald-100/50 inline-block px-3 py-1 rounded-lg">
          ORDER ID: {order.id}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        
        {/* Left: Invoice summary */}
        <div className="space-y-6 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-3">
            <ClipboardList className="h-4.5 w-4.5 text-indigo-600" />
            Receipt Details
          </h3>

          {/* Products Table list */}
          <div className="space-y-4">
            {order.products.map((p) => (
              <div key={p.id} className="flex gap-4 items-center justify-between">
                <div className="flex gap-3 items-center">
                  <img src={p.image} alt={p.name} className="h-12 w-12 object-cover rounded-lg bg-slate-50 border border-slate-100" />
                  <div className="max-w-[180px]">
                    <h4 className="text-xs font-bold text-slate-800 truncate">{p.name}</h4>
                    <span className="text-[10px] text-slate-400 font-semibold">Qty: {p.quantity}</span>
                  </div>
                </div>
                <span className="text-xs font-black text-slate-950">${(p.price * p.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Pricing math info */}
          <div className="border-t border-slate-100 pt-4 space-y-2.5 text-xs text-slate-500 font-medium">
            <div className="flex justify-between">
              <span>Payment Mode</span>
              <span className="font-bold text-slate-800 uppercase">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Status</span>
              <span className={`font-bold uppercase ${order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-500'}`}>
                {order.paymentStatus}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-50 pt-2.5 text-sm font-black text-slate-900">
              <span>Total Paid</span>
              <span>${order.amount.toFixed(2)}</span>
            </div>
          </div>

          {/* Address shipping card */}
          <div className="border-t border-slate-100 pt-4 space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> Delivery Address
            </h4>
            <div className="text-xxs text-slate-500 leading-relaxed font-semibold">
              <p className="font-bold text-slate-700">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
              <p className="mt-1">Phone: {order.shippingAddress.phone}</p>
            </div>
          </div>
        </div>

        {/* Right: Live Tracking vertical timeline */}
        <div className="space-y-6 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-3">
            <Package className="h-4.5 w-4.5 text-indigo-600" />
            Live Shipment Status
          </h3>

          {isCancelled ? (
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800 text-xs">
              <div className="h-5 w-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold font-sans shrink-0">✕</div>
              <div>
                <h4 className="font-bold">Order Cancelled</h4>
                <p className="text-xxs text-rose-600 mt-0.5">This shipment has been cancelled by the admin or client request.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {TRACKING_STEPS.map((step, idx) => {
                const isPassed = idx <= activeIndex;
                const isCurrent = idx === activeIndex;

                return (
                  <div key={idx} className="relative flex gap-4">
                    
                    {/* Node Dot */}
                    <span className={`absolute -left-6 top-1 h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all ${
                      isCurrent 
                        ? 'bg-indigo-600 border-indigo-600 text-white scale-125 shadow-lg shadow-indigo-100' 
                        : isPassed 
                          ? 'bg-indigo-50 border-indigo-600 text-indigo-650' 
                          : 'bg-white border-slate-200'
                    }`}>
                      {isPassed && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>}
                    </span>

                    <div>
                      <h4 className={`text-xs font-bold leading-none ${isCurrent ? 'text-indigo-650 font-black' : isPassed ? 'text-slate-800' : 'text-slate-400'}`}>
                        {step.label}
                      </h4>
                      <p className={`text-[10px] leading-relaxed mt-1 ${isCurrent ? 'text-slate-500 font-semibold' : 'text-slate-400'}`}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer navigation */}
      <div className="text-center pt-5">
        <Link
          href="/products"
          className="inline-flex h-11 px-6 rounded-xl border border-slate-250 hover:bg-slate-50 text-slate-700 text-xs font-bold items-center justify-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Keep Browsing Shop
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-40">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-650 border-t-transparent rounded-full"></div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
