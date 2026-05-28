import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { productService } from './productService';
import { isFirebaseConfigured, db } from '@/lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';

const WISHLIST_DB_KEY = 'ecommerce_mock_wishlist';

const getMockWishlist = () => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(WISHLIST_DB_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const wishlistService = {
  isMock: !isSupabaseConfigured && !isFirebaseConfigured,

  async getWishlist(userId) {
    if (isFirebaseConfigured) {
      const q = query(collection(db, 'wishlist'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const wishlistProducts = [];
      for (const docSnapshot of snap.docs) {
        const item = docSnapshot.data();
        try {
          const product = await productService.getProductById(item.productId);
          wishlistProducts.push(product);
        } catch (e) {
          // Ignore deleted product
        }
      }
      return wishlistProducts;
    } else if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('wishlist')
        .select('*, products(*)')
        .eq('user_id', userId);
      if (error) throw error;
      return data.map(w => w.products).filter(Boolean);
    } else {
      const list = getMockWishlist();
      const userList = list.filter(w => w.userId === userId);
      
      const wishlistProducts = [];
      for (const item of userList) {
        try {
          const product = await productService.getProductById(item.productId);
          wishlistProducts.push(product);
        } catch (e) {
          // Ignore
        }
      }
      return wishlistProducts;
    }
  },

  async addToWishlist(userId, productId) {
    if (isFirebaseConfigured) {
      const exists = await this.isInWishlist(userId, productId);
      if (!exists) {
        const docId = `${userId}_${productId}`;
        await setDoc(doc(db, 'wishlist', docId), { userId, productId });
      }
      return true;
    } else if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('wishlist')
        .insert([{ user_id: userId, product_id: productId }])
        .select();
      if (error) {
        if (error.code === '23505') return true;
        throw error;
      }
      return true;
    } else {
      const list = getMockWishlist();
      const exists = list.some(w => w.userId === userId && w.productId === productId);
      if (!exists) {
        list.push({ id: `wish-${Math.random().toString(36).substr(2, 9)}`, userId, productId });
        localStorage.setItem(WISHLIST_DB_KEY, JSON.stringify(list));
      }
      return true;
    }
  },

  async removeFromWishlist(userId, productId) {
    if (isFirebaseConfigured) {
      const docId = `${userId}_${productId}`;
      await deleteDoc(doc(db, 'wishlist', docId));
      return true;
    } else if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);
      if (error) throw error;
      return true;
    } else {
      const list = getMockWishlist();
      const filtered = list.filter(w => !(w.userId === userId && w.productId === productId));
      localStorage.setItem(WISHLIST_DB_KEY, JSON.stringify(filtered));
      return true;
    }
  },

  async isInWishlist(userId, productId) {
    if (!userId) return false;
    if (isFirebaseConfigured) {
      const docId = `${userId}_${productId}`;
      const docSnap = await getDoc(doc(db, 'wishlist', docId));
      return docSnap.exists();
    } else if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId);
      if (error) return false;
      return data.length > 0;
    } else {
      const list = getMockWishlist();
      return list.some(w => w.userId === userId && w.productId === productId);
    }
  }
};

