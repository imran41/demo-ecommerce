import { supabase, isSupabaseConfigured } from '@/lib/supabase';

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
  isMock: !isSupabaseConfigured,

  async signUp(email, password, name, phone) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            role: 'customer', // Default role in Supabase
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
    if (isSupabaseConfigured) {
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
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  },

  async getCurrentUser() {
    if (isSupabaseConfigured) {
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

    if (isSupabaseConfigured) {
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
    if (isSupabaseConfigured) {
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
      // Just simulate sending email
      return true;
    }
  },

  async signInWithGoogle() {
    if (isSupabaseConfigured) {
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
    if (isSupabaseConfigured) {
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
