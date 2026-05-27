'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { productService } from '@/services/productService';
import { reviewService } from '@/services/reviewService';
import ProductCard from '@/components/ProductCard';
import { ProductDetailsSkeleton } from '@/components/SkeletonLoader';
import { 
  Heart, ShoppingCart, Minus, Plus, Star, Check, 
  AlertTriangle, ArrowLeft, Send, Trash2 
} from 'lucide-react';

export default function ProductDetailsPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { id } = params;

  const { user, addToCart, toggleWishlist, isInWishlist, showToast } = useStore();

  // State
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gallery
  const [selectedImage, setSelectedImage] = useState('');

  // Purchase quantity
  const [qty, setQty] = useState(1);

  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const prod = await productService.getProductById(id);
        setProduct(prod);
        setSelectedImage(prod.images[0]);
        setQty(1);

        // Fetch reviews
        const revs = await reviewService.getReviews(id);
        setReviews(revs);

        // Fetch related products
        const allProds = await productService.getProducts({ category: prod.category });
        setRelatedProducts(allProds.filter(p => p.id !== id).slice(0, 4));
      } catch (err) {
        console.error('Error fetching product details:', err);
        showToast('Product not found.', 'error');
        router.push('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  if (loading || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <ProductDetailsSkeleton />
      </div>
    );
  }

  // Math
  const price = parseFloat(product.price);
  const discount = parseFloat(product.discount || 0);
  const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;

  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock === 0;
  const isFav = isInWishlist(product.id);

  const handleQtyChange = (val) => {
    const newQty = qty + val;
    if (newQty >= 1 && newQty <= product.stock) {
      setQty(newQty);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, qty);
  };

  const handleBuyNow = () => {
    addToCart(product, qty);
    router.push('/cart');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please log in to submit a review.', 'error');
      router.push('/login');
      return;
    }
    if (!comment.trim()) {
      showToast('Please write a comment.', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      const newRev = await reviewService.addReview(
        product.id,
        user.id,
        user.name,
        rating,
        comment
      );
      setReviews(prev => [newRev, ...prev]);
      showToast('Review submitted successfully!', 'success');
      setComment('');
      setRating(5);
    } catch (err) {
      showToast('Failed to submit review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await reviewService.deleteReview(reviewId);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      showToast('Review deleted.', 'info');
    } catch (err) {
      showToast('Failed to delete review.', 'error');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-16">
      
      {/* Back Link */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-805"
        >
          <ArrowLeft className="h-4 w-4" /> Back to listings
        </button>
      </div>

      {/* Main product view split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        
        {/* Left: Interactive Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm">
            <img src={selectedImage} alt={product.name} className="h-full w-full object-cover" />
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 justify-center">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  className={`h-16 w-16 rounded-xl overflow-hidden border-2 bg-white ${
                    selectedImage === img ? 'border-indigo-650' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info and selectors */}
        <div className="space-y-6 flex flex-col justify-center">
          <div className="space-y-2">
            <span className="text-xxs font-black text-indigo-600 uppercase tracking-widest">{product.brand}</span>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">{product.name}</h1>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Star className="h-4.5 w-4.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-black text-slate-700">{(product.rating || 4.5).toFixed(1)}</span>
              </div>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs font-semibold text-indigo-650">{reviews.length} Verified Reviews</span>
            </div>
          </div>

          {/* Price reductions */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100/50 flex items-baseline gap-4">
            <span className="text-3xl font-black text-slate-950">${finalPrice.toFixed(2)}</span>
            {discount > 0 && (
              <>
                <span className="text-base font-semibold text-slate-400 line-through">${price.toFixed(2)}</span>
                <span className="text-xxs font-black bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Save {discount}%
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Product Specifications</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{product.description}</p>
          </div>

          {/* Stock Alert status */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Stock Availability:</span>
            {isOutOfStock ? (
              <span className="text-xs font-bold text-rose-650 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                Out of Stock (Request restock alert)
              </span>
            ) : isLowStock ? (
              <span className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
                Running Low (Only {product.stock} items remaining)
              </span>
            ) : (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                In Stock & Ready to Ship
              </span>
            )}
          </div>

          {/* Action buttons */}
          {!isOutOfStock && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-500">Select Qty:</span>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden h-10 bg-white">
                  <button
                    onClick={() => handleQtyChange(-1)}
                    className="p-2.5 text-slate-500 hover:bg-slate-50"
                    disabled={qty <= 1}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="px-4 text-xs font-bold text-slate-800">{qty}</span>
                  <button
                    onClick={() => handleQtyChange(1)}
                    className="p-2.5 text-slate-500 hover:bg-slate-50"
                    disabled={qty >= product.stock}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`h-10 w-10 flex items-center justify-center rounded-xl border transition-colors ${
                    isFav 
                      ? 'bg-rose-50 border-rose-250 text-rose-500' 
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <Heart className={`h-4.5 w-4.5 ${isFav ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Add and Buy Now */}
              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 h-12 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold flex items-center justify-center gap-2 transition-colors border border-indigo-100"
                >
                  <ShoppingCart className="h-4.5 w-4.5" />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-750 text-white font-bold flex items-center justify-center transition-colors shadow-lg shadow-indigo-100"
                >
                  Buy Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews system section */}
      <section className="border-t border-slate-100 pt-12 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Write a Review Panel */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Customer Feedbacks</h2>
            
            {user ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-100/50">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Leave your review</h3>
                
                {/* Rating selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Rating</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="text-amber-400 p-0.5 hover:scale-110 transition-transform"
                      >
                        <Star className={`h-6 w-6 ${star <= rating ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment textarea */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Written Feedback</label>
                  <textarea
                    placeholder="Describe your user experience with this device..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows="4"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                  Submit Review
                </button>
              </form>
            ) : (
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100/50 text-center space-y-3">
                <AlertTriangle className="h-6 w-6 text-amber-500 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Please sign in to write a verified customer feedback log.</p>
                <button
                  onClick={() => router.push('/login')}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-750 rounded-xl transition-colors"
                >
                  Log In
                </button>
              </div>
            )}
          </div>

          {/* Reviews list */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Reviews ({reviews.length})</h3>
            
            {reviews.length === 0 ? (
              <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-400 font-medium">No reviews yet for this product. Be the first to leave a feedback!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="border-b border-slate-100 pb-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{rev.userName}</h4>
                        <div className="flex gap-0.5 mt-0.5">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(rev.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        
                        {/* Can delete review if user is admin, or is the author of review */}
                        {user && (user.role === 'admin' || user.id === rev.userId) && (
                          <button
                            onClick={() => handleDeleteReview(rev.id)}
                            className="p-1 rounded bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products widget */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-slate-100 pt-12 space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Related Products</h2>
            <p className="text-xs text-slate-400 font-semibold mt-1">Similar premium digital equipment in {product.category}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onQuickView={() => router.push(`/product/${p.id}`)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
