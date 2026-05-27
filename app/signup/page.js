'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import Link from 'next/link';
import { Mail, Lock, User, Phone, UserPlus, ArrowRight, Chrome } from 'lucide-react';

function SignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const { signup, user, authLoading, showToast } = useStore();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect away
  useEffect(() => {
    if (user) {
      router.push(redirect);
    }
  }, [user, redirect]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { authService } = await import('@/services/authService');
      const googleUser = await authService.signInWithGoogle();
      if (googleUser) {
        showToast('Google Sign In successful!', 'success');
        router.push(redirect);
        // Force reload page to refresh headers
        window.location.href = redirect;
      }
    } catch (err) {
      showToast('Google Sign In failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) return showToast('Name is required.', 'error');
    if (!email.trim() || !email.includes('@')) return showToast('Please enter a valid email.', 'error');
    if (!phone.trim() || phone.trim().length < 10) return showToast('Please enter a 10-digit phone number.', 'error');
    if (!password || password.length < 6) return showToast('Password must be at least 6 characters.', 'error');
    if (password !== confirmPassword) return showToast('Passwords do not match.', 'error');

    setLoading(true);
    try {
      await signup(email, password, name, phone);
      router.push(redirect);
    } catch (err) {
      // toast is dispatched inside store
    } finally {
      setLoading(false);
    }
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
          <h2 className="text-xl font-bold tracking-tight">Create Customer Account</h2>
          <p className="text-xxs text-slate-355 font-medium">Join us to shop customizable keyboards, smartwatches and headphones.</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-305 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-550 focus:outline-none focus:ring-1 focus:ring-indigo-550 focus:bg-white/10"
                required
              />
              <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-305 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-550 focus:outline-none focus:ring-1 focus:ring-indigo-550 focus:bg-white/10"
                required
              />
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-305 uppercase tracking-wider">Phone number</label>
            <div className="relative">
              <input
                type="tel"
                placeholder="10-digit contact number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-550 focus:outline-none focus:ring-1 focus:ring-indigo-550 focus:bg-white/10"
                required
              />
              <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-305 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-550 focus:outline-none focus:ring-1 focus:ring-indigo-550 focus:bg-white/10"
                required
              />
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-305 uppercase tracking-wider">Confirm Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full text-xs h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-550 focus:outline-none focus:ring-1 focus:ring-indigo-550 focus:bg-white/10"
                required
              />
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <UserPlus className="h-4.5 w-4.5" />
                Sign Up
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
          Sign Up with Google
        </button>

        {/* Redirect to login */}
        <p className="text-center text-xxs text-slate-400 font-semibold pt-1">
          Already have an account?{' '}
          <Link href={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-indigo-400 hover:underline font-bold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex justify-center items-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-650 border-t-transparent rounded-full"></div>
      </div>
    }>
      <SignupPageContent />
    </Suspense>
  );
}
