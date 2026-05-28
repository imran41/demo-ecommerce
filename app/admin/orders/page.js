'use client';

import React, { useEffect, useState } from 'react';
import { orderService } from '@/services/orderService';
import { useStore } from '@/context/StoreContext';
import { 
  ShoppingCart, RefreshCw, CheckCircle, XCircle, 
  MapPin, Phone, Mail, DollarSign, Calendar
} from 'lucide-react';

export default function AdminOrdersPage() {
  const { showToast } = useStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const all = await orderService.getAllOrders();
      setOrders(all);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
      showToast('Error loading orders.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      showToast(`Order status updated to "${newStatus}".`, 'success');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, orderStatus: newStatus }));
      }
    } catch (err) {
      showToast('Failed to update status.', 'error');
    }
  };

  const handleReturnAction = async (orderId, action) => {
    // action is 'Approved', 'Rejected', or 'Completed'
    try {
      const updated = await orderService.handleReturnRequest(orderId, action);
      showToast(`Return request ${action.toLowerCase()}.`, 'success');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, ...updated }));
      }
    } catch (e) {
      showToast('Failed to process return request.', 'error');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await orderService.cancelOrder(orderId);
      showToast('Order cancelled.', 'info');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: 'Cancelled', paymentStatus: 'failed' } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, orderStatus: 'Cancelled', paymentStatus: 'failed' }));
      }
    } catch (err) {
      showToast('Failed to cancel order.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Order Fulfilment</h1>
          <p className="text-xxs text-slate-400 font-semibold mt-1">Dispatch shipments, update delivery progress and moderate refund requests</p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 text-[10px] font-bold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Log
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Orders list */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin h-7 w-7 border-3 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl text-slate-500 text-xs">
              No orders found in database.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => {
                const isSelected = selectedOrder?.id === ord.id;
                const isReturnRequested = ord.returnStatus === 'Requested';

                return (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className={`p-5 rounded-3xl border transition-all cursor-pointer bg-slate-900 ${
                      isSelected 
                        ? 'border-indigo-600 shadow-lg shadow-indigo-950/20' 
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-wrap gap-4 items-center justify-between text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-3">
                      <span className="text-white font-black text-xs">ID: {ord.id}</span>
                      <span>
                        {new Date(ord.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                        ord.orderStatus === 'Delivered'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : ord.orderStatus === 'Cancelled'
                            ? 'bg-rose-500/10 text-rose-450 border border-rose-500/20'
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}>
                        {ord.orderStatus}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-white">{ord.userName}</p>
                        <p className="text-xxs text-slate-400 mt-1">
                          {ord.products.length} item{ord.products.length > 1 ? 's' : ''} • {ord.paymentMethod}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-black text-white">${ord.amount.toFixed(2)}</p>
                        {isReturnRequested && (
                          <span className="inline-block mt-1 text-[8px] font-black uppercase text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded animate-pulse">
                            Return requested
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

        {/* Right Column: Detailed View & Actions */}
        <div className="lg:col-span-1">
          {selectedOrder ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm text-slate-350 text-xs">
              
              {/* Receipt Header details */}
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Selected Order</span>
                <h3 className="text-base font-black text-white uppercase tracking-tight mt-0.5">ID: {selectedOrder.id}</h3>
              </div>

              {/* Status Update panel */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block">Modify Order Status</label>
                <div className="relative">
                  <select
                    value={selectedOrder.orderStatus}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    className="w-full appearance-none bg-slate-950 border border-slate-800 rounded-xl px-4 h-10 pr-9 text-xs font-bold text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Packed">Packed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for delivery">Out for delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Return request moderator */}
              {selectedOrder.returnStatus && (
                <div className="bg-amber-950/20 border border-amber-900/40 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xxs font-black text-amber-400 uppercase tracking-wider">Return Moderator</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                    Customer has requested a product return. Current Return Status: <span className="font-bold text-white">{selectedOrder.returnStatus}</span>
                  </p>
                  
                  <div className="flex gap-2">
                    {selectedOrder.returnStatus === 'Requested' && (
                      <>
                        <button
                          onClick={() => handleReturnAction(selectedOrder.id, 'Approved')}
                          className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-705 text-white font-bold text-xxs transition-colors"
                        >
                          Approve Return
                        </button>
                        <button
                          onClick={() => handleReturnAction(selectedOrder.id, 'Rejected')}
                          className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xxs transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {selectedOrder.returnStatus === 'Approved' && (
                      <button
                        onClick={() => handleReturnAction(selectedOrder.id, 'Completed')}
                        className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xxs transition-colors flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Log Return & Refund Paid
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Ordered items details */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Items summary</h4>
                <div className="space-y-2.5">
                  {selectedOrder.products.map((p) => (
                    <div key={p.id} className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-slate-950">
                      <div>
                        <p className="font-bold text-white line-clamp-1 max-w-[150px]">{p.name}</p>
                        <span className="text-[10px] text-slate-500 font-semibold">Qty: {p.quantity} @ ${p.price.toFixed(2)}</span>
                      </div>
                      <span className="font-black text-white">${(p.price * p.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recipient Coordinates details */}
              <div className="space-y-2.5 border-t border-slate-800 pt-4 text-xxs text-slate-400 font-semibold">
                <h4 className="text-[10px] font-bold text-slate-455 uppercase tracking-wider flex items-center gap-1">
                  Delivery coordinates
                </h4>
                <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-950 space-y-1.5">
                  <p className="font-bold text-white text-xs">{selectedOrder.shippingAddress.name}</p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-slate-500" /> {selectedOrder.shippingAddress.phone}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Mail className="h-3 w-3 text-slate-500" /> {selectedOrder.userEmail}
                  </p>
                  <p className="flex items-start gap-1.5 pt-1 border-t border-slate-900 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-500 mt-0.5 shrink-0" />
                    <span>
                      {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                    </span>
                  </p>
                </div>
              </div>

              {/* Danger Actions: Cancel Order */}
              {selectedOrder.orderStatus !== 'Cancelled' && selectedOrder.orderStatus !== 'Delivered' && (
                <div className="border-t border-slate-800 pt-4">
                  <button
                    onClick={() => handleCancelOrder(selectedOrder.id)}
                    className="w-full py-2.5 rounded-xl bg-rose-950/30 hover:bg-rose-950/50 border border-rose-900/30 text-rose-400 font-bold text-xxs transition-colors"
                  >
                    Cancel Purchase & Fail Transaction
                  </button>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-slate-500 text-xs shadow-sm">
              Select an order card to review shipping logs, address coordinates and issue refunds.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
