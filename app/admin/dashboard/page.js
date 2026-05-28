'use client';

import React, { useEffect, useState } from 'react';
import { orderService } from '@/services/orderService';
import { productService } from '@/services/productService';
import { authService } from '@/services/authService';
import Link from 'next/link';
import { 
  DollarSign, ShoppingCart, Users, Package, TrendingUp, 
  ChevronRight, ArrowUpRight, Flame, BarChart3, AlertCircle 
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    topProducts: [],
    topCategories: [],
    dailyRevenue: [],
    monthlyRevenue: [],
    orderTrends: []
  });

  const [productsCount, setProductsCount] = useState(0);
  const [customersCount, setCustomersCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch analytics
        const analytics = await orderService.getAnalytics();
        setStats(analytics);

        // Fetch products list count
        const allProds = await productService.getProducts({ status: 'All' });
        setProductsCount(allProds.length);

        // Fetch recent orders
        const allOrders = await orderService.getAllOrders();
        setRecentOrders(allOrders.slice(0, 5));

        // Mock users list count
        // Read directly from mock session database
        if (typeof window !== 'undefined') {
          const mockUsers = JSON.parse(localStorage.getItem('ecommerce_mock_users') || '[]');
          setCustomersCount(mockUsers.filter(u => u.role === 'customer').length || 1);
        } else {
          setCustomersCount(1);
        }
      } catch (err) {
        console.error('Error fetching dashboard analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <div className="animate-spin h-7 w-7 border-3 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Find low stock products
  return (
    <div className="space-y-8">
      
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Overview Dashboard</h1>
        <p className="text-xxs text-slate-400 font-semibold mt-1">Real-time metrics, transaction trends, and catalog status</p>
      </div>

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1: Total Revenue */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xxs font-bold text-slate-450 uppercase tracking-widest">Total Revenue</span>
            <h3 className="text-2xl font-black text-white">${stats.totalRevenue.toFixed(2)}</h3>
          </div>
          <span className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
            <DollarSign className="h-5 w-5" />
          </span>
        </div>

        {/* Metric 2: Orders Count */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xxs font-bold text-slate-450 uppercase tracking-widest">Total Sales</span>
            <h3 className="text-2xl font-black text-white">{stats.totalSales}</h3>
          </div>
          <span className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <ShoppingCart className="h-5 w-5" />
          </span>
        </div>

        {/* Metric 3: Products Count */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xxs font-bold text-slate-450 uppercase tracking-widest">Catalog Products</span>
            <h3 className="text-2xl font-black text-white">{productsCount}</h3>
          </div>
          <span className="h-10 w-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center shrink-0">
            <Package className="h-5 w-5" />
          </span>
        </div>

        {/* Metric 4: Customers Count */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xxs font-bold text-slate-450 uppercase tracking-widest">Total Customers</span>
            <h3 className="text-2xl font-black text-white">{customersCount}</h3>
          </div>
          <span className="h-10 w-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </span>
        </div>
      </div>

      {/* 2. Analytical Graphs & Performance list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Revenue Trend Chart (Dynamic CSS bars) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:col-span-2 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-4.5 w-4.5 text-indigo-400" />
              Daily Revenue Trends
            </h3>
            <span className="text-[10px] font-bold text-slate-400">Last 7 Active Days</span>
          </div>

          {stats.dailyRevenue.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-xs text-slate-500">
              No sales logged yet for analytics.
            </div>
          ) : (
            <div className="flex items-end justify-between h-64 pt-6 px-4 relative">
              {/* Grid Y lines */}
              <div className="absolute inset-x-0 bottom-6 border-b border-slate-800"></div>
              <div className="absolute inset-x-0 top-1/3 border-b border-slate-800/50"></div>
              <div className="absolute inset-x-0 top-2/3 border-b border-slate-800/50"></div>

              {stats.dailyRevenue.map((d, index) => {
                // Percentage calculations
                const maxVal = Math.max(...stats.dailyRevenue.map(item => item.revenue), 100);
                const heightPct = (d.revenue / maxVal) * 80; // max 80% height

                return (
                  <div key={index} className="flex flex-col items-center flex-grow group relative z-10">
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg pointer-events-none">
                      ${d.revenue.toFixed(2)}
                    </div>
                    
                    {/* Dynamic Bar */}
                    <div
                      style={{ height: `${Math.max(heightPct, 5)}%` }}
                      className="w-10 sm:w-12 bg-gradient-to-t from-indigo-650 to-indigo-500 rounded-t-xl group-hover:from-indigo-500 group-hover:to-indigo-400 transition-all duration-300"
                    ></div>
                    
                    {/* Label Date */}
                    <span className="text-[9px] font-bold text-slate-450 mt-2">
                      {new Date(d.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Top Selling Categories & Products list */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="h-4.5 w-4.5 text-amber-500" />
              Top Categories Sold
            </h3>
          </div>

          {stats.topCategories.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500">
              No product items purchased.
            </div>
          ) : (
            <div className="space-y-4">
              {stats.topCategories.map((c, idx) => {
                // Calculate percentage
                const totalUnits = stats.topCategories.reduce((sum, item) => sum + item.sales, 0);
                const pct = (c.sales / totalUnits) * 100;

                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xxs font-bold text-slate-350">
                      <span className="text-white">{c.name}</span>
                      <span>{c.sales} Units ({pct.toFixed(0)}%)</span>
                    </div>
                    {/* Custom progress bar */}
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full bg-indigo-500 rounded-full"
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. Recent Orders logs */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-black text-white uppercase tracking-wider">Recent Orders</h3>
          <Link
            href="/admin/orders"
            className="text-xxs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            Manage All Orders <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No orders logged in store database yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-950/40 text-[10px] font-black uppercase tracking-wider text-slate-450 border-b border-slate-800">
                  <th className="px-6 py-3.5">ID</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Products</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4.5 font-bold text-white uppercase">{ord.id}</td>
                    <td className="px-6 py-4.5 font-semibold">{ord.userName}</td>
                    <td className="px-6 py-4.5 truncate max-w-[200px]">
                      {ord.products.map(p => `${p.name} (x${p.quantity})`).join(', ')}
                    </td>
                    <td className="px-6 py-4.5 font-black text-white">${ord.amount.toFixed(2)}</td>
                    <td className="px-6 py-4.5">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                        ord.orderStatus === 'Delivered'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : ord.orderStatus === 'Cancelled'
                            ? 'bg-rose-500/10 text-rose-450 border border-rose-500/20'
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}>
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 font-semibold text-slate-400">
                      {new Date(ord.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
