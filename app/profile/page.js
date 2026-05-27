'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { orderService } from '@/services/orderService';
import { wishlistService } from '@/services/wishlistService';
import { 
  Package, Heart, MapPin, User, LogOut, ShoppingCart, 
  Trash2, ClipboardList, RefreshCcw, Save, Trash, Plus
} from 'lucide-react';

const TABS = [
  { id: 'orders', label: 'Order History', icon: Package },
  { id: 'wishlist', label: 'My Wishlist', icon: Heart },
  { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
  { id: 'settings', label: 'Account Settings', icon: User }
];

function ProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'orders';

  const { 
    user, authLoading, logout, updateProfile, 
    wishlist, toggleWishlist, addToCart, showToast 
  } = useStore();

  // Tab State
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Orders history
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Address State
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({ name: '', phone: '', address: '', city: '', state: '', pincode: '' });
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Settings State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Sync tab search param
  useEffect(() => {
    setActiveTab(searchParams.get('tab') || 'orders');
  }, [searchParams]);

  // Auth Protection redirect
  useEffect(() => {
    if (!authLoading && !user) {
      showToast('Please sign in to view your profile dashboard.', 'error');
      router.push('/login?redirect=/profile');
    } else if (user) {
      setName(user.name);
      setPhone(user.phone || '');
    }
  }, [user, authLoading]);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setOrdersLoading(true);
      try {
        const list = await orderService.getUserOrders(user.id);
        setOrders(list);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [user, activeTab]);

  // Load Saved Addresses
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('saved_addresses');
      if (stored) {
        setAddresses(JSON.parse(stored));
      } else {
        const defaultAddress = [
          {
            id: 'addr-1',
            name: user?.name || 'John Doe',
            phone: user?.phone || '+919999988888',
            address: 'Apt 4B, Skyview Towers, Sector 62',
            city: 'Noida',
            state: 'Uttar Pradesh',
            pincode: '201301'
          }
        ];
        setAddresses(defaultAddress);
        localStorage.setItem('saved_addresses', JSON.stringify(defaultAddress));
      }
    }
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center py-40">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-650 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Handle Return request
  const handleReturnRequest = async (orderId) => {
    try {
      await orderService.requestReturn(orderId);
      // Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, returnStatus: 'Requested' } : o));
      showToast('Return request logged successfully. Awaiting admin approval.', 'success');
    } catch (e) {
      showToast('Failed to log return request.', 'error');
    }
  };

  // Handle Cancel request
  const handleCancelOrder = async (orderId) => {
    try {
      await orderService.cancelOrder(orderId);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: 'Cancelled', paymentStatus: 'failed' } : o));
      showToast('Order cancelled successfully.', 'info');
    } catch (e) {
      showToast('Failed to cancel order.', 'error');
    }
  };

  // Add Address Handler
  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddress.name || !newAddress.phone || !newAddress.address || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      showToast('Please fill all address fields.', 'error');
      return;
    }
    const updated = [...addresses, { id: `addr-${Date.now()}`, ...newAddress }];
    setAddresses(updated);
    localStorage.setItem('saved_addresses', JSON.stringify(updated));
    setNewAddress({ name: '', phone: '', address: '', city: '', state: '', pincode: '' });
    setShowAddressForm(false);
    showToast('Delivery address saved.', 'success');
  };

  // Delete Address Handler
  const handleDeleteAddress = (id) => {
    const updated = addresses.filter(a => a.id !== id);
    setAddresses(updated);
    localStorage.setItem('saved_addresses', JSON.stringify(updated));
    showToast('Delivery address deleted.', 'info');
  };

  // Settings Save Profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(name, phone);
    } catch (err) {
      // toast is dispatched inside store
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Page Title */}
      <div className="border-b border-slate-100 pb-5">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Customer Dashboard</h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">Manage orders, wishlist items and address coordinates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Sidebar Nav tabs */}
        <aside className="lg:col-span-1 bg-white border border-slate-100 rounded-3xl p-4 space-y-2 shadow-sm">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  router.push(`/profile?tab=${tab.id}`);
                }}
                className={`flex w-full items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                    : 'text-slate-650 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {tab.label}
              </button>
            );
          })}

          <hr className="border-slate-100 my-2" />

          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl text-rose-650 hover:bg-rose-50/50 transition-all text-left"
          >
            <LogOut className="h-4.5 w-4.5 text-rose-500" />
            Sign Out
          </button>
        </aside>

        {/* Tab view Panel */}
        <div className="lg:col-span-3">
          
          {/* 1. ORDER HISTORY */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-sm font-black text-slate-805 uppercase tracking-wider">Purchase History</h2>

              {ordersLoading ? (
                <div className="text-center py-20">
                  <div className="animate-spin h-7 w-7 border-3 border-indigo-650 border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-100">
                  <ClipboardList className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-medium">You have not placed any orders yet.</p>
                  <Link href="/products" className="mt-3 inline-block text-xs font-bold text-indigo-650 hover:underline">
                    Browse premium catalog
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => {
                    const isDelivered = order.orderStatus === 'Delivered';
                    const isPendingOrConfirmed = order.orderStatus === 'Pending' || order.orderStatus === 'Confirmed';
                    const hasReturnRequested = order.returnStatus !== null;

                    return (
                      <div
                        key={order.id}
                        className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        {/* Header details of order */}
                        <div className="bg-slate-50/50 px-5 py-4 border-b border-slate-100/50 flex flex-wrap gap-4 items-center justify-between text-xxs text-slate-450 font-semibold uppercase tracking-wider">
                          <div>
                            <span>Order Placed: </span>
                            <span className="font-bold text-slate-700">
                              {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                          <div>
                            <span>Total Amount: </span>
                            <span className="font-bold text-slate-900">${order.amount.toFixed(2)}</span>
                          </div>
                          <div>
                            <span>Status: </span>
                            <span className={`font-black tracking-widest px-2 py-0.5 rounded ${
                              order.orderStatus === 'Delivered' 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : order.orderStatus === 'Cancelled'
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-indigo-100 text-indigo-700'
                            }`}>
                              {order.orderStatus}
                            </span>
                          </div>
                        </div>

                        {/* Order items lists */}
                        <div className="p-5 space-y-4">
                          {order.products.map((p) => (
                            <div key={p.id} className="flex gap-4 items-center justify-between">
                              <div className="flex gap-3 items-center">
                                <img src={p.image} alt={p.name} className="h-12 w-12 object-cover rounded-lg bg-slate-50 border border-slate-100" />
                                <div>
                                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1 max-w-sm">{p.name}</h4>
                                  <span className="text-[10px] text-slate-400 font-semibold">Qty: {p.quantity} @ ${p.price.toFixed(2)}</span>
                                </div>
                              </div>
                              
                              <button
                                onClick={() => router.push(`/product/${p.id}`)}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-655 hover:bg-slate-50"
                              >
                                View Device
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Interactive return and cancel footer */}
                        <div className="bg-slate-50/50 px-5 py-3 border-t border-slate-100/50 flex justify-between items-center text-xs">
                          <Link
                            href={`/success?id=${order.id}`}
                            className="text-xs font-bold text-indigo-650 hover:underline"
                          >
                            Live Order Tracking timeline
                          </Link>

                          <div className="flex gap-2">
                            {/* Cancel Order capability */}
                            {isPendingOrConfirmed && (
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors font-bold text-xxs"
                              >
                                Cancel Order
                              </button>
                            )}

                            {/* Return system capability */}
                            {isDelivered && !hasReturnRequested && (
                              <button
                                onClick={() => handleReturnRequest(order.id)}
                                className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-705 hover:bg-amber-100 transition-colors font-bold text-xxs flex items-center gap-1"
                              >
                                <RefreshCcw className="h-3 w-3" />
                                Request Return
                              </button>
                            )}

                            {hasReturnRequested && (
                              <span className="text-xxs font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-lg">
                                Return: {order.returnStatus}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 2. MY WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className="text-sm font-black text-slate-805 uppercase tracking-wider">My Wishlist</h2>

              {wishlist.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-100">
                  <Heart className="h-8 w-8 text-slate-305 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-medium">Your wishlist is empty.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {wishlist.map((product) => {
                    const price = parseFloat(product.price);
                    const discount = parseFloat(product.discount || 0);
                    const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;

                    return (
                      <div
                        key={product.id}
                        className="flex overflow-hidden rounded-2xl border border-slate-100 bg-white p-3 gap-3.5 items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <img src={product.images[0]} alt={product.name} className="h-16 w-16 object-cover rounded-xl bg-slate-50 shrink-0" />
                          <div>
                            <h3 className="text-xs font-bold text-slate-800 line-clamp-1">{product.name}</h3>
                            <span className="text-xs font-black text-slate-900 mt-1 block">${finalPrice.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5 shrink-0">
                          {product.stock > 0 ? (
                            <button
                              onClick={() => addToCart(product)}
                              className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white transition-colors"
                            >
                              <ShoppingCart className="h-4 w-4" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-rose-500 font-bold bg-rose-50 px-1.5 py-0.5 rounded">OOS</span>
                          )}
                          <button
                            onClick={() => toggleWishlist(product)}
                            className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-550 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 3. SAVED ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-805 uppercase tracking-wider">Saved Addresses</h2>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xxs font-bold text-white bg-indigo-600 hover:bg-indigo-750 rounded-xl transition-all shadow-sm"
                >
                  <Plus className="h-3 w-3" /> Add Address
                </button>
              </div>

              {/* Address Form modal/drawer */}
              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4 max-w-md">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">New Delivery Coordinates</h3>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={newAddress.name}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, name: e.target.value }))}
                      className="col-span-2 h-9 px-3 rounded-lg border border-slate-200 bg-white"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="10-Digit Phone"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                      className="col-span-2 h-9 px-3 rounded-lg border border-slate-200 bg-white"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Street, Area Address"
                      value={newAddress.address}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, address: e.target.value }))}
                      className="col-span-2 h-9 px-3 rounded-lg border border-slate-200 bg-white"
                      required
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                      className="h-9 px-3 rounded-lg border border-slate-200 bg-white"
                      required
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                      className="h-9 px-3 rounded-lg border border-slate-200 bg-white"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Pincode"
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, pincode: e.target.value }))}
                      className="h-9 px-3 rounded-lg border border-slate-200 bg-white"
                      maxLength="6"
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 h-9 bg-indigo-600 hover:bg-indigo-750 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      Save Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="flex-1 h-9 bg-slate-200 hover:bg-slate-300 text-slate-650 rounded-lg text-xs font-bold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Saved Addresses grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((a) => (
                  <div
                    key={a.id}
                    className="border border-slate-100 rounded-2xl p-4 bg-white flex justify-between items-start shadow-sm"
                  >
                    <div className="text-xxs text-slate-500 font-semibold space-y-1">
                      <p className="text-xs font-bold text-slate-800">{a.name}</p>
                      <p>{a.address}</p>
                      <p>{a.city}, {a.state} - {a.pincode}</p>
                      <p className="pt-1">Phone: {a.phone}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteAddress(a.id)}
                      className="p-1 rounded bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors"
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. ACCOUNT SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-md">
              <h2 className="text-sm font-black text-slate-805 uppercase tracking-wider">Account Configurations</h2>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address (Locked)</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full text-xs h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs h-10 px-3 rounded-xl border border-slate-205 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs h-10 px-3 rounded-xl border border-slate-205 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="h-10 px-6 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-100"
                >
                  <Save className="h-4 w-4" /> Save Modifications
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-40">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-650 border-t-transparent rounded-full"></div>
      </div>
    }>
      <ProfilePageContent />
    </Suspense>
  );
}
