'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/context/StoreContext';
import { productService } from '@/services/productService';
import ProductCard from '@/components/ProductCard';
import QuickViewModal from '@/components/QuickViewModal';
import { ProductCardSkeleton } from '@/components/SkeletonLoader';
import { 
  ArrowRight, ShieldCheck, Truck, RotateCcw, CreditCard, 
  Sparkles, Flame, Clock, Star, Quote
} from 'lucide-react';

const HERO_SLIDES = [
  {
    id: 1,
    productId: 'prod-1',
    title: 'Sound Refined. Noise Cancelled.',
    subtitle: 'AURASOUND MAX ANC',
    desc: 'Redefining acoustic performance with active hybrid noise cancellation and dynamic audio processing.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80',
    color: 'from-slate-900 via-indigo-950 to-indigo-900',
    tag: 'Trending Product'
  },
  {
    id: 2,
    productId: 'prod-2',
    title: 'Typing Bliss. Metal Core.',
    subtitle: 'KEYCHRON Q5 PRO',
    desc: 'Full metal customized double-gasket mechanical keyboard with premium hot-swappable switches.',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1000&auto=format&fit=crop&q=80',
    color: 'from-slate-900 via-slate-950 to-indigo-950',
    tag: 'New Arrival'
  },
  {
    id: 3,
    productId: 'prod-3',
    title: 'Sapphire Crystal. Swiss Precision.',
    subtitle: 'CHRONOCLASSIC WATCH',
    desc: 'Precision automatic sapphire luxury wristwatch. Waterproof up to 100 meters, visible caseback.',
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=1000&auto=format&fit=crop&q=80',
    color: 'from-indigo-950 via-slate-950 to-slate-900',
    tag: 'Limited Edition'
  }
];

const TESTIMONIALS = [
  {
    name: 'Sarah Connor',
    role: 'Full Stack Engineer',
    quote: 'The Keychron keyboard I purchased is an absolute dream. The keypress is so tactile and the heavy aluminum body makes my desk look incredibly premium. Best investment this year.',
    rating: 5,
    avatar: 'SC'
  },
  {
    name: 'David Beck',
    role: 'Acoustic Engineer',
    quote: 'The AuraSound Max headphones deliver stellar frequency responses. The ANC isolation is comparable to products twice the cost. Clean, balanced, and premium build.',
    rating: 5,
    avatar: 'DB'
  },
  {
    name: 'Elena Rostova',
    role: 'Lifestyle Photographer',
    quote: 'Customer support answered all my shipping questions immediately. The checkout was seamless with the Razorpay UPI flow, and the watch arrived in flawless premium packaging.',
    rating: 5,
    avatar: 'ER'
  }
];

export default function HomePage() {
  const { showToast } = useStore();
  const [activeSlide, setActiveSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Countdown timer state (ends 18 hours from now)
  const [timeLeft, setTimeLeft] = useState(18 * 60 * 60);

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 18 * 60 * 65));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format countdown timer
  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return {
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0')
    };
  };

  const { hours, minutes, seconds } = formatTime(timeLeft);

  // Auto carousel effect
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Fetch product grids
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const all = await productService.getProducts();
        
        // Featured Products
        setFeaturedProducts(all.filter(p => p.featured));
        
        // New Arrivals (sorted by date or ID)
        setNewArrivals(all.slice(0, 4));

        // Best Sellers (mock filter by stock or rating)
        setBestSellers(all.filter(p => p.rating >= 4.8).slice(0, 4));
      } catch (err) {
        console.error('Error fetching home products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="space-y-16 pb-20">
      
      {/* 1. HERO BANNER CAROUSEL */}
      <section className="relative h-[480px] md:h-[600px] w-full overflow-hidden bg-slate-900">
        <AnimatePresence mode="wait">
          {HERO_SLIDES.map((slide, idx) => {
            if (idx !== activeSlide) return null;
            return (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className={`absolute inset-0 bg-gradient-to-r ${slide.color} flex items-center`}
              >
                {/* Visual Accent */}
                <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay" style={{ backgroundImage: `url(${slide.image})` }}></div>

                <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
                  <div className="space-y-5 text-white">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-indigo-300 uppercase tracking-widest">
                      <Sparkles className="h-3.5 w-3.5" />
                      {slide.tag}
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-none">
                      {slide.title}
                    </h1>
                    <p className="text-sm sm:text-base text-slate-300 max-w-md font-medium leading-relaxed">
                      {slide.desc}
                    </p>
                    <div className="flex gap-4 pt-2">
                      <Link
                        href={`/product/${slide.productId}`}
                        className="h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
                      >
                        Buy Now
                        <ArrowRight className="h-4.5 w-4.5" />
                      </Link>
                      <Link
                        href="/products"
                        className="h-12 px-6 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold flex items-center justify-center transition-colors border border-white/20"
                      >
                        Browse Shop
                      </Link>
                    </div>
                  </div>

                  {/* Slide Image */}
                  <div className="hidden md:flex justify-center">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="relative h-[380px] w-[380px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 bg-white"
                    >
                      <img src={slide.image} alt="" className="h-full w-full object-cover" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Carousel Indicators */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === activeSlide ? 'w-8 bg-indigo-500' : 'w-2 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* 2. USP / SERVICE ICONS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 rounded-3xl border border-slate-100 bg-slate-50/50 p-6 md:p-8">
          <div className="flex gap-4">
            <span className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-650 flex items-center justify-center shrink-0">
              <Truck className="h-6 w-6" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Free Delivery</h4>
              <p className="text-xxs text-slate-400 font-semibold mt-0.5">Free shipping on all orders over $500</p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-650 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Secure Payments</h4>
              <p className="text-xxs text-slate-400 font-semibold mt-0.5">Razorpay integrated encrypted gate</p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-650 flex items-center justify-center shrink-0">
              <RotateCcw className="h-6 w-6" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-slate-800">30-Day Return</h4>
              <p className="text-xxs text-slate-400 font-semibold mt-0.5">Hassle-free online return requests</p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-650 flex items-center justify-center shrink-0">
              <CreditCard className="h-6 w-6" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Cash on Delivery</h4>
              <p className="text-xxs text-slate-400 font-semibold mt-0.5">Pay at your doorstep with Cash/COD</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Explore Key Categories</h2>
          <p className="text-xs text-slate-400 font-medium mt-1">Sourced from top manufacturers globally.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { name: 'Audio ANC', slug: 'Audio', count: '2 Products', color: 'bg-emerald-50 text-emerald-600', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80' },
            { name: 'Keyboards', slug: 'Peripherals', count: '2 Products', color: 'bg-indigo-50 text-indigo-600', img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&auto=format&fit=crop&q=80' },
            { name: 'Wearables', slug: 'Wearables', count: '1 Product', color: 'bg-orange-50 text-orange-600', img: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&auto=format&fit=crop&q=80' },
            { name: 'Optics', slug: 'Cameras', count: '1 Product', color: 'bg-sky-50 text-sky-600', img: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&auto=format&fit=crop&q=80' }
          ].map((cat, idx) => (
            <Link
              key={idx}
              href={`/category/${cat.slug}`}
              className="group relative h-48 rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all flex flex-col justify-end p-4 bg-white"
            >
              <img src={cat.img} alt="" className="absolute inset-0 h-full w-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
              
              <div className="relative z-10 text-white">
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">{cat.count}</span>
                <h3 className="text-base font-bold tracking-tight mt-0.5">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FLASH SALE WITH COUNTDOWN */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-indigo-900 overflow-hidden relative border border-indigo-950 shadow-xl grid grid-cols-1 lg:grid-cols-3 items-center">
          <div className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1000&auto=format&fit=crop&q=80')` }}></div>

          <div className="p-8 lg:p-12 lg:col-span-2 text-white space-y-6">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500 text-xs font-bold uppercase tracking-wider">
              <Flame className="h-3.5 w-3.5 fill-current" />
              Flash Sale Live
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-none">
              Save Big on High-End Audio & Gear
            </h2>
            <p className="text-sm text-indigo-200 max-w-md font-medium leading-relaxed">
              Elevate your daily typing or listen to masterclasses without background noises. Limited quantities available at discounted rates.
            </p>

            {/* Countdown timer UI */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center text-xl font-bold tracking-tight border border-white/10 backdrop-blur-md">
                  {hours}
                </div>
                <span className="text-[10px] font-bold uppercase text-indigo-300 tracking-widest mt-1.5">Hours</span>
              </div>
              <span className="text-xl font-bold text-white/50 self-center -translate-y-2">:</span>
              <div className="flex flex-col items-center">
                <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center text-xl font-bold tracking-tight border border-white/10 backdrop-blur-md">
                  {minutes}
                </div>
                <span className="text-[10px] font-bold uppercase text-indigo-300 tracking-widest mt-1.5">Mins</span>
              </div>
              <span className="text-xl font-bold text-white/50 self-center -translate-y-2">:</span>
              <div className="flex flex-col items-center">
                <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center text-xl font-bold tracking-tight border border-white/10 backdrop-blur-md">
                  {seconds}
                </div>
                <span className="text-[10px] font-bold uppercase text-indigo-300 tracking-widest mt-1.5">Secs</span>
              </div>
            </div>
          </div>

          <div className="p-8 lg:p-12 flex justify-center lg:justify-end">
            <Link
              href="/products?discount=true"
              className="h-14 px-8 rounded-2xl bg-white hover:bg-slate-50 text-indigo-900 font-bold flex items-center justify-center gap-2 transition-colors shadow-lg"
            >
              Shop the Flash Sale
              <ArrowRight className="h-4.5 w-4.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. FEATURED PRODUCTS GRID */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Featured Collections</h2>
            <p className="text-xs text-slate-400 font-medium mt-1">Our editors highly recommend these curated essentials.</p>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-650 hover:text-indigo-800 transition-colors"
          >
            Browse All Shop
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
        )}
      </section>

      {/* 6. TABBED NEW ARRIVALS & BEST SELLERS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Trending Digital Items</h2>
          <p className="text-xs text-slate-400 font-medium max-w-sm">Shop our new drops or explore products verified buyers have rated five stars.</p>
        </div>

        {/* Product tab cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestSellers.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={setQuickViewProduct}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 7. CUSTOMER TESTIMONIALS */}
      <section className="bg-slate-50 py-16 border-y border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-widest">Testimonials</span>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">What Our Clients Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex gap-1">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4.5 w-4.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs leading-relaxed text-slate-500 italic font-medium">
                    "{t.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-6 border-t border-slate-50 mt-6">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                    {t.avatar}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{t.name}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick View Modal drawer */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}
