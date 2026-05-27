'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { Mail, Facebook, Twitter, Instagram, Youtube, ArrowRight } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const { showToast } = useStore();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    showToast('Thank you for subscribing to our newsletter!', 'success');
    setEmail('');
  };

  return (
    <footer className="bg-slate-900 text-slate-350 border-t border-slate-800">
      {/* Upper Newsletter Section */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold text-white tracking-tight sm:text-2xl">
              Subscribe to the Apex Newsletter
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Get the latest news on product drops, exclusive digital tech reviews, and private discount events.
            </p>
          </div>
          <form onSubmit={handleSubscribe} className="relative flex max-w-md w-full">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 pl-4 pr-12 rounded-xl bg-slate-800 text-sm text-white placeholder-slate-500 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
              required
            />
            <button
              type="submit"
              className="absolute right-1 top-1 h-9 w-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-colors"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Middle Links Section */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-10">
        {/* Brand info */}
        <div className="col-span-2 md:col-span-1 space-y-4">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
              A
            </span>
            <span className="text-lg font-black text-white tracking-tight">
              Apex<span className="text-indigo-400">Store</span>
            </span>
          </div>
          <p className="text-xs leading-relaxed text-slate-400">
            A premium curator of digital tech, peripherals, wearables, and high-fidelity sound accessories. Elevating your daily workflow.
          </p>
          <div className="flex gap-3.5 pt-2">
            <a href="#" className="text-slate-400 hover:text-white transition-colors">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">
              <Youtube className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Column 2 */}
        <div>
          <h4 className="text-xs uppercase tracking-wider text-white font-bold mb-4">Shop Categories</h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li><Link href="/products?category=Audio" className="hover:text-white transition-colors">Audio ANC Equipment</Link></li>
            <li><Link href="/products?category=Peripherals" className="hover:text-white transition-colors">Mechanical Keyboards</Link></li>
            <li><Link href="/products?category=Wearables" className="hover:text-white transition-colors">Smartwatches & Chronos</Link></li>
            <li><Link href="/products?category=Cameras" className="hover:text-white transition-colors">Cameras & Optics</Link></li>
          </ul>
        </div>

        {/* Column 3 */}
        <div>
          <h4 className="text-xs uppercase tracking-wider text-white font-bold mb-4">Support & Help</h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li><Link href="/profile?tab=orders" className="hover:text-white transition-colors">Track Your Order</Link></li>
            <li><Link href="/profile?tab=settings" className="hover:text-white transition-colors">Return Policy & Refunds</Link></li>
            <li><a href="#" className="hover:text-white transition-colors">Shipping & Delivery Rates</a></li>
            <li><a href="#" className="hover:text-white transition-colors">F.A.Q. Center</a></li>
          </ul>
        </div>

        {/* Column 4 */}
        <div>
          <h4 className="text-xs uppercase tracking-wider text-white font-bold mb-4">Our Company</h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li><a href="#" className="hover:text-white transition-colors">About Apex Inc</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Press & Media kit</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Careers & Internships</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Privacy, Terms & Security</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright Section */}
      <div className="bg-slate-950 px-4 py-6 sm:px-6 lg:px-8 text-xxs text-slate-500 font-medium">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Apex E-Commerce Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <span className="h-4 w-6 rounded bg-slate-800 text-[8px] font-bold text-slate-400 flex items-center justify-center border border-slate-700">UPI</span>
              <span className="h-4 w-6 rounded bg-slate-800 text-[8px] font-bold text-slate-400 flex items-center justify-center border border-slate-700">VISA</span>
              <span className="h-4 w-6 rounded bg-slate-800 text-[8px] font-bold text-slate-400 flex items-center justify-center border border-slate-700">MC</span>
              <span className="h-4 w-6 rounded bg-slate-800 text-[8px] font-bold text-slate-400 flex items-center justify-center border border-slate-700">COD</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
