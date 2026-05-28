import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { isFirebaseConfigured, db } from '@/lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';

const REVIEWS_DB_KEY = 'ecommerce_mock_reviews';

const DEFAULT_MOCK_REVIEWS = [
  {
    id: 'rev-1',
    productId: 'prod-1',
    userId: 'mock-customer-uuid',
    userName: 'John Doe',
    rating: 5,
    comment: 'These are the best ANC headphones I have ever owned. The noise cancellation is next level and the acoustic transparency feels completely natural. Sound stage is incredibly wide. Highly recommended!',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'rev-2',
    productId: 'prod-1',
    userId: 'mock-user-2',
    userName: 'Emily Watson',
    rating: 4,
    comment: 'The audio profile is very balanced and warm, perfect for classical and jazz. Battery life is stellar. My only minor complaint is that the headband starts feeling a bit heavy after 4-5 hours of continuous use.',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'rev-3',
    productId: 'prod-2',
    userId: 'mock-user-3',
    userName: 'Marcus Aurelius',
    rating: 5,
    comment: 'An absolute masterpiece of mechanical engineering. The keystrokes feel unbelievably smooth with the hot-swappable switches, and the metal case weighs a ton, meaning it does not slip on the desk. Worth every single penny.',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'rev-4',
    productId: 'prod-3',
    userId: 'mock-user-4',
    userName: 'James Bond',
    rating: 5,
    comment: 'Elegant, timeless, and remarkably accurate. The open-heart sapphire back is a work of art. I wear it daily and get compliments constantly.',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const getMockReviews = () => {
  if (typeof window === 'undefined') return DEFAULT_MOCK_REVIEWS;
  const stored = localStorage.getItem(REVIEWS_DB_KEY);
  if (!stored) {
    localStorage.setItem(REVIEWS_DB_KEY, JSON.stringify(DEFAULT_MOCK_REVIEWS));
    return DEFAULT_MOCK_REVIEWS;
  }
  return JSON.parse(stored);
};

export const reviewService = {
  isMock: !isSupabaseConfigured && !isFirebaseConfigured,

  async getReviews(productId) {
    if (isFirebaseConfigured) {
      try {
        const q = query(
          collection(db, 'reviews'),
          where('productId', '==', productId),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        const list = [];
        snap.forEach(doc => {
          list.push({ id: doc.id, ...doc.data() });
        });
        return list;
      } catch (err) {
        console.warn('Firestore index not ready, querying flat collection:', err);
        const q = query(collection(db, 'reviews'), where('productId', '==', productId));
        const snap = await getDocs(q);
        const list = [];
        snap.forEach(doc => {
          list.push({ id: doc.id, ...doc.data() });
        });
        return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    } else if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, users(name)')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      
      return data.map(r => ({
        id: r.id,
        productId: r.product_id,
        userId: r.user_id,
        userName: r.users?.name || 'Customer',
        rating: r.rating,
        comment: r.comment,
        createdAt: r.created_at
      }));
    } else {
      const reviews = getMockReviews();
      return reviews.filter(r => r.productId === productId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },

  async addReview(productId, userId, userName, rating, comment) {
    if (isFirebaseConfigured) {
      const colRef = collection(db, 'reviews');
      const newReview = {
        productId,
        userId,
        userName,
        rating: parseInt(rating),
        comment,
        createdAt: new Date().toISOString()
      };
      const docRef = doc(colRef);
      await setDoc(docRef, newReview);
      return { id: docRef.id, ...newReview };
    } else if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('reviews')
        .insert([
          {
            product_id: productId,
            user_id: userId,
            rating: parseInt(rating),
            comment
          }
        ])
        .select();
      if (error) throw error;
      return {
        id: data[0].id,
        productId: data[0].product_id,
        userId: data[0].user_id,
        userName,
        rating: data[0].rating,
        comment: data[0].comment,
        createdAt: data[0].created_at
      };
    } else {
      const reviews = getMockReviews();
      const newReview = {
        id: `rev-${Math.random().toString(36).substr(2, 9)}`,
        productId,
        userId,
        userName,
        rating: parseInt(rating),
        comment,
        createdAt: new Date().toISOString()
      };
      reviews.push(newReview);
      localStorage.setItem(REVIEWS_DB_KEY, JSON.stringify(reviews));
      return newReview;
    }
  },

  async deleteReview(id) {
    if (isFirebaseConfigured) {
      await deleteDoc(doc(db, 'reviews', id));
      return true;
    } else if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } else {
      const reviews = getMockReviews();
      const filtered = reviews.filter(r => r.id !== id);
      localStorage.setItem(REVIEWS_DB_KEY, JSON.stringify(filtered));
      return true;
    }
  },

  async getAllReviews() {
    if (isFirebaseConfigured) {
      const snap = await getDocs(collection(db, 'reviews'));
      const reviews = [];
      snap.forEach(doc => {
        reviews.push({ id: doc.id, ...doc.data() });
      });

      const populated = [];
      for (const r of reviews) {
        let productName = 'Product';
        try {
          const prodSnap = await getDoc(doc(db, 'products', r.productId));
          if (prodSnap.exists()) {
            productName = prodSnap.data().name;
          }
        } catch (e) {
          // Ignore
        }
        populated.push({ ...r, productName });
      }
      return populated.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, users(name), products(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(r => ({
        id: r.id,
        productId: r.product_id,
        productName: r.products?.name || 'Product',
        userId: r.user_id,
        userName: r.users?.name || 'Customer',
        rating: r.rating,
        comment: r.comment,
        createdAt: r.created_at
      }));
    } else {
      const reviews = getMockReviews();
      const products = JSON.parse(localStorage.getItem('ecommerce_mock_products') || '[]');
      return reviews.map(r => {
        const prod = products.find(p => p.id === r.productId);
        return {
          ...r,
          productName: prod ? prod.name : 'Product'
        };
      }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }
};

