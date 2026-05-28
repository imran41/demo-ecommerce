'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { BadgePercent, Plus, Trash2, Calendar } from 'lucide-react';

const DEFAULT_COUPONS = [
  { id: 'cop-1', code: 'WELCOME20', discount: 20, expiryDate: '2027-12-31' },
  { id: 'cop-2', code: 'SAVE10', discount: 10, expiryDate: '2027-12-31' }
];

export default function AdminCouponsPage() {
  const { showToast } = useStore();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // New coupon fields
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [expiry, setExpiry] = useState('');

  useEffect(() => {
    const fetchCoupons = () => {
      setLoading(true);
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('ecommerce_mock_coupons');
          if (stored) {
            setCoupons(JSON.parse(stored));
          } else {
            localStorage.setItem('ecommerce_mock_coupons', JSON.stringify(DEFAULT_COUPONS));
            setCoupons(DEFAULT_COUPONS);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  const handleAddCoupon = (e) => {
    e.preventDefault();
    if (!code.trim() || !discount || !expiry) {
      showToast('Please fill all coupon details.', 'error');
      return;
    }

    const formattedCode = code.trim().toUpperCase();
    if (coupons.some(c => c.code === formattedCode)) {
      showToast('Coupon code already exists.', 'error');
      return;
    }

    const newCoupon = {
      id: `cop-${Date.now()}`,
      code: formattedCode,
      discount: parseFloat(discount),
      expiryDate: expiry
    };

    const updated = [...coupons, newCoupon];
    setCoupons(updated);
    localStorage.setItem('ecommerce_mock_coupons', JSON.stringify(updated));

    setCode('');
    setDiscount('');
    setExpiry('');
    showToast('Promo discount coupon saved.', 'success');
  };

  const handleDeleteCoupon = (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    const updated = coupons.filter(c => c.id !== id);
    setCoupons(updated);
    localStorage.setItem('ecommerce_mock_coupons', JSON.stringify(updated));
    showToast('Coupon code deleted.', 'info');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Promo Coupon Manager</h1>
        <p className="text-xxs text-slate-400 font-semibold mt-1">Create and manage discount codes for checkout carts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Left column: Add Coupon form */}
        <form onSubmit={handleAddCoupon} className="md:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm text-slate-350">
          <h3 className="text-xs font-black text-white uppercase tracking-wider">Create Coupon</h3>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Coupon Code</label>
            <input
              type="text"
              placeholder="e.g. SUMMER50"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full text-xs h-10 px-3 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Discount Rate (% Percentage)</label>
            <input
              type="number"
              placeholder="15"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="w-full text-xs h-10 px-3 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expiry Date</label>
            <input
              type="date"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="w-full text-xs h-10 px-3 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none cursor-pointer"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Save Coupon
          </button>
        </form>

        {/* Right column: Coupon table list */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="px-6 py-4.5 border-b border-slate-805">
            <h3 className="text-xs font-black text-white uppercase tracking-wider">Active Promo Coupons</h3>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : coupons.length === 0 ? (
            <p className="p-8 text-center text-xs text-slate-500">No active coupons listed.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-950/40 text-[10px] font-black uppercase tracking-wider text-slate-455 border-b border-slate-805">
                    <th className="px-6 py-3.5">Coupon Code</th>
                    <th className="px-6 py-3.5">Discount Rate</th>
                    <th className="px-6 py-3.5">Expiry Date</th>
                    <th className="px-6 py-3.5 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-805">
                  {coupons.map((c) => {
                    const isExpired = new Date(c.expiryDate) < new Date();
                    return (
                      <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                          <BadgePercent className="h-4.5 w-4.5 text-indigo-400" />
                          {c.code}
                        </td>
                        <td className="px-6 py-4 font-black text-indigo-400">{c.discount}% OFF</td>
                        <td className="px-6 py-4 font-semibold">
                          <span className={`inline-flex items-center gap-1 ${isExpired ? 'text-rose-500' : 'text-slate-400'}`}>
                            <Calendar className="h-3.5 w-3.5" />
                            {c.expiryDate} {isExpired && '(Expired)'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteCoupon(c.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
