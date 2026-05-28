import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { isFirebaseConfigured, auth, db } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy
} from 'firebase/firestore';

// Key for local storage auth state
const STORAGE_KEY = 'ecommerce_auth_user';
const USERS_DB_KEY = 'ecommerce_mock_users';

// Predefined mock users
const DEFAULT_MOCK_USERS = [
  {
    id: 'mock-admin-uuid',
    name: 'Admin Architect',
    email: 'admin@ecommerce.com',
    phone: '+919876543210',
    role: 'admin',
    createdAt: new Date().toISOString(),
    password: 'admin123' // Only for mock auth check
  },
  {
    id: 'mock-customer-uuid',
    name: 'John Doe',
    email: 'customer@ecommerce.com',
    phone: '+919999988888',
    role: 'customer',
    createdAt: new Date().toISOString(),
    password: 'customer123' // Only for mock auth check
  }
];

// Helper to initialize mock users in localStorage if not exists
const getMockUsers = () => {
  if (typeof window === 'undefined') return DEFAULT_MOCK_USERS;
  const stored = localStorage.getItem(USERS_DB_KEY);
  if (!stored) {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(DEFAULT_MOCK_USERS));
    return DEFAULT_MOCK_USERS;
  }
  return JSON.parse(stored);
};

export const authService = {
  isMock: !isSupabaseConfigured && !isFirebaseConfigured,

  async signUp(email, password, name, phone) {
    if (isFirebaseConfigured) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        const userDoc = {
          id: user.uid,
          name,
          email,
          phone: phone || '',
          role: 'customer',
          createdAt: new Date().toISOString()
        };
        
        await setDoc(doc(db, 'users', user.uid), userDoc);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userDoc));
        return userDoc;
      } catch (err) {
        console.error('Firebase Auth signup error:', err);
        if (err.code === 'auth/configuration-not-found') {
          throw new Error('Firebase Authentication is not fully configured. Please enable the "Email/Password" sign-in method in your Firebase Console under Build > Authentication > Sign-in method.');
        }
        if (err.message && (err.message.includes('offline') || err.message.includes('Failed to get document') || err.code === 'unavailable')) {
          throw new Error('Failed to connect to Firestore Database. Please ensure you have created/enabled the "Cloud Firestore Database" in your Firebase Console under Build > Firestore Database.');
        }
        throw err;
      }
    } else if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          options: {
            data: {
              name,
              phone,
              role: 'customer', // Default role in Supabase
            }
          }
        }
      });
      if (error) throw error;

      // Create record in our public users table
      if (data?.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              name,
              email,
              phone,
              role: 'customer'
            }
          ]);
        if (profileError) console.error('Error creating profile:', profileError);
      }
      return data.user;
    } else {
      // Mock flow
      const users = getMockUsers();
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('User already exists');
      }

      const newUser = {
        id: `mock-uuid-${Math.random().toString(36).substr(2, 9)}`,
        name,
        email,
        phone,
        role: 'customer',
        createdAt: new Date().toISOString(),
        password // Save password in plain text for mock login verification
      };

      users.push(newUser);
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));

      // Auto sign in
      const sessionUser = { ...newUser };
      delete sessionUser.password;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
      return sessionUser;
    }
  },

  async signIn(email, password) {
    if (isFirebaseConfigured) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        let profile = null;
        if (userDocSnap.exists()) {
          profile = userDocSnap.data();
        } else {
          // Fallback profile if it doesn't exist yet
          profile = {
            id: user.uid,
            email: user.email,
            name: user.displayName || 'Customer',
            phone: user.phoneNumber || '',
            role: 'customer',
            createdAt: new Date().toISOString()
          };
          await setDoc(userDocRef, profile);
        }
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        return profile;
      } catch (err) {
        console.error('Firebase Auth signin error:', err);
        if (err.code === 'auth/configuration-not-found') {
          throw new Error('Firebase Authentication is not fully configured. Please enable the "Email/Password" sign-in method in your Firebase Console under Build > Authentication > Sign-in method.');
        }
        if (err.message && (err.message.includes('offline') || err.message.includes('Failed to get document') || err.code === 'unavailable')) {
          throw new Error('Failed to connect to Firestore Database. Please ensure you have created/enabled the "Cloud Firestore Database" in your Firebase Console under Build > Firestore Database.');
        }
        throw err;
      }
    } else if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;

      // Get profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        // Fallback if public profile was not created yet
        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || 'Customer',
          role: data.user.user_metadata?.role || 'customer'
        };
      }
      return profile;
    } else {
      // Mock flow
      const users = getMockUsers();
      const user = users.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (!user) {
        throw new Error('Invalid email or password');
      }

      const sessionUser = { ...user };
      delete sessionUser.password;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
      return sessionUser;
    }
  },

  async signOut() {
    if (isFirebaseConfigured) {
      await firebaseSignOut(auth);
      localStorage.removeItem(STORAGE_KEY);
    } else if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  },

  async getCurrentUser() {
    if (isFirebaseConfigured) {
      if (auth.currentUser) {
        const userDocSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDocSnap.exists()) {
          return userDocSnap.data();
        }
      }
      if (typeof window === 'undefined') return null;
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } else if (isSupabaseConfigured) {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        return {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || 'Customer',
          role: user.user_metadata?.role || 'customer'
        };
      }
      return profile;
    } else {
      // Mock flow
      if (typeof window === 'undefined') return null;
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    }
  },

  async updateProfile(name, phone, role = null) {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) throw new Error('No authenticated user');

    if (isFirebaseConfigured) {
      const updates = { name, phone };
      if (role) updates.role = role;

      await updateDoc(doc(db, 'users', currentUser.id), updates);
      const updated = { ...currentUser, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } else if (isSupabaseConfigured) {
      const updates = { name, phone };
      if (role) updates.role = role;

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', currentUser.id);

      if (error) throw error;
      return { ...currentUser, ...updates };
    } else {
      // Mock flow
      const users = getMockUsers();
      const updatedUsers = users.map(u => {
        if (u.id === currentUser.id) {
          const updated = { ...u, name, phone };
          if (role) updated.role = role;
          return updated;
        }
        return u;
      });

      localStorage.setItem(USERS_DB_KEY, JSON.stringify(updatedUsers));
      
      const updatedSessionUser = updatedUsers.find(u => u.id === currentUser.id);
      const sessionUser = { ...updatedSessionUser };
      delete sessionUser.password;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
      return sessionUser;
    }
  },

  async resetPassword(email) {
    if (isFirebaseConfigured) {
      await sendPasswordResetEmail(auth, email);
      return true;
    } else if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    } else {
      // Mock flow
      const users = getMockUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        throw new Error('No user found with this email address');
      }
      return true;
    }
  },

  async signInWithGoogle() {
    if (isFirebaseConfigured) {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        let profile = null;
        if (userDocSnap.exists()) {
          profile = userDocSnap.data();
        } else {
          profile = {
            id: user.uid,
            name: user.displayName || 'Google User',
            email: user.email,
            phone: user.phoneNumber || '',
            role: 'customer',
            createdAt: new Date().toISOString()
          };
          await setDoc(userDocRef, profile);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        return profile;
      } catch (err) {
        console.error('Firebase Auth Google error:', err);
        if (err.code === 'auth/unauthorized-domain') {
          throw new Error('Unauthorized Domain: Please add your Netlify domain to the "Authorized Domains" list in your Firebase Console under Authentication > Settings.');
        }
        if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') {
          throw new Error('Google Sign-in was cancelled or closed before completion. Please try again.');
        }
        if (err.code === 'auth/configuration-not-found') {
          throw new Error('Firebase Authentication Google Provider is not fully configured. Please enable the "Google" sign-in provider in your Firebase Console under Build > Authentication > Sign-in method.');
        }
        if (err.message && (err.message.includes('offline') || err.message.includes('Failed to get document') || err.code === 'unavailable')) {
          throw new Error('Failed to connect to Firestore Database. Please ensure you have created/enabled the "Cloud Firestore Database" in your Firebase Console under Build > Firestore Database.');
        }
        throw err;
      }
    } else if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      if (error) throw error;
    } else {
      // Mock login as Google Customer
      const googleMock = {
        id: 'mock-google-user-uuid',
        name: 'Google User',
        email: 'googleuser@gmail.com',
        phone: '',
        role: 'customer',
        createdAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(googleMock));
      return googleMock;
    }
  },

  async getAllCustomers() {
    if (isFirebaseConfigured) {
      try {
        const q = query(
          collection(db, 'users'),
          where('role', '==', 'customer'),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        const list = [];
        snap.forEach(doc => {
          list.push(doc.data());
        });
        return list;
      } catch (err) {
        console.warn('Firestore index not ready, querying flat collection:', err);
        const q = query(collection(db, 'users'), where('role', '==', 'customer'));
        const snap = await getDocs(q);
        const list = [];
        snap.forEach(doc => {
          list.push(doc.data());
        });
        return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    } else if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'customer')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } else {
      if (typeof window === 'undefined') return DEFAULT_MOCK_USERS.filter(u => u.role === 'customer');
      const users = JSON.parse(localStorage.getItem('ecommerce_mock_users') || '[]');
      return users.filter(u => u.role === 'customer');
    }
  }
};

