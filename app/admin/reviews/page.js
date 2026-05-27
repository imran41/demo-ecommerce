'use client';

import React, { useEffect, useState } from 'react';
import { reviewService } from '@/services/reviewService';
import { useStore } from '@/context/StoreContext';
import { Star, Trash2, ShieldAlert } from 'lucide-react';

export default function AdminReviewsPage() {
  const { showToast } = useStore();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const all = await reviewService.getAllReviews();
      setReviews(all);
    } catch (e) {
      console.error(e);
      showToast('Error loading reviews.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await reviewService.deleteReview(id);
      showToast('Review deleted.', 'info');
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      showToast('Failed to delete review.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Review Moderation</h1>
        <p className="text-xxs text-slate-400 font-semibold mt-1">Moderate user reviews, ratings and comments across all listings</p>
      </div>

      {/* Reviews Table list */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin h-7 w-7 border-3 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-805 rounded-3xl text-slate-500 text-xs">
          No user reviews found in database.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-808 border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-350 border-collapse">
              <thead>
                <tr className="bg-slate-950/40 text-[10px] font-black uppercase tracking-wider text-slate-455 border-b border-slate-805">
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Product</th>
                  <th className="px-6 py-3.5 text-center">Rating</th>
                  <th className="px-6 py-3.5">Comment</th>
                  <th className="px-6 py-3.5 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-805">
                {reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">{rev.userName}</td>
                    <td className="px-6 py-4 font-semibold text-indigo-400 truncate max-w-[150px]">{rev.productName}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-0.5 justify-center">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            className={`h-3 w-3 ${
                              idx < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-[280px]">
                      <p className="line-clamp-2 leading-relaxed text-slate-300 font-semibold">{rev.comment}</p>
                      <span className="text-[9px] text-slate-500 mt-1 block">
                        {new Date(rev.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(rev.id)}
                        className="p-1.5 rounded-lg bg-slate-805 bg-slate-805 bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
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
