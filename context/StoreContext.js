'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import { wishlistService } from '@/services/wishlistService';

const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
  // Auth state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Cart state
  const [cart, setCart] = useState([]);
  
  // Coupon / Pricing state
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0); // percentage

  // Wishlist state
  const [wishlist, setWishlist] = useState([]);

  // Toast Notification state
  const [toasts, setToasts] = useState([]);

  // Load initial states from localStorage or API
  useEffect(() => {
    const initializeStore = async () => {
      try {
        // 1. Get current auth user
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);

        // 2. Load Cart from localStorage
        const storedCart = localStorage.getItem('ecommerce_cart');
        if (storedCart) {
          setCart(JSON.parse(storedCart));
        }

        // 3. Load Wishlist from DB or localStorage
        if (currentUser) {
          const userWishlist = await wishlistService.getWishlist(currentUser.id);
          setWishlist(userWishlist);
        } else {
          const storedWishlist = localStorage.getItem('ecommerce_mock_wishlist_client');
          if (storedWishlist) {
            setWishlist(JSON.parse(storedWishlist));
          }
        }
      } catch (err) {
        console.error('Error initializing store:', err);
      } finally {
        setAuthLoading(false);
      }
    };

    initializeStore();
  }, []);

  // Save cart to localStorage on changes
  useEffect(() => {
    localStorage.setItem('ecommerce_cart', JSON.stringify(cart));
  }, [cart]);

  // Synchronise Wishlist to localStorage for guests
  useEffect(() => {
    if (!user) {
      localStorage.setItem('ecommerce_mock_wishlist_client', JSON.stringify(wishlist));
    }
  }, [wishlist, user]);

  // Sync wishlist when user logs in
  const syncWishlistOnLogin = async (loggedUser) => {
    try {
      const dbWishlist = await wishlistService.getWishlist(loggedUser.id);
      
      // If there were guest wishlist items, add them to DB
      const guestWish = JSON.parse(localStorage.getItem('ecommerce_mock_wishlist_client') || '[]');
      if (guestWish.length > 0) {
        for (const item of guestWish) {
          await wishlistService.addToWishlist(loggedUser.id, item.id);
        }
        // Fetch updated
        const updatedDbWishlist = await wishlistService.getWishlist(loggedUser.id);
        setWishlist(updatedDbWishlist);
        localStorage.removeItem('ecommerce_mock_wishlist_client');
      } else {
        setWishlist(dbWishlist);
      }
    } catch (e) {
      console.error('Error syncing wishlist:', e);
    }
  };

  // Toast handler
  const showToast = (message, type = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth Operations
  const login = async (email, password) => {
    setAuthLoading(true);
    try {
      const loggedUser = await authService.signIn(email, password);
      setUser(loggedUser);
      showToast(`Welcome back, ${loggedUser.name}!`, 'success');
      await syncWishlistOnLogin(loggedUser);
      return loggedUser;
    } catch (error) {
      showToast(error.message || 'Login failed', 'error');
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const signup = async (email, password, name, phone) => {
    setAuthLoading(true);
    try {
      const newUser = await authService.signUp(email, password, name, phone);
      setUser(newUser);
      showToast('Registration successful! Welcome to Apex E-Store.', 'success');
      return newUser;
    } catch (error) {
      showToast(error.message || 'Signup failed', 'error');
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    setAuthLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setWishlist([]);
      setCouponCode('');
      setCouponDiscount(0);
      showToast('Logged out successfully.', 'info');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } catch (error) {
      showToast('Logout failed', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const updateProfile = async (name, phone) => {
    try {
      const updatedUser = await authService.updateProfile(name, phone);
      setUser(updatedUser);
      showToast('Profile updated successfully!', 'success');
      return updatedUser;
    } catch (error) {
      showToast(error.message || 'Update profile failed', 'error');
      throw error;
    }
  };

  // Cart Operations
  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      
      // Calculate discounted price
      const price = parseFloat(product.price);
      const discount = parseFloat(product.discount || 0);
      const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;

      if (existingItem) {
        // Check stock limit
        const newQty = existingItem.quantity + quantity;
        if (newQty > product.stock) {
          showToast(`Cannot add more items. Only ${product.stock} left in stock.`, 'error');
          return prevCart;
        }
        showToast(`Updated ${product.name} quantity to ${newQty}.`, 'success');
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        if (quantity > product.stock) {
          showToast(`Cannot add item. Only ${product.stock} left in stock.`, 'error');
          return prevCart;
        }
        showToast(`Added ${product.name} to cart.`, 'success');
        return [
          ...prevCart,
          {
            id: product.id,
            name: product.name,
            price: finalPrice,
            originalPrice: price,
            discount: discount,
            quantity: quantity,
            image: product.images[0],
            stock: product.stock
          }
        ];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      const item = prevCart.find(i => i.id === productId);
      if (item) {
        showToast(`Removed ${item.name} from cart.`, 'info');
      }
      return prevCart.filter((item) => item.id !== productId);
    });
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === productId) {
          if (quantity > item.stock) {
            showToast(`Only ${item.stock} items available in stock.`, 'error');
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setCouponCode('');
    setCouponDiscount(0);
  };

  // Coupons
  const applyCoupon = (code) => {
    const formattedCode = code.toUpperCase().trim();
    if (formattedCode === 'SAVE10') {
      setCouponCode(formattedCode);
      setCouponDiscount(10);
      showToast('Coupon "SAVE10" applied! 10% discount added.', 'success');
      return true;
    } else if (formattedCode === 'WELCOME20') {
      setCouponCode(formattedCode);
      setCouponDiscount(20);
      showToast('Coupon "WELCOME20" applied! 20% discount added.', 'success');
      return true;
    } else {
      showToast('Invalid coupon code.', 'error');
      return false;
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    showToast('Coupon removed.', 'info');
  };

  // Wishlist Operations
  const toggleWishlist = async (product) => {
    const isFav = wishlist.some((item) => item.id === product.id);

    if (user) {
      try {
        if (isFav) {
          await wishlistService.removeFromWishlist(user.id, product.id);
          setWishlist((prev) => prev.filter((item) => item.id !== product.id));
          showToast(`Removed ${product.name} from wishlist.`, 'info');
        } else {
          await wishlistService.addToWishlist(user.id, product.id);
          setWishlist((prev) => [...prev, product]);
          showToast(`Added ${product.name} to wishlist.`, 'success');
        }
      } catch (err) {
        showToast('Failed to update wishlist', 'error');
      }
    } else {
      // Guest Wishlist (Local state)
      if (isFav) {
        setWishlist((prev) => prev.filter((item) => item.id !== product.id));
        showToast(`Removed ${product.name} from wishlist.`, 'info');
      } else {
        setWishlist((prev) => [...prev, product]);
        showToast(`Added ${product.name} to wishlist.`, 'success');
      }
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  // Cart Calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartDiscount = cartSubtotal * (couponDiscount / 100);
  const cartShipping = cartSubtotal > 500 || cartSubtotal === 0 ? 0 : 50; // free shipping above ₹500
  const cartTax = (cartSubtotal - cartDiscount) * 0.18; // 18% GST standard
  const cartTotal = cartSubtotal - cartDiscount + cartShipping + cartTax;

  return (
    <StoreContext.Provider
      value={{
        user,
        authLoading,
        role: user?.role || 'customer',
        isAdmin: user?.role === 'admin',
        login,
        signup,
        logout,
        updateProfile,

        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        couponCode,
        couponDiscount,
        applyCoupon,
        removeCoupon,
        cartSubtotal,
        cartDiscount,
        cartShipping,
        cartTax,
        cartTotal,

        wishlist,
        toggleWishlist,
        isInWishlist,

        toasts,
        showToast,
        removeToast
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
