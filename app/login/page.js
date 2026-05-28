'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, Chrome, HelpCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, showToast } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [redirect, setRedirect] = useState('/');
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Parse redirect search param client-side safely to prevent Suspense remount issues
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const r = params.get('redirect');
      if (r) setRedirect(r);
    }
  }, []);

  // If already logged in, redirect away
  useEffect(() => {
    if (user) {
      router.push(redirect);
    }
  }, [user, redirect, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill all fields.', 'error');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      const targetRedirect = loggedUser?.role === 'admin' ? '/admin/dashboard' : redirect;
      window.location.href = targetRedirect;
    } catch (err) {
      // toast is dispatched inside store
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { authService } = await import('@/services/authService');
      const googleUser = await authService.signInWithGoogle();
      if (googleUser) {
        showToast('Google Sign In successful!', 'success');
        router.push(redirect);
        window.location.href = redirect;
      }
    } catch (err) {
      showToast(err.message || 'Google Sign In failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const autofillCredentials = (role) => {
    if (role === 'admin') {
      setEmail('admin@ecommerce.com');
      setPassword('admin123');
    } else {
      setEmail('customer@ecommerce.com');
      setPassword('customer123');
    }
    setShowTooltip(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12 relative overflow-hidden">
      {/* Visual background accents */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-650/10 rounded-full blur-3xl"></div>

      <div className="relative w-full max-w-md bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6 text-white">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-1.5 justify-center mb-1 group">
            <span className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
              A
            </span>
            <span className="text-lg font-black text-white tracking-tight">
              Apex<span className="text-indigo-400">Store</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold tracking-tight">Access Your Account</h2>
          <p className="text-xxs text-slate-350 font-medium">Log in to track orders, manage payments, and checkout items.</p>
        </div>

        {/* Credentials Tooltip */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTooltip(!showTooltip)}
            className="flex items-center gap-1 text-[10px] font-bold text-indigo-300 hover:text-indigo-400 mx-auto transition-colors"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            Show Test Credentials (Mock Mode)
          </button>
          
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-60 rounded-xl bg-white border border-slate-100 p-3 text-slate-800 shadow-xl z-20 text-xxs space-y-2 font-medium"
              >
                <p className="font-bold text-slate-500 border-b border-slate-50 pb-1.5 uppercase tracking-wider text-[9px]">Select a role to autofill:</p>
                <button
                  type="button"
                  onClick={() => autofillCredentials('admin')}
                  className="flex w-full items-center justify-between p-2 rounded-lg hover:bg-indigo-50 text-left font-semibold text-slate-700"
                >
                  <span>Admin Panel Access</span>
                  <span className="text-indigo-650">Autofill →</span>
                </button>
                <button
                  type="button"
                  onClick={() => autofillCredentials('customer')}
                  className="flex w-full items-center justify-between p-2 rounded-lg hover:bg-indigo-50 text-left font-semibold text-slate-700"
                >
                  <span>Customer Profile Access</span>
                  <span className="text-indigo-650">Autofill →</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email-input" className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <input
                id="email-input"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full text-xs h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white/10"
                required
              />
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password-input" className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Password</label>
              <Link href="/forgot-password" className="text-[10px] font-bold text-indigo-400 hover:underline">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password-input"
                name="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full text-xs h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white/10"
                required
              />
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <LogIn className="h-4.5 w-4.5" />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 text-slate-500 text-xxs font-bold uppercase tracking-wider">
          <span className="flex-1 h-px bg-white/10"></span>
          <span>Or Continue With</span>
          <span className="flex-1 h-px bg-white/10"></span>
        </div>

        {/* Google OAuth button */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold flex items-center justify-center gap-2 transition-colors text-xs"
        >
          <Chrome className="h-4 w-4 text-indigo-400" />
          Sign In with Google
        </button>

        {/* Redirect to signup */}
        <p className="text-center text-xxs text-slate-400 font-semibold">
          Don't have an account?{' '}
          <Link href={`/signup?redirect=${encodeURIComponent(redirect)}`} className="text-indigo-400 hover:underline font-bold">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
