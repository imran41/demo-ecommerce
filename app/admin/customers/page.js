'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { authService } from '@/services/authService';
import { orderService } from '@/services/orderService';
import { Mail, Phone, Calendar, DollarSign, ShoppingBag } from 'lucide-react';

export default function AdminCustomersPage() {
  const { showToast } = useStore();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const users = await authService.getAllCustomers();
        const orders = await orderService.getAllOrders();
        
        // Map users with sales stats
        const customerList = users.map(u => {
          const userOrders = orders.filter(o => o.userId === u.id && o.orderStatus !== 'Cancelled');
          const totalSpend = userOrders.reduce((sum, o) => sum + parseFloat(o.amount || 0), 0);
          
          return {
            ...u,
            ordersCount: userOrders.length,
            totalSpend
          };
        });

        setCustomers(customerList);
      } catch (err) {
        console.error('Error fetching customers:', err);
        showToast('Error loading customer directory.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Customer Directory</h1>
        <p className="text-xxs text-slate-400 font-semibold mt-1">Directory of shoppers, transaction count and total lifetime value (LTV)</p>
      </div>

      {/* Customers Table */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin h-7 w-7 border-3 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl text-slate-505 text-xs">
          No shoppers registered in store yet.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-350 border-collapse">
              <thead>
                <tr className="bg-slate-950/40 text-[10px] font-black uppercase tracking-wider text-slate-455 border-b border-slate-800">
                  <th className="px-6 py-4">Customer Details</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4 text-center">Orders Placed</th>
                  <th className="px-6 py-4 text-center">Lifetime Spend</th>
                  <th className="px-6 py-4">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-805">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-800 text-indigo-400 font-bold flex items-center justify-center text-xs">
                          {c.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-xs">{c.name}</h4>
                          <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">Role: Customer</span>
                        </div>
                      </div>
                    </td>

                    {/* Email and Phone */}
                    <td className="px-6 py-4 space-y-1">
                      <p className="flex items-center gap-1.5 font-semibold text-white">
                        <Mail className="h-3 w-3 text-slate-500" /> {c.email}
                      </p>
                      {c.phone && (
                        <p className="flex items-center gap-1.5 font-semibold text-slate-450">
                          <Phone className="h-3 w-3 text-slate-500" /> {c.phone}
                        </p>
                      )}
                    </td>

                    {/* Orders count */}
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold text-xxs">
                        <ShoppingBag className="h-3.5 w-3.5" />
                        {c.ordersCount}
                      </span>
                    </td>

                    {/* LTV */}
                    <td className="px-6 py-4 text-center font-black text-white">
                      <span className="text-emerald-450">${c.totalSpend.toFixed(2)}</span>
                    </td>

                    {/* Reg Date */}
                    <td className="px-6 py-4 font-semibold text-slate-400">
                      {new Date(c.createdAt || c.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
