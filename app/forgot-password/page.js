'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import Link from 'next/link';
import { Mail, Phone, Lock, ArrowLeft, Send, ShieldCheck, KeyRound } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { showToast } = useStore();

  // Wizard Steps:
  // 1: Select Method & Enter Contact Info (Email or Phone)
  // 2: Enter & Verify 6-digit OTP
  // 3: Input New Password & Confirm
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState('email'); // 'email' or 'phone'
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [userOtp, setUserOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();

    if (method === 'email' && (!email.trim() || !email.includes('@'))) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    if (method === 'phone' && (!phone.trim() || phone.trim().length < 10)) {
      showToast('Please enter a valid 10-digit mobile number.', 'error');
      return;
    }

    setLoading(true);
    try {
      // Generate a random 6-digit verification code
      const generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
      setOtp(generatedOtp);

      // Simulate sending OTP (or trigger Supabase if configured)
      await new Promise(resolve => setTimeout(resolve, 1500));

      const contactTarget = method === 'email' ? email : phone;
      
      // Dispatch simulated SMS/Email notification alert with the OTP
      showToast(`[MOCK GATEWAY] Verification code sent to ${contactTarget}.`, 'info');
      
      // Highlight the OTP code for the user to copy/paste easily
      console.log(`[DEVELOPER MOCK OTP] Password Reset Code: ${generatedOtp}`);
      alert(`[MOCK ${method.toUpperCase()} GATEWAY]\nYour password reset OTP code is: ${generatedOtp}`);

      setStep(2);
    } catch (err) {
      showToast('Failed to trigger reset code. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (userOtp.trim() !== otp) {
      showToast('Invalid verification code. Please try again.', 'error');
      return;
    }
    showToast('OTP verified successfully! Create a new password.', 'success');
    setStep(3);
  };

  // Step 3: Commit Password Update
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Update password in mock storage if present
      const users = JSON.parse(localStorage.getItem('ecommerce_mock_users') || '[]');
      const targetContact = method === 'email' ? email.toLowerCase() : phone;
      
      const idx = users.findIndex(u => 
        u.email.toLowerCase() === targetContact || 
        u.phone === targetContact
      );

      if (idx !== -1) {
        users[idx].password = newPassword;
        localStorage.setItem('ecommerce_mock_users', JSON.stringify(users));
        showToast('Password updated successfully! Sign in with your new credentials.', 'success');
        router.push('/login');
      } else {
        // If not found in mock array, check if we create it or show warning
        showToast('Password updated. Proceed to login.', 'success');
        router.push('/login');
      }
    } catch (err) {
      showToast('Failed to update password.', 'error');
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
          <h2 className="text-xl font-bold tracking-tight">Account Recovery</h2>
          <p className="text-xxs text-slate-350 font-medium">
            {step === 1 && "Select verification channel to receive a 6-digit OTP code."}
            {step === 2 && "Enter the verification code sent to your contact device."}
            {step === 3 && "Specify a secure new password for your customer profile."}
          </p>
        </div>

        {/* STEP 1: Select Method and Enter Contact Info */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            
            {/* Method Toggle Buttons */}
            <div className="grid grid-cols-2 gap-3 bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setMethod('email')}
                className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  method === 'email' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mail className="h-4 w-4" />
                Email OTP
              </button>
              <button
                type="button"
                onClick={() => setMethod('phone')}
                className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  method === 'phone' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Phone className="h-4 w-4" />
                Mobile OTP
              </button>
            </div>

            {/* Email Field */}
            {method === 'email' ? (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white/10"
                    required
                  />
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>
            ) : (
              /* Phone Field */
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Mobile Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="Enter 10-digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white/10"
                    required
                  />
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>
            )}

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
                  <Send className="h-4 w-4" />
                  Send Verification OTP
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Verify OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">6-Digit Verification Code</label>
              <div className="relative">
                <input
                  type="text"
                  maxLength="6"
                  placeholder="Enter OTP (e.g. 123456)"
                  value={userOtp}
                  onChange={(e) => setUserOtp(e.target.value)}
                  className="w-full text-center text-sm tracking-widest font-black h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-550 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white/10"
                  required
                />
                <ShieldCheck className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 transition-colors text-xs"
            >
              Verify OTP Code
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-xxs font-bold text-slate-400 hover:text-white transition-colors"
            >
              Change email/phone details
            </button>
          </form>
        )}

        {/* STEP 3: Change Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">New Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full text-xs h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white/10"
                  required
                />
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full text-xs h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white/10"
                  required
                />
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 text-xs"
            >
              {loading ? 'Committing Changes...' : 'Reset & Save Password'}
            </button>
          </form>
        )}

        {/* Back Link */}
        {step === 1 && (
          <div className="text-center pt-2">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-xxs font-bold text-indigo-400 hover:underline">
              <ArrowLeft className="h-3 w-3" /> Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
